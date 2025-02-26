import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  requestLimitPerDay: number;
  requestLimitPerWeek: number;
  whatsappEnabled: boolean;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
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
        requestLimitPerDay: 10,
        requestLimitPerWeek: 50,
        whatsappEnabled: false,
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