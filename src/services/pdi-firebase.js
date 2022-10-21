// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_PDI_API_KEY,
  authDomain: "sunsouth-web-solutions.firebaseapp.com",
  databaseURL: "https://sunsouth-web-solutions-default-rtdb.firebaseio.com",
  projectId: "sunsouth-web-solutions",
  storageBucket: "sunsouth-web-solutions.appspot.com",
  messagingSenderId: process.env.REACT_APP_PDI_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_PDI_APP_ID,
  measurementId: "G-C29B9WXCEX",
};

// Initialize Firebase
const pdiApp = initializeApp(firebaseConfig, "secondary");

// Authentication
const pdiAuth = getAuth(pdiApp);

// Firestore
const pdiDB = getFirestore(pdiApp);

export { pdiApp, pdiAuth, pdiDB };
