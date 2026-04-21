import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCg2ROhCzySWKraBYCcH-ELr5Ztq3P1ngk",
  authDomain: "studyflow-f149a.firebaseapp.com",
  projectId: "studyflow-f149a",
  storageBucket: "studyflow-f149a.firebasestorage.app",
  messagingSenderId: "517461958",
  appId: "1:517461958:web:517461958"
};

const app = initializeApp(firebaseConfig, 'studyflow');

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure auth for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  auth.settings.appVerificationDisabledForTesting = true;
}






