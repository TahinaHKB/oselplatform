// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// 🔑 Ta configuration Firebase (depuis la console Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyCFEZ3y0-IndIXvWiDCtNnE72BMxovBhhc",
  authDomain: "oselplatform.firebaseapp.com",
  projectId: "oselplatform",
  storageBucket: "oselplatform.firebasestorage.app",
  messagingSenderId: "125834444785",
  appId: "1:125834444785:web:16419d191c54198f874e50",
  measurementId: "G-V5VLX07JG4",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services que tu vas utiliser
export const auth = getAuth(app);      // Authentification
export const db = getFirestore(app);   // Base de données Firestore
export const storage = getStorage(app); // Stockage des images
export const messaging = getMessaging(app);
