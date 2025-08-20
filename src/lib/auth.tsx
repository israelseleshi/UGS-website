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

  const friendlyAuthMessage = React.useCallback((err: any): string => {
    const code: string | undefined = err?.code || (typeof err?.message === 'string' && err.message);
    if (!isFirebaseConfigured || !auth) return "Service is temporarily unavailable. Please try again shortly.";
    if (!code) return "Something went wrong. Please try again.";
    const lower = String(code).toLowerCase();
    if (lower.includes("network") || lower.includes("offline")) return "Please check your internet connection and try again.";
    if (lower.includes("invalid-credential") || lower.includes("wrong-password") || lower.includes("user-not-found")) return "Email or password is incorrect.";
    if (lower.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
    if (lower.includes("user-disabled")) return "This account has been disabled. Contact support for assistance.";
    if (lower.includes("popup-closed")) return "The sign-in window was closed before completing. Please try again.";
    if (lower.includes("cancelled") || lower.includes("canceled")) return "Operation cancelled.";
    return "We couldn't complete the request. Please try again.";
  }, []);

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
    try {
      if (!isFirebaseConfigured || !auth) throw new Error("Service is temporarily unavailable. Please try again shortly.");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Enforce email verification
      const isAdmin = cred.user?.email?.toLowerCase() === "admin@ugsdesk.com";
      if (cred.user && !cred.user.emailVerified && !isAdmin) {
        try { await sendEmailVerification(cred.user); } catch {}
        await signOut(auth);
        throw new Error("Please verify your email. We've sent a new verification link.");
      }
    } catch (e: any) {
      const msg = friendlyAuthMessage(e);
      setError(msg);
      throw new Error(msg);
    }
  }, [friendlyAuthMessage]);

  const signUpWithEmail = React.useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error("Service is temporarily unavailable. Please try again shortly.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user && db) await ensureUserDoc(cred.user);
      if (cred.user) {
        try { await sendEmailVerification(cred.user); } catch {}
        try { await reload(cred.user); } catch {}
      }
    } catch (e: any) {
      const msg = friendlyAuthMessage(e);
      setError(msg);
      throw new Error(msg);
    }
  }, [friendlyAuthMessage]);

  const signInWithGoogleCb = React.useCallback(async () => {
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !googleProvider) throw new Error("Service is temporarily unavailable. Please try again shortly.");
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user && db) await ensureUserDoc(res.user);
    } catch (e: any) {
      const msg = friendlyAuthMessage(e);
      setError(msg);
      throw new Error(msg);
    }
  }, [friendlyAuthMessage]);

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
