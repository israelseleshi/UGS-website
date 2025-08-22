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
  onSnapshot,
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

// Messaging
export type AppMessage = {
  text: string;
  byUid: string;
  byRole?: 'admin' | 'user';
  createdAt?: any;
};

// Direct (global) messages stored at top-level `messages` collection
export type DirectMessage = AppMessage & {
  userId: string; // Client user UID this thread belongs to
};

// Add a message in the top-level messages collection for a given user
export async function sendDirectMessage(userId: string, msg: { text: string; byUid: string; byRole?: 'admin' | 'user' }) {
  const ref = collection(getDb(), 'messages');
  const docRef = await addDoc(ref, { userId, ...msg, createdAt: serverTimestamp() });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...(snap.data() as DirectMessage) };
}

// Real-time subscribe to direct messages for a given user
export function subscribeDirectMessages(
  userId: string,
  cb: (items: (DirectMessage & { id: string })[]) => void,
) {
  const q = query(
    collection(getDb(), 'messages'),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as DirectMessage) }));
    cb(items);
  });
  return unsub;
}

export async function listApplicationMessages(appId: string, pageSize = 50, cursor?: QueryDocumentSnapshot) {
  const base = query(
    collection(getDb(), 'visaApplications', appId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(pageSize),
  );
  const q = cursor ? query(base, startAfter(cursor)) : base;
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as AppMessage) }));
  const nextCursor = snap.docs[snap.docs.length - 1];
  return { items, nextCursor };
}

// ---- VisaEd Registrations ----
export type VisaEdRegistration = {
  uid: string;
  userEmail?: string;
  courseId?: string;
  courseName?: string;
  plan?: 'free' | 'premium' | 'luxury';
  status?: 'registered' | 'active' | 'completed' | 'cancelled';
  paymentRef?: string;
  // Full form capture from VisaEd registration UI
  form?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentLocation?: string; // country code or name
    targetCountry?: string;   // country code or name
    visaType?: string;        // tourist | student | work | immigration
    experienceLevel?: string; // beginner | intermediate | advanced
    learningGoals?: string;
    preferredSchedule?: string; // weekdays | weekends | flexible
    agreeToTerms?: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
};

export async function createVisaEdRegistration(uid: string, data: Partial<VisaEdRegistration> = {}) {
  const colRef = collection(getDb(), 'visaEdRegistrations');
  // Ensure a consistent form shape
  const defaultForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentLocation: '',
    targetCountry: '',
    visaType: '',
    experienceLevel: '',
    learningGoals: '',
    preferredSchedule: '',
    agreeToTerms: false,
  } as VisaEdRegistration['form'];

  const docData: VisaEdRegistration & Record<string, any> = {
    uid,
    status: 'registered',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
    form: { ...defaultForm, ...(data.form || {}) },
  } as any;

  const docRef = await addDoc(colRef, docData);
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...(snap.data() as VisaEdRegistration) };
}

export async function getVisaEdRegistration(id: string) {
  const ref = doc(getDb(), 'visaEdRegistrations', id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id, ...(snap.data() as VisaEdRegistration) }) : null;
}

export async function updateVisaEdRegistration(id: string, data: Partial<VisaEdRegistration>) {
  const ref = doc(getDb(), 'visaEdRegistrations', id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteVisaEdRegistration(id: string) {
  const ref = doc(getDb(), 'visaEdRegistrations', id);
  await deleteDoc(ref);
}

export async function listVisaEdRegistrations(pageSize = 50, cursor?: QueryDocumentSnapshot) {
  const baseQuery = query(
    collection(getDb(), 'visaEdRegistrations'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  );
  const q = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as VisaEdRegistration) }));
  const nextCursor = snap.docs[snap.docs.length - 1];
  return { items, nextCursor };
}

export async function sendApplicationMessage(appId: string, msg: { text: string; byUid: string; byRole?: 'admin' | 'user' }) {
  const ref = collection(getDb(), 'visaApplications', appId, 'messages');
  const docRef = await addDoc(ref, { ...msg, createdAt: serverTimestamp() });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...(snap.data() as AppMessage) };
}

// Real-time subscribe to application messages
export function subscribeApplicationMessages(
  appId: string,
  cb: (items: (AppMessage & { id: string })[]) => void,
) {
  const q = query(
    collection(getDb(), 'visaApplications', appId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as AppMessage) }));
    cb(items);
  });
  return unsub;
}

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
    ["visaEdRegistrations", "_seed", { _type: "seed", createdAt: now }],
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

// --- Admin Maintenance ---
// Wipe all documents from the provided collections except seed docs.
// Preserves:
// - Any doc with id "_seed"
// - For settings: preserves doc id "app"
export async function wipeNonSeedData(collections: string[]) {
  for (const col of collections) {
    const snap = await getDocs(collection(getDb(), col));
    for (const d of snap.docs) {
      if (d.id === '_seed') continue;
      if (col === 'settings' && d.id === 'app') continue;
      try {
        // Clean known subcollections before deleting parent docs
        if (col === 'visaApplications') {
          // Delete nested messages subcollection if present
          const sub = await getDocs(collection(getDb(), 'visaApplications', d.id, 'messages'));
          for (const sm of sub.docs) {
            await deleteDoc(doc(getDb(), 'visaApplications', d.id, 'messages', sm.id));
          }
        }
      } catch {}
      await deleteDoc(doc(getDb(), col, d.id));
    }
  }
}
