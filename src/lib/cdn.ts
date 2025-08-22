// Helper to generate optimized Cloudinary delivery URLs
// Supports both public IDs and remote image fetches

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const ENABLE_FETCH = (import.meta.env.VITE_CLOUDINARY_ENABLE_FETCH as string | undefined)?.toLowerCase() !== 'false';

export type CldOptions = {
  w?: number;
  h?: number;
  q?: number | 'auto';
  f?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  c?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | string; // crop mode
  g?: string; // gravity
};

function buildTransform({ w, h, q, f, c, g }: CldOptions = {}): string {
  const parts: string[] = [];
  if (f) parts.push(`f_${f}`);
  if (q) parts.push(`q_${q}`);
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  if (c) parts.push(`c_${c}`);
  if (g) parts.push(`g_${g}`);
  return parts.join(',');
}

// Generate a Cloudinary "image/fetch" URL for a remote image URL
export function cldFetch(remoteUrl: string, opts: CldOptions = {}): string {
  // If Cloudinary is not configured, or fetch is disabled, or source is Unsplash, return original URL
  const isUnsplash = /(^https?:\/\/)?images\.unsplash\.com\//i.test(remoteUrl);
  if (!CLOUD_NAME || !ENABLE_FETCH || isUnsplash) return remoteUrl;
  const t = buildTransform({ f: 'auto', q: 'auto', ...opts });
  const encoded = encodeURIComponent(remoteUrl);
  const transform = t ? `${t}/` : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transform}${encoded}`;
}

// Generate a Cloudinary delivery URL for a public ID (already uploaded to your account)
export function cldPublic(publicId: string, opts: CldOptions = {}): string {
  if (!CLOUD_NAME) return publicId;
  const t = buildTransform({ f: 'auto', q: 'auto', ...opts });
  const transform = t ? `${t}/` : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}${publicId}`;
}
