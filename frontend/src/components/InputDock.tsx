'use client';

import { useEffect, useRef, useState } from 'react';
import { detectDir } from '@/lib/utils';

interface InputDockProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function InputDock({ value, onChange, onSend, disabled }: InputDockProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const dir = detectDir(value);
  const [phToggle, setPhToggle] = useState(false);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 144) + 'px';
  }, [value]);

  useEffect(() => {
    const t = setInterval(() => setPhToggle((p) => !p), 4200);
    return () => clearInterval(t);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="input-dock">
      <div style={{ width: '100%', maxWidth: 768, position: 'relative' }}>
        <div className="input-shell">
          <textarea
            ref={taRef}
            className="input-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKey}
            placeholder={phToggle ? 'اسألني أي شي...' : 'Ask me anything...'}
            dir={dir}
            rows={1}
            aria-label="Message input"
          />
          <button
            className={`send-btn ${hasText && !disabled ? 'active' : ''}`}
            onClick={() => hasText && !disabled && onSend()}
            disabled={!hasText || disabled}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
        <div className="input-hint">
          <kbd>⏎</kbd> to send · <kbd>Shift</kbd>+<kbd>⏎</kbd> for new line
        </div>
      </div>
    </div>
  );
}
