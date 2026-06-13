import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updatePassword, deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyADyxfyxp9DNqrgJmqrCYn_iuGuzzgjQSA",
  authDomain:        "dinery-fca7d.firebaseapp.com",
  projectId:         "dinery-fca7d",
  storageBucket:     "dinery-fca7d.firebasestorage.app",
  messagingSenderId: "917938105134",
  appId:             "1:917938105134:web:3c6152860fce4606b428bf",
  measurementId:     "G-SLFG4S6YH8"
};

// Must match the Database ID shown in Firebase Console → Firestore Database.
// This project's database was created with the ID "default" — if you ever
// recreate it with the standard ID, change this to "(default)".
const DB_ID = "default";

const app   = initializeApp(firebaseConfig);
const _auth = getAuth(app);
const _db   = getFirestore(app, DB_ID);

setPersistence(_auth, browserLocalPersistence);

// Compat-style wrappers so app.js stays unchanged
window.auth = {
  onAuthStateChanged:             (cb)        => onAuthStateChanged(_auth, cb),
  createUserWithEmailAndPassword: (email, pw) => createUserWithEmailAndPassword(_auth, email, pw),
  signInWithEmailAndPassword:     (email, pw) => signInWithEmailAndPassword(_auth, email, pw),
  signOut:                        ()          => signOut(_auth),
  get currentUser() {
    const u = _auth.currentUser;
    return u ? Object.assign(Object.create(u), {
      updatePassword:    (pw) => updatePassword(u, pw),
      deleteCurrentUser: ()   => deleteUser(u),
    }) : null;
  },
  deleteCurrentUser: () => {
    const u = _auth.currentUser;
    if (!u) throw new Error('No signed-in user');
    return deleteUser(u);
  },
};

window.db = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => {
        const snap = await getDoc(doc(_db, name, id));
        return { exists: snap.exists(), data: () => snap.data() };
      },
      set:    (data, opts) => setDoc(doc(_db, name, id), data, opts || {}),
      delete: ()           => deleteDoc(doc(_db, name, id)),
    }),
  }),
};

// ────────────────────────────────────────────────────────────────────────────
//  HALL CAPACITY STORE  (concurrency-safe seat booking)
//
//  Each hall+date+time slot is one Firestore document under /halls. A booking
//  consumes `seats` (= guest count). Reserving and releasing run inside a
//  Firestore transaction, so two people booking the last tables at the same
//  instant are serialised: the first commits, the second re-reads the updated
//  occupancy and is told the hall is full.
//
//  Forward-compatible: an admin panel later just edits these /halls docs
//  (capacity per slot) — no app code changes needed.
//
//  Every method fails OPEN (returns ok/unknown) if Firestore is unreachable or
//  rules block access, so booking still works; the concurrency guard simply
//  goes inactive until the /halls security rules are published.
// ────────────────────────────────────────────────────────────────────────────
window.hallStore = {
  // Remaining seats for a slot, or null if it can't be determined.
  // Seeds the doc from `meta` (capacity + base occupied) on first access.
  async remaining(key, meta) {
    try {
      const ref  = doc(_db, 'halls', key);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { ...meta });
        return Math.max(0, meta.capacity - meta.occupied);
      }
      const d = snap.data();
      return Math.max(0, d.capacity - d.occupied);
    } catch (e) {
      console.warn('hallStore.remaining failed (guard inactive):', e);
      return null;
    }
  },

  // Atomically reserve `seats`. Returns { ok, remaining }.
  // ok:false means not enough seats left (someone else just took them).
  async reserve(key, meta, seats) {
    try {
      return await runTransaction(_db, async (tx) => {
        const ref  = doc(_db, 'halls', key);
        const snap = await tx.get(ref);
        if (!snap.exists()) {
          const remaining = meta.capacity - meta.occupied;
          if (seats > remaining) return { ok: false, remaining };
          tx.set(ref, { ...meta, occupied: meta.occupied + seats });
          return { ok: true, remaining: remaining - seats };
        }
        const d         = snap.data();
        const remaining = d.capacity - d.occupied;
        if (seats > remaining) return { ok: false, remaining };
        tx.update(ref, { occupied: d.occupied + seats });
        return { ok: true, remaining: remaining - seats };
      });
    } catch (e) {
      console.warn('hallStore.reserve failed (allowing booking):', e);
      return { ok: true, remaining: null, fallback: true };
    }
  },

  // Atomically free `seats` (on cancel / change). Best-effort.
  async release(key, seats) {
    if (!key || !seats) return;
    try {
      await runTransaction(_db, async (tx) => {
        const ref  = doc(_db, 'halls', key);
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const d = snap.data();
        tx.update(ref, { occupied: Math.max(0, d.occupied - seats) });
      });
    } catch (e) {
      console.warn('hallStore.release failed:', e);
    }
  },
};
