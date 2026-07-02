import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updatePassword, deleteUser,
  signInAnonymously, linkWithCredential, EmailAuthProvider,
  GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithPopup,
  signInWithCredential,
  sendPasswordResetEmail, verifyPasswordResetCode, confirmPasswordReset,
  RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, runTransaction,
  collection, getDocs
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
  signInAnonymously:              ()          => signInAnonymously(_auth),
  signOut:                        ()          => signOut(_auth),
  // Social sign-in (Google / Apple). If a guest (anonymous) is signed in we
  // LINK the provider so the same UID + existing reservations are kept;
  // otherwise it's a normal popup sign-in.
  //
  // If that Google/Apple account already has its own separate Dinery account,
  // Firebase refuses the link (auth/credential-already-in-use) — the guest's
  // anonymous data can't be merged into an existing account. In that case we
  // recover by signing straight into the existing account instead of leaving
  // the user stuck on an error.
  signInWithProvider: async (name) => {
    const p = makeProvider(name);
    const cur = _auth.currentUser;
    if (!(cur && cur.isAnonymous)) return signInWithPopup(_auth, p);
    try {
      return await linkWithPopup(cur, p);
    } catch (err) {
      if (err?.code === 'auth/credential-already-in-use') {
        const credential = name === 'apple'
          ? OAuthProvider.credentialFromError(err)
          : GoogleAuthProvider.credentialFromError(err);
        if (credential) return await signInWithCredential(_auth, credential);
      }
      throw err;
    }
  },
  get currentUser() {
    const u = _auth.currentUser;
    return u ? Object.assign(Object.create(u), {
      isAnonymous:       u.isAnonymous,
      updatePassword:    (pw)   => updatePassword(u, pw),
      deleteCurrentUser: ()     => deleteUser(u),
      linkWithCredential:(cred) => linkWithCredential(u, cred),
    }) : null;
  },
  deleteCurrentUser: () => {
    const u = _auth.currentUser;
    if (!u) throw new Error('No signed-in user');
    return deleteUser(u);
  },
  sendPasswordResetEmail: (email, opts) => sendPasswordResetEmail(_auth, email, opts || {}),
  verifyPasswordResetCode: (code)       => verifyPasswordResetCode(_auth, code),
  confirmPasswordReset: (code, pw)      => confirmPasswordReset(_auth, code, pw),
  initRecaptcha: (containerId) => new RecaptchaVerifier(_auth, containerId, { size: 'invisible' }),
  signInWithPhoneNumber: (phone, verifier) => signInWithPhoneNumber(_auth, phone, verifier),
};
window.EmailAuthProvider = EmailAuthProvider;

function makeProvider(name) {
  if (name === 'apple') {
    const p = new OAuthProvider('apple.com');
    p.addScope('email'); p.addScope('name');
    return p;
  }
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
}

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
//  RESTAURANT STORE  (admin-editable restaurant settings)
//
//  /restaurants/{id} documents hold admin overrides — currently maxTableWaste
//  (and, when seeded, halls/tables). The app reads these on startup and merges
//  them over its built-in defaults. Reads are public (rules), writes admin-only.
// ────────────────────────────────────────────────────────────────────────────
window.restaurantStore = {
  // Returns an array of { id, ...data } for every restaurant doc, or null on error.
  async all() {
    try {
      const snap = await getDocs(collection(_db, 'restaurants'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('restaurantStore.all failed:', e);
      return null;
    }
  },

  // Merge-write a restaurant's settings (admin only). Returns { ok }.
  async update(id, data) {
    try {
      await setDoc(doc(_db, 'restaurants', String(id)), data, { merge: true });
      return { ok: true };
    } catch (e) {
      console.error('restaurantStore.update failed:', e);
      return { ok: false, error: e?.code || e?.message || String(e) };
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
//  USER STORE  (admin-only cross-user access — powers the check-in panel)
//
//  Firestore rules let an admin's own doc (admin == true) read AND write every
//  /users/{uid} document, not just its own. `all()` lists every user (their
//  reservations included) so the admin panel can build a "today's check-ins"
//  view across all guests/accounts; `updateReservations()` lets it patch a
//  single reservation's status (e.g. mark arrived) on someone else's doc.
//  Both fail closed (return null / {ok:false}) for non-admins — the query
//  itself is rejected by the rules before any data reaches the client.
// ────────────────────────────────────────────────────────────────────────────
window.userStore = {
  // Returns an array of { uid, ...data } for every user doc, or null on error
  // (e.g. the caller isn't an admin, so the rules reject the whole query).
  async all() {
    try {
      const snap = await getDocs(collection(_db, 'users'));
      return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    } catch (e) {
      console.warn('userStore.all failed:', e);
      return null;
    }
  },

  // Merge-write another user's reservations array (admin only). Returns { ok }.
  async setReservations(uid, reservations) {
    try {
      await setDoc(doc(_db, 'users', uid), { reservations }, { merge: true });
      return { ok: true };
    } catch (e) {
      console.error('userStore.setReservations failed:', e);
      return { ok: false, error: e?.code || e?.message || String(e) };
    }
  },
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

// ────────────────────────────────────────────────────────────────────────────
//  TABLE STORE  (specific-table booking)
//
//  Each booked table is one document under /slots, keyed deterministically by
//  restaurant + hall + table + date + time. A document's existence means that
//  table is taken for that slot. Claims run in a transaction so two guests can
//  never grab the same table at the same instant.
//
//  Like hallStore, every method fails OPEN (allows the booking) if Firestore is
//  unreachable or rules block access — e.g. a not-signed-in guest — so booking
//  keeps working; the double-booking guard simply goes inactive in that case.
// ────────────────────────────────────────────────────────────────────────────
window.tableStore = {
  _slotId(rid, hall, table, date, time) {
    return `${rid}__${hall}__${table}__${date}__${time}`.replace(/[:\s]/g, '');
  },

  // Returns a Set of the tableIds (from `tableIds`) already booked for this
  // restaurant/hall/date/time, or null if it can't be determined.
  async bookedSet(rid, hall, date, time, tableIds) {
    try {
      const booked = new Set();
      await Promise.all((tableIds || []).map(async (tid) => {
        const snap = await getDoc(doc(_db, 'slots', this._slotId(rid, hall, tid, date, time)));
        if (snap.exists()) booked.add(tid);
      }));
      return booked;
    } catch (e) {
      console.warn('tableStore.bookedSet failed (guard inactive):', e);
      return null;
    }
  },

  // Atomically claim a table. { ok:true } on success, { ok:false, taken:true }
  // if someone already has it, or { ok:true, fallback:true } if the guard is
  // inactive (offline / rules block) so the booking still goes through.
  async claim(rid, hall, table, date, time, payload) {
    const id = this._slotId(rid, hall, table, date, time);
    try {
      return await runTransaction(_db, async (tx) => {
        const ref  = doc(_db, 'slots', id);
        const snap = await tx.get(ref);
        if (snap.exists()) return { ok: false, taken: true };
        tx.set(ref, { ...payload, createdAt: Date.now() });
        return { ok: true };
      });
    } catch (e) {
      console.warn('tableStore.claim failed (allowing booking):', e);
      return { ok: true, fallback: true };
    }
  },

  // Free a table (on cancel / change). Best-effort.
  async release(rid, hall, table, date, time) {
    if ((rid == null) || !hall || !table) return;
    try {
      await deleteDoc(doc(_db, 'slots', this._slotId(rid, hall, table, date, time)));
    } catch (e) {
      console.warn('tableStore.release failed:', e);
    }
  },
};
