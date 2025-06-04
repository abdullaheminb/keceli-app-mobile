// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAs9pk_FnvEfEe-GN5447E8LEBXFM_n4h0",
  authDomain: "nur-yolcusu.firebaseapp.com",
  projectId: "nur-yolcusu",
  storageBucket: "nur-yolcusu.firebasestorage.app",
  messagingSenderId: "222443904305",
  appId: "1:222443904305:web:8b2cddc48f57b0c5eae410",
  measurementId: "G-9977S6685P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized:', !!app);
console.log('Firestore initialized:', !!db);

// Export the services
export { app, db };