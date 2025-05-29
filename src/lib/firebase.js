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

