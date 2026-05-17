'use client';

import { MascotLarge } from './Mascot';

const SUGGESTIONS = [
  { icon: '💡', text: 'Explain quantum computing simply', dir: 'ltr' },
  { icon: '✉️', text: 'Help me write a professional email', dir: 'ltr' },
  { icon: '🧠', text: "What's the difference between AI and ML?", dir: 'ltr' },
  { icon: '🌐', text: 'اشرحلي البرمجة الكائنية', dir: 'rtl' },
] as const;

interface EmptyStateProps {
  onSuggest: (text: string) => void;
}

export function EmptyState({ onSuggest }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-mascot">
        <MascotLarge />
      </div>
      <h1 className="empty-headline">Hi, how can I help?</h1>
      <div className="empty-headline empty-headline-ar">مرحبا، كيف ممكن أساعدك؟</div>
      <div className="empty-sub">Pick a starter or just type below.</div>

      <div className="suggest-grid">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="suggest-card"
            onClick={() => onSuggest(s.text)}
          >
            <span className="suggest-icon">{s.icon}</span>
            <span className="suggest-text" dir={s.dir}>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
