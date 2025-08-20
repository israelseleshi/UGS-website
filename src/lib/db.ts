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
  createdAt?: any;
  lastLoginAt?: any;
};

export type VisaApplication = {
  uid: string;
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  applicant?: {
    fullName?: string;
    dob?: string;
    nationality?: string;
  };
  travel?: {
    destination?: string;
    purpose?: string;
    startDate?: string;
    endDate?: string;
  };
  createdAt?: any;
  updatedAt?: any;
};

// Users
export async function getUser(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function upsertUser(user: Partial<UserDoc> & { uid: string }) {
  const ref = doc(db, "users", user.uid);
  await setDoc(
    ref,
    {
      role: "user",
      createdAt: serverTimestamp(),
      ...user,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// Visa Applications
export async function createVisaApplication(uid: string, data: Partial<VisaApplication> = {}) {
  const colRef = collection(db, "visaApplications");
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
  const ref = doc(db, "visaApplications", appId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteVisaApplication(appId: string) {
  const ref = doc(db, "visaApplications", appId);
  await deleteDoc(ref);
}

export async function getVisaApplication(appId: string) {
  const ref = doc(db, "visaApplications", appId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: appId, ...(snap.data() as VisaApplication) }) : null;
}

export async function listUserApplications(uid: string, pageSize = 20, cursor?: QueryDocumentSnapshot) {
  const baseQuery = query(
    collection(db, "visaApplications"),
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
