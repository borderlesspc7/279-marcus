import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const clientFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD9B5a_mXGQRt30u9fdyBGn7BFClpgj5RQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "appnutri-d3bd4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "appnutri-d3bd4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "appnutri-d3bd4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100010315737",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100010315737:web:79b8ccdd938d2c6dda53c8",
};

const clientApp = initializeApp(clientFirebaseConfig, "clientApp");
const clientAuth = getAuth(clientApp);
const clientDb = getFirestore(clientApp);

export { clientAuth, clientApp, clientDb };
export default clientFirebaseConfig;
