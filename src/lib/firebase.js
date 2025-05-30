// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth"; 
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  doc, 
  setDoc,
  getDocs,
  getDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMNLj7BMa1Q3WH4EKnoZOFHtmXqnvZRpU",
  authDomain: "chat-web-99c78.firebaseapp.com",
  projectId: "chat-web-99c78",
  storageBucket: "chat-web-99c78.firebasestorage.app",
  messagingSenderId: "800183019236",
  appId: "1:800183019236:web:0ad59e972dc79d3d8f6ef1"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const upsertUserDocument = async (user) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);

  try {
    // Usamos merge: true para no sobrescribir datos existentes si el usuario ya tiene un documento
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      // Usa el displayName de Firebase Auth, si no, toma la parte antes del @ del email, si no, "Usuario Desconocido"
      displayName: user.displayName || user.email?.split('@')[0] || 'Usuario Desconocido',
      photoURL: user.photoURL || null,
      // Intenta usar el creationTime de Auth si está disponible, si no, usa serverTimestamp
      createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp(),
      // Agrega la última hora de inicio de sesión
      lastSignInTime: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : serverTimestamp(),
    }, { merge: true });
    console.log(`Documento de usuario actualizado/creado para UID: ${user.uid}`);
  } catch (error) {
    console.error("Error al actualizar/crear documento de usuario:", error);
  }
};


export {
  auth,
  db,
  provider,

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged, 
  where,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateProfile,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc, 
  deleteDoc, 
};

