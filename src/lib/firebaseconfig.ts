import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-123456789",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "dolphinfast-mock.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dolphinfast-mock",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "dolphinfast-mock.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:123456789012:web:abcdef123456789",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
export default firebaseConfig;
