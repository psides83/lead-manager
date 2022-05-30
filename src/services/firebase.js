// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
  measurementId: "G-1NEHPSSTRQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Firestore
const db = getFirestore(app);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage();

const messaging = getMessaging();

const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BKByNCe3kO06qbYnYrvD3Ix9InuE2e1HN0qp4wxEdpvPzDQ8HHkmOuVvRuK2YVngxRTU21La5nUyTbA8zU6jxM0",
    });
    if (currentToken) {
      console.log("current token for client: ", currentToken);
    } else {
      // Show permission request UI
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};

const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("payload", payload);
      resolve(payload);
    });
  });

// Analytics
// const analytics = getAnalytics(app);

export { app, auth, db, storage, requestForToken, onMessageListener, messaging };
