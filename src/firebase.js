// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzC0ijzMzgk9jreFrSAfm38bD6gXhCBm4",
  authDomain: "mishmar-7600c.firebaseapp.com",
  projectId: "mishmar-7600c",
  storageBucket: "mishmar-7600c.firebasestorage.app",
  messagingSenderId: "362274558760",
  appId: "1:362274558760:web:b2446cfd9e88543029761d",
  measurementId: "G-Y6R35TDXS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);