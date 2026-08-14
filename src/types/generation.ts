// ─── Generation Types ─────────────────────────────────────────────────────────

export type GenerationStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'error';

export interface GenerationJob {
  id: string;
  projectId: string;
  chapterId: string;

  /** Ordered list of scene IDs to generate */
  sceneIds: string[];

  status: GenerationStatus;
  currentSceneIndex: number;

  /** Gemini tab ID this job is attached to */
  geminiTabId?: number;

  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string; // scene ID
  percentage: number;
}
