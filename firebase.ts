import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAf7baJAam7cnVezAtDPDJrxE5gnmyEo5s",
  authDomain: "maintech-v-1.firebaseapp.com",
  projectId: "maintech-v-1",
  storageBucket: "maintech-v-1.firebasestorage.app",
  messagingSenderId: "1044116721819",
  appId: "1:1044116721819:web:27365400a3ca85fefe763e"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;