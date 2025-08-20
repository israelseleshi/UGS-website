import React from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db, googleProvider, isFirebaseConfigured } from "./firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type AppUser = User | null;

export type AuthContextType = {
  user: AppUser;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resendVerification: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

async function ensureUserDoc(user: User) {
  if (!db) return; // Firestore not configured
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      role: (user.email?.toLowerCase() === "admin@ugsdesk.com") ? "admin" : "user",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase not configured. Auth is disabled. Set VITE_FIREBASE_* env vars.");
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u && db) await ensureUserDoc(u);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Auth error");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const signInWithEmail = React.useCallback(async (email: string, password: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) throw new Error("Auth not configured");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Enforce email verification
    const isAdmin = cred.user?.email?.toLowerCase() === "admin@ugsdesk.com";
    if (cred.user && !cred.user.emailVerified && !isAdmin) {
      try { await sendEmailVerification(cred.user); } catch {}
      await signOut(auth);
      throw new Error("Please verify your email. A verification link has been sent.");
    }
  }, []);

  const signUpWithEmail = React.useCallback(async (email: string, password: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) throw new Error("Auth not configured");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user && db) await ensureUserDoc(cred.user);
    // Send verification email and keep user signed-in but blocked by sign-in guard
    if (cred.user) {
      try { await sendEmailVerification(cred.user); } catch {}
      try { await reload(cred.user); } catch {}
    }
  }, []);

  const signInWithGoogleCb = React.useCallback(async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth || !googleProvider) throw new Error("Auth not configured");
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user && db) await ensureUserDoc(res.user);
  }, []);

  const signOutUser = React.useCallback(async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth) return;
    await signOut(auth);
  }, []);

  const resendVerification = React.useCallback(async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth) throw new Error("Auth not configured");
    const u = auth.currentUser;
    if (!u) throw new Error("No signed-in user");
    await sendEmailVerification(u);
  }, []);

  const value: AuthContextType = React.useMemo(
    () => ({ user, loading, error, signInWithEmail, signUpWithEmail, signInWithGoogle: signInWithGoogleCb, signOutUser, resendVerification }),
    [user, loading, error, signInWithEmail, signUpWithEmail, signInWithGoogleCb, signOutUser, resendVerification]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
