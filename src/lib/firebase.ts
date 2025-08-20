import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config via Vite env vars. Ensure these are set in .env.local and Netlify env.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

export const isFirebaseConfigured = Boolean(apiKey && authDomain && projectId && appId);

let app:
  | ReturnType<typeof initializeApp>
  | undefined;

if (isFirebaseConfigured) {
  const firebaseConfig = { apiKey, authDomain, projectId, appId } as const;
  app = initializeApp(firebaseConfig);
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
