import React from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import type { User } from "firebase/auth";
import { auth, db, googleProvider, isFirebaseConfigured, functions } from "./firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type AppUser = User | null;

export type AuthContextType = {
  user: AppUser;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resendVerification: () => Promise<void>;
  requestOtp: () => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

async function ensureUserDoc(user: User) {
  if (!db) return; // Firestore not configured
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Do not set 'role' on create to comply with Firestore rules
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    // Only update lastLoginAt if the user's email is verified to satisfy rules
    if (user.emailVerified) {
      await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
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
    if (lower.includes("email-already-in-use")) return "An account already exists with this email. Try signing in instead.";
    if (lower.includes("weak-password")) return "Password is too weak. Use at least 6 characters.";
    if (lower.includes("invalid-email")) return "Please enter a valid email address.";
    if (lower.includes("missing-password")) return "Please enter a password.";
    if (lower.includes("operation-not-allowed")) return "Email/password sign-in is not enabled in Firebase Auth settings.";
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

  const signInWithEmail = React.useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error("Service is temporarily unavailable. Please try again shortly.");
      
      // Set persistence based on rememberMe option
      if (rememberMe) {
        // LOCAL persistence - user will stay signed in even after closing browser
        await setPersistence(auth, browserLocalPersistence);
      } else {
        // SESSION persistence - user will be signed out when browser closes
        await setPersistence(auth, browserSessionPersistence);
      }
      
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // After sign-in, check custom claims; only non-admins are asked to verify.
      // Whitelist admin email in case claims aren't set yet.
      try {
        const token = await cred.user.getIdTokenResult(true);
        const role = (token.claims?.role as string) || 'client';
        const userEmail = (cred.user.email || '').toLowerCase();
        const isWhitelistedAdmin = ['admin@ugsdesk.com'].includes(userEmail);
        if (role !== 'admin' && !isWhitelistedAdmin && !cred.user.emailVerified) {
          try { await sendEmailVerification(cred.user); } catch {}
          // Do not sign out; App.tsx will route non-admins to 'verify-email'
        }
      } catch {}
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
      }
    } catch (e: any) {
      const msg = friendlyAuthMessage(e);
      setError(msg);
      throw new Error(msg);
    }
  }, [friendlyAuthMessage]);

  const signInWithGoogleCb = React.useCallback(async () => {
    // Disabled per product requirements (email/password with Gmail only)
    throw new Error("Google sign-in is disabled. Please sign in with your Gmail and password.");
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
    if (!u) throw new Error("Not signed in");
    await sendEmailVerification(u);
  }, []);

  const requestOtp = React.useCallback(async () => {
    // Backwards-compat: treat as resend verification email
    if (!isFirebaseConfigured || !auth) throw new Error("Auth not configured");
    const u = auth.currentUser;
    if (!u) throw new Error("Not signed in");
    await sendEmailVerification(u);
  }, []);

  const verifyOtp = React.useCallback(async (_code: string) => {
    // Backwards-compat: just reload and let App route once email is verified via link
    if (!isFirebaseConfigured || !auth) throw new Error("Auth not configured");
    const u = auth.currentUser;
    if (!u) throw new Error("Not signed in");
    await reload(u);
    await u.getIdToken(true);
    if (!u.emailVerified) throw new Error("Email is not verified yet. Please click the link in your email, then try again.");
  }, []);

  const resetPassword = React.useCallback(async (email: string) => {
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error("Service is temporarily unavailable. Please try again shortly.");
      const trimmed = (email || "").trim();
      if (!trimmed) throw new Error("Please enter a valid email address.");
      await sendPasswordResetEmail(auth, trimmed);
    } catch (e: any) {
      const msg = friendlyAuthMessage(e);
      setError(msg);
      throw new Error(msg);
    }
  }, [friendlyAuthMessage]);

  const value: AuthContextType = React.useMemo(
    () => ({ user, loading, error, signInWithEmail, signUpWithEmail, signInWithGoogle: signInWithGoogleCb, signOutUser, resendVerification, requestOtp, verifyOtp, resetPassword }),
    [user, loading, error, signInWithEmail, signUpWithEmail, signInWithGoogleCb, signOutUser, resendVerification, requestOtp, verifyOtp, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
