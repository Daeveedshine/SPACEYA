import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyANIBIA_Vl-T9C-zaRUTSfGE9AuWdJcxGY",
  authDomain: "spaceyaa-10d75.firebaseapp.com",
  projectId: "spaceyaa-10d75",
  storageBucket: "spaceyaa-10d75.firebasestorage.app",
  messagingSenderId: "626014132233",
  appId: "1:626014132233:web:03e8eb0b82ab919f8040d8",
  measurementId: "G-8XNGK1MF1T",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth };
