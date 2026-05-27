'use client';

import { Mascot } from './Mascot';
import { detectDir, firstChar, formatTime } from '@/lib/utils';
import { ChatSession } from '@/lib/api';
import { translations, Language } from '@/lib/i18n';

interface SidebarProps {
  collapsed: boolean;
  onCollapseToggle: () => void;
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  model: string;
  temperature: number;
  onSettingsOpen: () => void;
  lang: Language;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  onCollapseToggle,
  sessions,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  model,
  temperature,
  onSettingsOpen,
  lang,
  onMobileClose,
}: SidebarProps) {
  const t = translations[lang];

  if (collapsed) {
    return (
      <aside className="sidebar collapsed" role="navigation">
        <button className="sb-mini-brand" onClick={onCollapseToggle} aria-label="Expand sidebar" data-tip="Expand">
          <Mascot size={28} />
        </button>
        <button className="sb-mini-newchat" onClick={onNewChat} aria-label={t.newChat} data-tip={t.newChat}>
          <svg width="18" height="18" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <div className="sb-mini-divider" />
        <div className="sb-mini-history">
          {sessions.map((s) => (
            <button
              key={s.id}
              className={`mini-chat ${s.id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(s.id)}
              data-tip={s.title}
              aria-label={s.title}
            >
              <span dir={detectDir(s.title)}>{firstChar(s.title)}</span>
            </button>
          ))}
        </div>
        <div className="sb-mini-foot">
          <div className="sb-mini-divider" />
          <button className="sb-mini-icon" data-tip={t.settings} onClick={onSettingsOpen} aria-label={t.settings}>
            <svg width="18" height="18" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.15.67.39.91.71.24.32.39.7.42 1.09 0 .39-.13.78-.36 1.1A1.65 1.65 0 0 0 19.4 15z" />
            </svg>
          </button>
          <button className="sb-mini-icon" onClick={onCollapseToggle} aria-label="Expand sidebar" data-tip="Expand">
            <svg width="18" height="18" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar" role="navigation">
      <div className="sb-brand">
        <Mascot size={32} />
        <div className="sb-brand-text">
          <span className="sb-brand-name">{t.brandName}</span>
          <span className="sb-brand-sub">{t.brandSub}</span>
        </div>
        <button
          className="icon-btn sb-settings-trigger"
          onClick={onSettingsOpen}
          aria-label={t.settings}
          style={{ marginInlineStart: 'auto' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.15.67.39.91.71.24.32.39.7.42 1.09 0 .39-.13.78-.36 1.1A1.65 1.65 0 0 0 19.4 15z" />
          </svg>
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat} aria-label={t.newChat}>
        <svg width="16" height="16" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="new-chat-label">{t.newChat}</span>
      </button>

      <div className="sb-section-label">{t.recentChats}</div>

      <div className="sb-history">
        {sessions.length === 0 && (
          <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            {t.noChats}
          </div>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`chat-item ${s.id === activeId ? 'active' : ''}`}
            onClick={() => { onSelect(s.id); onMobileClose?.(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { onSelect(s.id); onMobileClose?.(); } }}
          >
            <div className="chat-item-body">
              <div className="chat-item-title" dir={detectDir(s.title)}>{s.title}</div>
              <div className="chat-item-meta">
                <span>{formatTime(s.updated_at)}</span>
                <span className="dot">·</span>
                <span>{s.message_count} msgs</span>
              </div>
            </div>
            <button
              className="delete-btn"
              aria-label={t.deleteChat}
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="sb-divider" />

      <button className="sb-collapse-btn" onClick={onCollapseToggle} aria-label="Collapse sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Collapse</span>
      </button>
    </aside>
  );
}
