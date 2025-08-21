import React from 'react';
import { uploadAvatar, saveAvatarUrl } from '../lib/cloudinary';
import { useAuth } from '../lib/auth';
import { Button } from './button';
import { Progress } from './progress';
import { Camera } from 'lucide-react';

type Props = {
  folder?: string;
  onUploaded?: (url: string) => void;
  mode?: 'default' | 'overlay';
  sizePx?: number;
  className?: string;
};

export default function AvatarUpload({ folder = 'ugs/avatars', onUploaded, mode = 'default', sizePx = 96, className = '' }: Props) {
  const { user } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
    if (f && mode === 'overlay') {
      void onUpload(f);
    }
  };

  const onUpload = async (picked?: File) => {
    const target = picked || file;
    if (!target) return;
    if (!user) { setError('Please sign in first'); return; }
    if (target.size > 5 * 1024 * 1024) { setError('Max size is 5 MB'); return; }
    if (!/\.(jpe?g|png|webp)$/i.test(target.name)) { setError('Only JPG, PNG, or WEBP'); return; }
    setBusy(true);
    setError(null);
    try {
      const { secure_url } = await uploadAvatar(target, { folder, onProgress: setProgress });
      await saveAvatarUrl(secure_url);
      onUploaded?.(secure_url);
      setProgress(100);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'overlay') {
    const sizeStyle = { width: `${sizePx}px`, height: `${sizePx}px` } as React.CSSProperties;
    const current = preview || user?.photoURL || null;
    return (
      <div className={`relative inline-block ${className}`} style={sizeStyle}>
        <div className="w-full h-full rounded-full overflow-hidden bg-muted ring-4 ring-primary/20">
          {current ? (
            <img src={current} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">No photo</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg grid place-items-center text-white disabled:opacity-60"
          disabled={busy}
          aria-label="Change avatar"
          title="Change avatar"
        >
          <Camera className="w-4 h-4" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        {busy && <div className="mt-2"><Progress value={progress} /></div>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt="current" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">No photo</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept="image/*" onChange={onPick} disabled={busy} />
          <Button size="sm" onClick={() => onUpload()} disabled={!file || busy}>Upload</Button>
        </div>
      </div>
      {busy && <Progress value={progress} />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">Max 5 MB. JPG/PNG/WEBP recommended. A square crop is recommended for best results.</p>
    </div>
  );
}
