'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatSession, fetchSessions, createSession, fetchSession, deleteSession, updateSession } from '@/lib/api';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await fetchSessions();
      setSessions(list);
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createNewSession = useCallback(async (title?: string) => {
    setLoading(true);
    try {
      const session = await createSession(title);
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setActiveSession(session);
      return session;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const session = await fetchSession(id);
      setActiveSessionId(id);
      setActiveSession(session);
      return session;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSession = useCallback(
    async (id: string) => {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === activeSessionId) {
        setActiveSessionId(null);
        setActiveSession(null);
      }
    },
    [activeSessionId]
  );

  const renameSession = useCallback(
    async (id: string, title: string) => {
      const updated = await updateSession(id, { title });
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
      if (id === activeSessionId) {
        setActiveSession((prev) => (prev ? { ...prev, title } : prev));
      }
      return updated;
    },
    [activeSessionId]
  );

  return {
    sessions,
    activeSessionId,
    activeSession,
    loading,
    refresh,
    createNewSession,
    loadSession,
    removeSession,
    renameSession,
  };
}
