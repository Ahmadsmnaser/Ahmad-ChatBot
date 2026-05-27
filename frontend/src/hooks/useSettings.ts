import { useState, useEffect } from 'react';
import { Language } from '../lib/i18n';

export interface UserSettings {
  lang: Language;
  fontSize: 'small' | 'medium' | 'large';
  nickname: string;
  soundsEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  lang: 'en',
  fontSize: 'medium',
  nickname: 'User',
  soundsEnabled: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chatbot_user_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('chatbot_user_settings', JSON.stringify(next));
      return next;
    });
  };

  return { settings, updateSettings, loaded };
}
