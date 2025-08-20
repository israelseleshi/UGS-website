import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config via Vite env vars. Ensure these are set in .env.local and Netlify env.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

// Required for Auth to work
const requiredMissing = [
  ["VITE_FIREBASE_API_KEY", apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", authDomain],
  ["VITE_FIREBASE_PROJECT_ID", projectId],
  ["VITE_FIREBASE_APP_ID", appId],
].filter(([_, v]) => !v).map(([k]) => k as string);

// Optional but recommended
const optionalMissing = [
  ["VITE_FIREBASE_STORAGE_BUCKET", storageBucket],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", messagingSenderId],
].filter(([_, v]) => !v).map(([k]) => k as string);

export const isFirebaseConfigured = requiredMissing.length === 0;

let app: ReturnType<typeof initializeApp> | undefined;

if (isFirebaseConfigured) {
  const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } as const;
  app = initializeApp(firebaseConfig);
} else if (import.meta.env.PROD || import.meta.env.DEV) {
  console.warn(
    "Firebase not configured. Missing REQUIRED env vars:",
    requiredMissing,
    optionalMissing.length ? "| Optional missing:" : "",
    optionalMissing
  );
}

export const auth = app ? getAuth(app) : undefined;
export const googleProvider = app ? new GoogleAuthProvider() : undefined;
export const db = app ? getFirestore(app) : undefined;

// Optional: connect to emulators in dev (uncomment if you enable emulators)
// import { connectAuthEmulator } from "firebase/auth";
// import { connectFirestoreEmulator } from "firebase/firestore";
// if (import.meta.env.DEV) {
//   try {
//     if (auth) connectAuthEmulator(auth, "http://127.0.0.1:9099");
//     if (db) connectFirestoreEmulator(db, "127.0.0.1", 8080);
//   } catch {}
// }
