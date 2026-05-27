'use client';

import { useState } from 'react';
import { ReasoningSummary } from '@/hooks/useChat';
import { Language } from '@/lib/i18n';

interface Props {
  summary: ReasoningSummary;
  lang?: Language;
}

const TRANSLATIONS = {
  en: {
    prepared: 'How this answer was prepared',
    answerMode: 'Answer mode',
    filesUsed: 'Uploaded files used',
    chunks: 'Retrieved chunks',
    files: 'Files',
    basis: 'Basis of answer',
    confidence: 'Confidence',
    yes: 'Yes',
    no: 'No',
    modes: {
      simple: 'Simple',
      deep: 'Deep',
      exam: 'Exam',
      code: 'Code',
      interview: 'Interview',
    },
    basisTypes: {
      uploaded_files: 'Uploaded documents',
      general_knowledge: 'General model knowledge',
      mixed: 'Uploaded documents + general knowledge',
    },
    confidenceLevels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    }
  },
  ar: {
    prepared: 'كيف تم إعداد الإجابة',
    answerMode: 'نمط الإجابة',
    filesUsed: 'الملفات المستخدمة',
    chunks: 'الفقرات المسترجعة',
    files: 'الملفات',
    basis: 'أساس الإجابة',
    confidence: 'مستوى الثقة',
    yes: 'نعم',
    no: 'لا',
    modes: {
      simple: 'بسيط',
      deep: 'عميق',
      exam: 'دراسة',
      code: 'برمجية',
      interview: 'مقابلة',
    },
    basisTypes: {
      uploaded_files: 'المستندات المرفوعة',
      general_knowledge: 'المعرفة العامة للنموذج',
      mixed: 'المستندات المرفوعة + المعرفة العامة',
    },
    confidenceLevels: {
      high: 'عالٍ',
      medium: 'متوسط',
      low: 'منخفض',
    }
  }
};

export function ReasoningSummaryBlock({ summary, lang = 'en' }: Props) {
  const [open, setOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const modeLabel = t.modes[summary.mode as keyof typeof t.modes] || summary.mode;
  const basisLabel = t.basisTypes[summary.basis as keyof typeof t.basisTypes] || summary.basis;
  const confidenceLabel = t.confidenceLevels[summary.confidence as keyof typeof t.confidenceLevels] || summary.confidence;

  return (
    <div className="reasoning-block" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button
        className="reasoning-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          className={`icon-stroke reasoning-chevron ${open ? 'open' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {t.prepared}
      </button>

      {open && (
        <div className="reasoning-body">
          <div className="reasoning-row">
            <span className="reasoning-key">{t.answerMode}</span>
            <span className="reasoning-val">{modeLabel}</span>
          </div>
          <div className="reasoning-row">
            <span className="reasoning-key">{t.filesUsed}</span>
            <span className="reasoning-val">{summary.usedUploadedFiles ? t.yes : t.no}</span>
          </div>
          {summary.usedUploadedFiles && (
            <>
              <div className="reasoning-row">
                <span className="reasoning-key">{t.chunks}</span>
                <span className="reasoning-val">{summary.retrievedChunks}</span>
              </div>
              {summary.usedFiles && summary.usedFiles.length > 0 && (
                <div className="reasoning-row">
                  <span className="reasoning-key">{t.files}</span>
                  <span className="reasoning-val">{summary.usedFiles.join(', ')}</span>
                </div>
              )}
            </>
          )}
          <div className="reasoning-row">
            <span className="reasoning-key">{t.basis}</span>
            <span className="reasoning-val">{basisLabel}</span>
          </div>
          <div className="reasoning-row">
            <span className="reasoning-key">{t.confidence}</span>
            <span className={`reasoning-val confidence-${summary.confidence}`}>
              {confidenceLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
