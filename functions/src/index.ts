import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const requestEmailOtp = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const email = (context.auth?.token?.email as string | undefined)?.toLowerCase();
  if (!uid || !email) {
    throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
  }
  if (!email.endsWith("@gmail.com")) {
    throw new functions.https.HttpsError("failed-precondition", "Only gmail.com addresses are allowed");
  }

  const code = generateCode();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10m

  await db.collection("emailOtps").doc(uid).set({
    email,
    codeHash: code, // For demo; in prod hash with bcrypt
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt,
    attempts: 0,
  });

  // Send email via Firestore mail collection (works with "Trigger Email" extension)
  await db.collection("mail").add({
    to: email,
    message: {
      subject: "Your UGS verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family:Inter,Arial,sans-serif;padding:16px;">
        <h2 style="margin:0 0 12px;">Verify your email</h2>
        <p style="margin:0 0 8px;">Use the following 6-digit code to verify your account:</p>
        <div style="font-size:28px;letter-spacing:8px;font-weight:700;">${code}</div>
        <p style="color:#666;margin-top:12px;">This code expires in 10 minutes.</p>
      </div>`
    }
  });

  return { ok: true };
});

export const verifyEmailOtp = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const submitted = String(data?.code || "").trim();
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
  if (!/^\d{6}$/.test(submitted)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid code format");
  }
  const docRef = db.collection("emailOtps").doc(uid);
  const snap = await docRef.get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "No code requested");
  const { codeHash, expiresAt, attempts = 0 } = snap.data() as any;
  if (attempts >= 5) throw new functions.https.HttpsError("failed-precondition", "Too many attempts. Request a new code.");
  if (expiresAt?.toDate?.() && expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError("deadline-exceeded", "Code expired. Request a new code.");
  }
  if (submitted !== codeHash) {
    await docRef.set({ attempts: attempts + 1 }, { merge: true });
    throw new functions.https.HttpsError("permission-denied", "Incorrect code");
  }

  // Mark email as verified and set default role if missing
  await admin.auth().updateUser(uid, { emailVerified: true });

  // Set a default role if none is present
  const userRecord = await admin.auth().getUser(uid);
  const claims = (userRecord.customClaims || {}) as { role?: string };
  if (!claims.role) {
    await admin.auth().setCustomUserClaims(uid, { role: "client" });
  }
  await docRef.delete().catch(() => {});

  return { ok: true };
});

export const setUserRole = functions.https.onCall(async (data, context) => {
  const callerUid = context.auth?.uid;
  if (!callerUid) throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
  const caller = await admin.auth().getUser(callerUid);
  const callerRole = (caller.customClaims?.role as string | undefined) || "client";
  if (callerRole !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Only admins can set roles");
  }
  const targetUid = String(data?.uid || "");
  const role = String(data?.role || "");
  if (!targetUid || !["admin", "client"].includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid uid or role");
  }
  await admin.auth().setCustomUserClaims(targetUid, { role });
  return { ok: true };
});
