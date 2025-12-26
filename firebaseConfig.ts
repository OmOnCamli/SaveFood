import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For now, these are empty. User must fill them in to use real Firebase.
// If missing, DataService will fallback to AsyncStorage/Mock.
const firebaseConfig = {
    apiKey: "AIzaSyDNz64SUk1jVxNhUduHqdcU9xWGthG5oJs",
    authDomain: "savefood-506b3.firebaseapp.com",
    projectId: "savefood-506b3",
    storageBucket: "savefood-506b3.firebasestorage.app",
    messagingSenderId: "941855375778",
    appId: "1:941855375778:web:7bfd2fdc9d992477b5b2fb",
    measurementId: "G-YWE3GCD6EP"
};

let app;
let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (firebaseConfig.apiKey) {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
} else {
    console.log("Firebase config missing API Key. Using Mock Data / Local Storage.");
}

export { auth, db, firebaseConfig };

