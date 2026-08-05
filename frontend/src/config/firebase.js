import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getVertexAI } from "firebase/vertexai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "diagnolabs-62be3.firebaseapp.com",
  projectId: "diagnolabs-62be3",
  storageBucket: "diagnolabs-62be3.firebasestorage.app",
  messagingSenderId: "287013812817",
  appId: "1:287013812817:web:cd227f7dc6541515695670",
  measurementId: "G-ETYK0EZKRT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const vertexAI = getVertexAI(app);

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
