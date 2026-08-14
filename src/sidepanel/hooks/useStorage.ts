// ─── useStorage hook ──────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Loads all persisted data on mount. Call once at the app root. */
export function useStorage() {
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const loadSettings = useSettingsStore((s) => s.load);

  useEffect(() => {
    void loadProjects();
    void loadSettings();
  }, [loadProjects, loadSettings]);
}
