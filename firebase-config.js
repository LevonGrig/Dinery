import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc
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
      updatePassword: (pw) => updatePassword(u, pw)
    }) : null;
  },
};

window.db = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => {
        const snap = await getDoc(doc(_db, name, id));
        return { exists: snap.exists(), data: () => snap.data() };
      },
      set: (data, opts) => setDoc(doc(_db, name, id), data, opts || {}),
    }),
  }),
};
