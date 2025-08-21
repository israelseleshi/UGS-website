"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinarySign = exports.setUserRole = exports.verifyEmailOtp = exports.requestEmailOtp = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.requestEmailOtp = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    const email = context.auth?.token?.email?.toLowerCase();
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
exports.verifyEmailOtp = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    const submitted = String(data?.code || "").trim();
    if (!uid)
        throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
    if (!/^\d{6}$/.test(submitted)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid code format");
    }
    const docRef = db.collection("emailOtps").doc(uid);
    const snap = await docRef.get();
    if (!snap.exists)
        throw new functions.https.HttpsError("not-found", "No code requested");
    const { codeHash, expiresAt, attempts = 0 } = snap.data();
    if (attempts >= 5)
        throw new functions.https.HttpsError("failed-precondition", "Too many attempts. Request a new code.");
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
    const claims = (userRecord.customClaims || {});
    if (!claims.role) {
        await admin.auth().setCustomUserClaims(uid, { role: "client" });
    }
    await docRef.delete().catch(() => { });
    return { ok: true };
});
exports.setUserRole = functions.https.onCall(async (data, context) => {
    const callerUid = context.auth?.uid;
    if (!callerUid)
        throw new functions.https.HttpsError("unauthenticated", "Must be signed in");
    const caller = await admin.auth().getUser(callerUid);
    const callerRole = caller.customClaims?.role || "client";
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
// ---- Cloudinary Signed Upload Support ----
const cloudinary_1 = require("cloudinary");
const cors_1 = __importDefault(require("cors"));
const params_1 = require("firebase-functions/params");
// Store your API secret as a Firebase Secret (not in code)
const CLOUDINARY_API_SECRET = (0, params_1.defineSecret)("CLOUDINARY_API_SECRET");
const cors = (0, cors_1.default)({ origin: true, credentials: true });
function getCloudinaryConfig() {
    // Prefer explicit env/config over URL
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || functions.config().cloudinary?.cloud_name;
    const apiKey = process.env.CLOUDINARY_API_KEY || functions.config().cloudinary?.api_key;
    const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || functions.config().cloudinary?.upload_folder || "ugs/avatars";
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || functions.config().cloudinary?.upload_preset || undefined;
    if (!cloudName || !apiKey) {
        throw new Error("Missing Cloudinary config (cloud_name or api_key). Set via functions:config:set cloudinary.cloud_name=... cloudinary.api_key=...");
    }
    return { cloudName, apiKey, uploadFolder, uploadPreset };
}
exports.cloudinarySign = functions.runWith({ secrets: [CLOUDINARY_API_SECRET] }).https.onRequest(async (req, res) => {
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
            const params = { timestamp, folder };
            if (public_id)
                params.public_id = public_id;
            if (uploadPreset)
                params.upload_preset = uploadPreset;
            const apiSecret = CLOUDINARY_API_SECRET.value();
            if (!apiSecret)
                throw new Error("Missing CLOUDINARY_API_SECRET secret");
            // Compute signature
            const signature = cloudinary_1.v2.utils.api_sign_request(params, apiSecret);
            // Respond with signature and client-usable config
            return res.json({
                signature,
                timestamp,
                apiKey,
                cloudName,
                folder,
                upload_preset: uploadPreset || null,
            });
        }
        catch (err) {
            console.error("cloudinarySign error", err);
            return res.status(500).json({ error: err?.message || "Internal error" });
        }
    });
});
