import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";

// Types
export type UserDoc = {
  uid: string;
  email: string | null;
  role: "user" | "admin";
  // Profile fields collected at signup or later edits
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  photoURL?: string | null;
  // Audit
  createdAt?: any;
  lastLoginAt?: any;
};

function getDb() {
  if (!db) throw new Error("Firestore not configured");
  return db;
}

// Ensure base collections exist by writing a placeholder doc
export async function ensureBaseCollections() {
  if (!db) return; // silent no-op when not configured
  const now = serverTimestamp();
  const placeholders: Array<[string, string, Record<string, any>]> = [
    ["users", "_seed", { _type: "seed", createdAt: now }],
    ["visaApplications", "_seed", { _type: "seed", createdAt: now }],
    ["documents", "_seed", { _type: "seed", createdAt: now }],
    ["payments", "_seed", { _type: "seed", createdAt: now }],
    ["messages", "_seed", { _type: "seed", createdAt: now }],
    ["audits", "_seed", { _type: "seed", createdAt: now }],
  ];
  // settings has a meaningful root doc
  const settingsRef = doc(getDb(), "settings", "app");
  const settingsSnap = await getDoc(settingsRef);
  if (!settingsSnap.exists()) {
    await setDoc(settingsRef, {
      createdAt: now,
      brand: { name: "United Global Services" },
      features: { googleAuth: true },
    });
  }
  for (const [col, id, data] of placeholders) {
    const ref = doc(getDb(), col, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, data, { merge: true });
    }
  }

  // Backfill default profile fields for existing users so the portal can render names/phone
  try {
    const usersSnap = await getDocs(collection(getDb(), "users"));
    for (const d of usersSnap.docs) {
      if (d.id === "_seed") continue;
      const u = d.data() as UserDoc;
      // Only set fields that are missing; don't overwrite existing data
      const toSet: Partial<UserDoc> = {};
      if (u.fullName === undefined && (u.firstName || u.lastName)) {
        toSet.fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || null as any;
      }
      if (u.firstName === undefined) toSet.firstName = "";
      if (u.lastName === undefined) toSet.lastName = "";
      if (u.fullName === undefined) toSet.fullName = "";
      if (u.phone === undefined) toSet.phone = "";
      if (u.photoURL === undefined) toSet.photoURL = null;
      if (Object.keys(toSet).length > 0) {
        await setDoc(doc(getDb(), "users", d.id), toSet, { merge: true });
      }
    }
  } catch (e) {
    // ignore seeding failures (may be blocked by rules if not admin)
  }
}

export type VisaApplication = {
  uid: string;
  userEmail?: string;
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  priority?: "normal" | "medium" | "high";
  estimatedCost?: number;
  
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiry?: string;
  };
  
  travel?: {
    serviceType?: string;
    destination?: string;
    purpose?: string;
    travelDate?: string;
    returnDate?: string;
    accommodation?: string;
    previousVisaHistory?: string;
  };
  
  additionalInfo?: {
    emergencyContact?: string;
    emergencyPhone?: string;
    specialRequirements?: string;
    processingSpeed?: string;
    consultationNeeded?: boolean;
    documentReview?: boolean;
  };
  
  createdAt?: any;
  updatedAt?: any;
};

// Users
export async function getUser(uid: string) {
  const ref = doc(getDb(), "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function upsertUser(user: Partial<UserDoc> & { uid: string }) {
  const ref = doc(getDb(), "users", user.uid);
  await setDoc(
    ref,
    {
      createdAt: serverTimestamp(),
      ...user,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// Visa Applications
export async function createVisaApplication(uid: string, data: Partial<VisaApplication> = {}) {
  const colRef = collection(getDb(), "visaApplications");
  const docRef = await addDoc(colRef, {
    uid,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...(snap.data() as VisaApplication) };
}

export async function updateVisaApplication(appId: string, data: Partial<VisaApplication>) {
  const ref = doc(getDb(), "visaApplications", appId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteVisaApplication(appId: string) {
  const ref = doc(getDb(), "visaApplications", appId);
  await deleteDoc(ref);
}

export async function getVisaApplication(appId: string) {
  const ref = doc(getDb(), "visaApplications", appId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: appId, ...(snap.data() as VisaApplication) }) : null;
}

export async function listUserApplications(uid: string, pageSize = 20, cursor?: QueryDocumentSnapshot) {
  const baseQuery = query(
    collection(getDb(), "visaApplications"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );
  const q = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as VisaApplication) }));
  const nextCursor = snap.docs[snap.docs.length - 1];
  return { items, nextCursor };
}

// Admin function to list all applications
export async function listAllApplications(pageSize = 50, cursor?: QueryDocumentSnapshot) {
  const baseQuery = query(
    collection(getDb(), "visaApplications"),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );
  const q = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as VisaApplication) }));
  const nextCursor = snap.docs[snap.docs.length - 1];
  return { items, nextCursor };
}

// Submit a new visa application
export async function submitVisaApplication(applicationData: Partial<VisaApplication>) {
  const ref = collection(getDb(), "visaApplications");
  const docRef = await addDoc(ref, {
    ...applicationData,
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}
