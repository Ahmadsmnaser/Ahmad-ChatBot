'use client';

import { Mascot } from './Mascot';
import { detectDir, firstChar, formatTime } from '@/lib/utils';
import { ChatSession } from '@/lib/api';

const MODELS = [
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8×7B' },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapseToggle: () => void;
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  model: string;
  onModelChange: (v: string) => void;
  temperature: number;
  onTempChange: (v: number) => void;
  systemPrompt: string;
  onSysPromptChange: (v: string) => void;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed, onCollapseToggle, sessions, activeId, onSelect, onDelete, onNewChat,
  model, onModelChange, temperature, onTempChange, systemPrompt, onSysPromptChange, onMobileClose,
}: SidebarProps) {
  if (collapsed) {
    return (
      <aside className="sidebar collapsed" role="navigation">
        <button className="sb-mini-brand" onClick={onCollapseToggle} aria-label="Expand sidebar" data-tip="Expand">
          <Mascot size={28} />
        </button>
        <button className="sb-mini-newchat" onClick={onNewChat} aria-label="New chat" data-tip="New chat">
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
          <button className="sb-mini-icon" data-tip={`${MODELS.find(m => m.id === model)?.label ?? 'Settings'} · t=${temperature.toFixed(1)}`} onClick={onCollapseToggle} aria-label="Settings">
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
          <span className="sb-brand-name">Ahmad&apos;s Chatbot</span>
          <span className="sb-brand-sub">Friendly AI assistant</span>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNewChat} aria-label="Start a new chat">
        <svg width="16" height="16" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="new-chat-label">New Chat</span>
      </button>

      <div className="sb-section-label">Recent chats</div>

      <div className="sb-history">
        {sessions.length === 0 && (
          <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            No chats yet. Start a new one!
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
              aria-label="Delete chat"
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="sb-divider" />

      <div className="sb-settings">
        <div className="setting-row">
          <label className="setting-label">
            Model
            <span className="info-icon" data-tip="Which LLM serves your messages">
              <svg width="12" height="12" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
          </label>
          <select className="select-input" value={model} onChange={(e) => onModelChange(e.target.value)}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>

        <div className="setting-row">
          <label className="setting-label">
            Temperature
            <span className="info-icon" data-tip="Higher = more creative, lower = more focused">
              <svg width="12" height="12" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
          </label>
          <div className="temp-slider-row">
            <input
              type="range" className="temp-slider"
              min="0" max="2" step="0.1"
              value={temperature}
              onChange={(e) => onTempChange(parseFloat(e.target.value))}
              aria-label="Model temperature"
            />
            <span className="temp-pill">{temperature.toFixed(1)}</span>
          </div>
        </div>

        <div className="setting-row">
          <label className="setting-label">
            System prompt
            <span className="info-icon" data-tip="Sets the assistant's behavior for every chat">
              <svg width="12" height="12" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
          </label>
          <div className="sysprompt-wrap">
            <textarea
              className="text-input sysprompt"
              value={systemPrompt}
              onChange={(e) => onSysPromptChange(e.target.value)}
              maxLength={500}
            />
            <span className="char-count">{systemPrompt.length} / 500</span>
          </div>
        </div>
      </div>

      <button className="sb-collapse-btn" onClick={onCollapseToggle} aria-label="Collapse sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" className="icon-stroke" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Collapse</span>
      </button>
    </aside>
  );
}
