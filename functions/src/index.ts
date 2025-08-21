import * as admin from "firebase-admin";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();
const db = admin.firestore();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const requestEmailOtp = onCall(async (request) => {
  const uid = request.auth?.uid;
  const email = (request.auth?.token?.email as string | undefined)?.toLowerCase();
  if (!uid || !email) {
    throw new HttpsError("unauthenticated", "Must be signed in");
  }
  if (!email.endsWith("@gmail.com")) {
    throw new HttpsError("failed-precondition", "Only gmail.com addresses are allowed");
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

export const verifyEmailOtp = onCall(async (request) => {
  const uid = request.auth?.uid;
  const submitted = String((request.data as any)?.code || "").trim();
  if (!uid) throw new HttpsError("unauthenticated", "Must be signed in");
  if (!/^\d{6}$/.test(submitted)) {
    throw new HttpsError("invalid-argument", "Invalid code format");
  }
  const docRef = db.collection("emailOtps").doc(uid);
  const snap = await docRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "No code requested");
  const { codeHash, expiresAt, attempts = 0 } = snap.data() as any;
  if (attempts >= 5) throw new HttpsError("failed-precondition", "Too many attempts. Request a new code.");
  if (expiresAt?.toDate?.() && expiresAt.toDate() < new Date()) {
    throw new HttpsError("deadline-exceeded", "Code expired. Request a new code.");
  }
  if (submitted !== codeHash) {
    await docRef.set({ attempts: attempts + 1 }, { merge: true });
    throw new HttpsError("permission-denied", "Incorrect code");
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

export const setUserRole = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) throw new HttpsError("unauthenticated", "Must be signed in");
  const caller = await admin.auth().getUser(callerUid);
  const callerRole = (caller.customClaims?.role as string | undefined) || "client";
  if (callerRole !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can set roles");
  }
  const targetUid = String((request.data as any)?.uid || "");
  const role = String((request.data as any)?.role || "");
  if (!targetUid || !["admin", "client"].includes(role)) {
    throw new HttpsError("invalid-argument", "Invalid uid or role");
  }
  await admin.auth().setCustomUserClaims(targetUid, { role });
  return { ok: true };
});

// ---- Cloudinary Signed Upload Support ----
import { v2 as cloudinary } from "cloudinary";
import corsLib from "cors";

// Store your API secret as a Firebase Secret (not in code)
const CLOUDINARY_API_SECRET = defineSecret("CLOUDINARY_API_SECRET");

const cors = corsLib({ origin: true, credentials: true });

function getCloudinaryConfig() {
  // Prefer explicit env/config over URL
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "ugs/avatars";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || undefined;
  if (!cloudName || !apiKey) {
    throw new Error("Missing Cloudinary config (cloud_name or api_key). Provide CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY.");
  }
  return { cloudName, apiKey, uploadFolder, uploadPreset };
}

export const cloudinarySign = onRequest({ secrets: [CLOUDINARY_API_SECRET] }, async (req, res) => {
  // Handle CORS preflight
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "POST");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res.status(204).send("");
      }
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { cloudName, apiKey, uploadFolder, uploadPreset } = getCloudinaryConfig();

      const timestamp = Number(req.body?.timestamp) || Math.floor(Date.now() / 1000);
      const folder = String(req.body?.folder || uploadFolder);
      const public_id = req.body?.public_id ? String(req.body.public_id) : undefined;

      // Build params to sign
      const params: Record<string, any> = { timestamp, folder };
      if (public_id) params.public_id = public_id;
      if (uploadPreset) params.upload_preset = uploadPreset;

      const apiSecret = CLOUDINARY_API_SECRET.value();
      if (!apiSecret) throw new Error("Missing CLOUDINARY_API_SECRET secret");

      // Compute signature
      const signature = cloudinary.utils.api_sign_request(params, apiSecret);

      // Respond with signature and client-usable config
      return res.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
        upload_preset: uploadPreset || null,
      });
    } catch (err: any) {
      console.error("cloudinarySign error", err);
      return res.status(500).json({ error: err?.message || "Internal error" });
    }
  });
});
