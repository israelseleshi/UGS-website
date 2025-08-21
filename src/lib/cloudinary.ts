import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const DEFAULT_UPLOAD_FOLDER = (import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER as string) || 'ugs/avatars';
const DEFAULT_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || undefined;
const FUNCTIONS_REGION = (import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION as string) || 'us-central1';
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const DEFAULT_FUNCTIONS_BASE = PROJECT_ID ? `https://${FUNCTIONS_REGION}-${PROJECT_ID}.cloudfunctions.net` : '';
const FUNCTIONS_BASE = (import.meta.env.VITE_FUNCTIONS_BASE_URL as string) || DEFAULT_FUNCTIONS_BASE;

if (!CLOUD_NAME) {
  // eslint-disable-next-line no-console
  console.warn('VITE_CLOUDINARY_CLOUD_NAME is not set');
}

export type SignResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  upload_preset?: string | null;
};

export async function getUploadSignature(params?: { folder?: string; public_id?: string; timestamp?: number }): Promise<SignResponse> {
  if (!FUNCTIONS_BASE) {
    throw new Error('Cloud Functions base URL is not configured. Set VITE_FUNCTIONS_BASE_URL or VITE_FIREBASE_PROJECT_ID.');
  }
  const endpoint = `${FUNCTIONS_BASE}/cloudinarySign`;
  const ts = params?.timestamp || Math.floor(Date.now() / 1000);
  const body = { timestamp: ts, folder: params?.folder || DEFAULT_UPLOAD_FOLDER, public_id: params?.public_id };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Signature request failed: ${res.statusText}`);
  return (await res.json()) as SignResponse;
}

export async function uploadAvatar(file: File, options?: { folder?: string; public_id?: string; onProgress?: (p: number) => void }) {
  const { signature, timestamp, apiKey, folder, upload_preset, cloudName } = await getUploadSignature({ folder: options?.folder, public_id: options?.public_id });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  if (upload_preset) form.append('upload_preset', upload_preset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName || CLOUD_NAME}/auto/upload`;

  const xhr = new XMLHttpRequest();
  const promise: Promise<{ secure_url: string; public_id: string }> = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && options?.onProgress) {
        options.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve({ secure_url: json.secure_url, public_id: json.public_id });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.open('POST', url);
    xhr.send(form);
  });

  return promise;
}

export async function saveAvatarUrl(secureUrl: string) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  await updateProfile(user, { photoURL: secureUrl }).catch(() => {});
  if (!db) return; // Firestore not configured in this environment
  await setDoc(doc(db, 'users', user.uid), { photoURL: secureUrl, updatedAt: new Date().toISOString() }, { merge: true });
}
