'use client';

import { AnswerMode } from '@/hooks/useChat';
import { Language, translations } from '@/lib/i18n';
import { ModeConfig } from '@/lib/api';

const MODES: AnswerMode[] = ['simple', 'deep', 'exam', 'code', 'interview'];

const MODE_ICONS: Record<AnswerMode, string> = {
  simple: '💡',
  deep: '🔬',
  exam: '📝',
  code: '💻',
  interview: '🎯',
};

interface ModeSelectorProps {
  value: AnswerMode;
  onChange: (mode: AnswerMode) => void;
  lang: Language;
  modeConfigs?: Record<string, ModeConfig>;
}

export function ModeSelector({ value, onChange, lang }: ModeSelectorProps) {
  const t = translations[lang];
  const idx = MODES.indexOf(value);

  const prev = () => onChange(MODES[(idx - 1 + MODES.length) % MODES.length]);
  const next = () => onChange(MODES[(idx + 1) % MODES.length]);

  const modeText = t.modes[value];

  return (
    <div className="mode-stepper">
      <button className="mode-arrow" onClick={prev} aria-label="Previous mode">‹</button>
      <div className="mode-current">
        <span className="mode-icon" aria-hidden="true">{MODE_ICONS[value]}</span>
        <span className="mode-label">{modeText.label}</span>
        <span className="mode-desc">{modeText.desc}</span>
      </div>
      <button className="mode-arrow" onClick={next} aria-label="Next mode">›</button>
    </div>
  );
}
