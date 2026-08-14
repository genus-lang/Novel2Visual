// ─── settingsStore ────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { SettingsStorage, type AppSettings } from '@/services/storage/SettingsStorage';

const storage = new SettingsStorage();

interface SettingsStore extends AppSettings {
  load: () => Promise<void>;
  update: (updates: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  autoDownload: false,

  load: async () => {
    const settings = await storage.get();
    set(settings);
  },

  update: async (updates) => {
    await storage.update(updates);
    set((state) => ({ ...state, ...updates }));
  },
}));
