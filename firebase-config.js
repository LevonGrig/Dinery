const firebaseConfig = {
  apiKey:            "AIzaSyADyxfyxp9DNqrgJmqrCYn_iuGuzzgjQSA",
  authDomain:        "dinery-fca7d.firebaseapp.com",
  projectId:         "dinery-fca7d",
  storageBucket:     "dinery-fca7d.firebasestorage.app",
  messagingSenderId: "917938105134",
  appId:             "1:917938105134:web:3c6152860fce4606b428bf",
  measurementId:     "G-SLFG4S6YH8"
};

firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db   = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
