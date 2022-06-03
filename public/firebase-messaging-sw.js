// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
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

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
