// ─────────────────────────────────────────────────────────────
//  STEP 1  Go to console.firebase.google.com
//  STEP 2  Create project → Add web app → copy the config below
//  STEP 3  Authentication → Email/Password → Enable
//  STEP 4  Firestore Database → Create database (test mode)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db   = firebase.firestore();

// Keep the user logged in across browser sessions
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
