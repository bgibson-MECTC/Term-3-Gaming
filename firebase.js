import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCUDuHefWAoVrG6Gf4mDVaxnKuZzkdtBAw",
  authDomain: "term3-rn.firebaseapp.com",
  projectId: "term3-rn",
  storageBucket: "term3-rn.firebasestorage.app",
  messagingSenderId: "494666669692",
  appId: "1:494666669692:web:67b5a9b3ad9dd65b7a33f9",
  measurementId: "G-B13V3P1WEH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);