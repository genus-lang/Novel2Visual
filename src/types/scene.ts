// ─── Scene Types ──────────────────────────────────────────────────────────────

export type SceneStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'skipped';

export type SceneImportance = 1 | 2 | 3 | 4 | 5;

export interface Scene {
  id: string;
  chapterId: string;
  projectId: string;

  /** Display index (1-based) within the chapter */
  index: number;

  title: string;
  summary: string;

  /** Raw paragraph(s) that the scene was extracted from */
  sourceText: string;

  characters: string[];
  location?: string;
  timeOfDay?: string;
  mood?: string;
  visualElements?: string[];

  /** 1 (minor) – 5 (pivotal) */
  importance: SceneImportance;

  /** The final prompt sent to Gemini */
  prompt?: string;

  status: SceneStatus;
  error?: string;

  /** URL / base64 / blob URL of the generated image */
  imageUrl?: string;

  createdAt: number;
  updatedAt: number;
}

export interface SceneFilter {
  minImportance?: SceneImportance;
  maxScenes?: number;
  includeAll?: boolean;
}
