import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
