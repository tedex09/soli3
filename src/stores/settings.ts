import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  primaryColor: string;
  platformEnabled: boolean;
  disabledMessage: string;
}

interface SettingsState {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        primaryColor: '#1DB954',
        platformEnabled: true,
        disabledMessage: '',
      },
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);