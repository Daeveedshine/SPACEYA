// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANIBIA_Vl-T9C-zaRUTSfGE9AuWdJcxGY",
  authDomain: "spaceyaa-10d75.firebaseapp.com",
  projectId: "spaceyaa-10d75",
  storageBucket: "spaceyaa-10d75.firebasestorage.app",
  messagingSenderId: "626014132233",
  appId: "1:626014132233:web:03e8eb0b82ab919f8040d8",
  measurementId: "G-8XNGK1MF1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
