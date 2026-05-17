const ARABIC_RE = /[؀-ۿݐ-ݿ]/;

export function detectDir(text: string): 'ltr' | 'rtl' {
  if (!text) return 'ltr';
  const first = text.trim().slice(0, 24);
  return ARABIC_RE.test(first) ? 'rtl' : 'ltr';
}

export function firstChar(s: string): string {
  const t = (s || '?').trim();
  return Array.from(t)[0] || '?';
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}
