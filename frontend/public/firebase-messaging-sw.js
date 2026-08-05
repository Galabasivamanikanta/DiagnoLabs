// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
// We can't use process.env here directly since it's a static file loaded by browser, 
// so we need to inject the config. But for the service worker, the minimal config is required.
// You must replace VITE_FIREBASE_API_KEY with the actual string here OR use a bundler plugin to inject it.
// Since it's public anyway, we will place the static config here.

const firebaseConfig = {
  apiKey: "AIzaSyBfe9TyMLMgewjMy7XTGcCiM5BCbVIMHjA", 
  authDomain: "diagnolabs-62be3.firebaseapp.com",
  projectId: "diagnolabs-62be3",
  storageBucket: "diagnolabs-62be3.firebasestorage.app",
  messagingSenderId: "287013812817",
  appId: "1:287013812817:web:cd227f7dc6541515695670",
  measurementId: "G-ETYK0EZKRT"
};

// We will fetch the config dynamically from the app to avoid hardcoding API keys in public folders
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
