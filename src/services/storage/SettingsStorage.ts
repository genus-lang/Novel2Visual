// ─── SettingsStorage ─────────────────────────────────────────────────────────

import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '@/constants/storage';

export interface AppSettings {
  geminiTabId?: number;
  defaultGenre?: string;
  defaultVisualStyle?: string;
  defaultAspectRatio?: string;
  autoDownload: boolean;
}

const DEFAULTS: AppSettings = {
  autoDownload: false,
};

export class SettingsStorage {
  private storage = new StorageService();

  async get(): Promise<AppSettings> {
    const stored = await this.storage.get<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULTS, ...stored };
  }

  async update(updates: Partial<AppSettings>): Promise<void> {
    const current = await this.get();
    await this.storage.set(STORAGE_KEYS.SETTINGS, { ...current, ...updates });
  }
}
