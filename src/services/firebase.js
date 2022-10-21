// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: "leadmanager-44f57.firebaseapp.com",
  databaseURL: "https://leadmanager-44f57-default-rtdb.firebaseio.com",
  projectId: "leadmanager-44f57",
  storageBucket: "leadmanager-44f57.appspot.com",
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
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
      vapidKey: process.env.REACT_APP_MESSAGIN_VAPID_KEY,
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

export {
  app,
  auth,
  db,
  storage,
  requestForToken,
  onMessageListener,
  messaging,
};
