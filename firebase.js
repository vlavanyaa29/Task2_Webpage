// ─── Firebase Setup ───
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9fvaAjip8HRKDP0WGoGd4W6HWTlBIWXs",
    authDomain: "apexplanet-task2.firebaseapp.com",
    projectId: "apexplanet-task2",
    storageBucket: "apexplanet-task2.firebasestorage.app",
    messagingSenderId: "973929677866",
    appId: "1:973929677866:web:d93425260c2f8b1e39af53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc };