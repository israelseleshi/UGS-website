const THEME_STORAGE_KEY = 'theme';

export type AppTheme = 'light' | 'dark';

export function getSystemPrefersDark(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getTheme(): AppTheme {
  if (typeof document === 'undefined') return 'light';
  if (document.documentElement.classList.contains('dark')) return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return getSystemPrefersDark() ? 'dark' : 'light';
}

export function setTheme(theme: AppTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  const evt = new CustomEvent<AppTheme>('themechange', { detail: theme });
  window.dispatchEvent(evt);
}

export function toggleTheme(): AppTheme {
  const next: AppTheme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}


