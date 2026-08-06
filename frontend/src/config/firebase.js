import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCFdvb9QOaLaMD6eatAiug62yCbpnSYJhM",
  authDomain: "diagnolabs-62be3.firebaseapp.com",
  projectId: "diagnolabs-62be3",
  storageBucket: "diagnolabs-62be3.firebasestorage.app",
  messagingSenderId: "287013812817",
  appId: "1:287013812817:web:cd227f7dc6541515695670",
  measurementId: "G-ETYK0EZKRT"
};

const app = initializeApp(firebaseConfig);

export let auth = {};
export let storage = {};
export let db = {};

try {
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase Auth failed to initialize. Please check API Key.", e);
}

try {
  storage = getStorage(app);
} catch (e) {
  console.error("Firebase Storage failed to initialize.", e);
}

try {
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Firestore failed to initialize.", e);
}

// Analytics only works in browser environments, checking support first
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Messaging works in supported browsers (needs HTTPS or localhost)
export let messaging = null;
isMessagingSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

// App Check (Security)
export let appCheck = null;
try {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Ld8JngtAAAAAA6G_HIZ85cZnkQcdMvXdp52Sa3L'),
    isTokenAutoRefreshEnabled: true
  });
} catch (err) {
  console.warn("App Check initialization failed:", err);
}
