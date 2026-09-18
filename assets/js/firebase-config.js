// Start - Firebase Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDme0JiYgksnnLIMysXPgVP_1DzUYaXBn4",
    authDomain: "eduverse-30e54.firebaseapp.com",
    projectId: "eduverse-30e54",
    storageBucket: "eduverse-30e54.firebasestorage.app",
    messagingSenderId: "879741135615",
    appId: "1:879741135615:web:9d39e28e3c569fff56faca"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);


// Export Firebase Services
export {
    auth,
    db
};

// End - Firebase Configuration