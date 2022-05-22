// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRMGtjzGBy6wbtOKH2t4rXQs7k67yiaFA",
  authDomain: "leadmanager-44f57.firebaseapp.com",
  databaseURL: "https://leadmanager-44f57-default-rtdb.firebaseio.com",
  projectId: "leadmanager-44f57",
  storageBucket: "leadmanager-44f57.appspot.com",
  messagingSenderId: "170699049221",
  appId: "1:170699049221:web:069c378b4d8af108e2cf6c",
  measurementId: "G-1NEHPSSTRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Firestore
const db = getFirestore(app);

// Analytics
// const analytics = getAnalytics(app);

export { app, auth, db };