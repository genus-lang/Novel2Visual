// ─── Storage Key Constants ────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  PROJECTS: 'n2v_projects',
  ACTIVE_PROJECT_ID: 'n2v_active_project_id',
  SETTINGS: 'n2v_settings',
  GEMINI_TAB_ID: 'n2v_gemini_tab_id',
} as const;

// ─── IndexedDB Constants ──────────────────────────────────────────────────────

export const IDB_NAME = 'novel2visual';
export const IDB_VERSION = 1;

export const IDB_STORES = {
  CHAPTERS: 'chapters',
  SCENES: 'scenes',
  CHARACTERS: 'characters',
  IMAGES: 'images',
  JOBS: 'jobs',
} as const;
