// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// 🔑 Ta configuration Firebase (depuis la console Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDD8cIbN4xaZkKn08FAvRhrv1Lbkdo2JQw",
  authDomain: "platformosel.firebaseapp.com",
  projectId: "platformosel",
  storageBucket: "platformosel.firebasestorage.app",
  messagingSenderId: "267687643639",
  appId: "1:267687643639:web:7feb782d38d9c3322e46f2",
  measurementId: "G-DLYG43HN8M",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services que tu vas utiliser
export const auth = getAuth(app);      // Authentification
export const db = getFirestore(app);   // Base de données Firestore
export const storage = getStorage(app); // Stockage des images
export const messaging = getMessaging(app);
