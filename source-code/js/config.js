const firebaseConfig = {
  // Ganti dengan konfigurasi Firebase Anda
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJ_ID",
  storageBucket: "STRG_BUCKET",
  messagingSenderId: "MSG_ID",
  appId: "APP_ID",
  measurementId: "MEA_ID",
  databaseURL:
    "DB_URL",
};

// Init
firebase.initializeApp(firebaseConfig);

// Ref
const database = firebase.database();
const auth = firebase.auth();
