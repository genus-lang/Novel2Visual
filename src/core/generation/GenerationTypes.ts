// ─── GenerationTypes ──────────────────────────────────────────────────────────

export type QueueItemStatus = 'waiting' | 'generating' | 'completed' | 'failed' | 'skipped';

export interface QueueItem {
  sceneId: string;
  prompt: string;
  status: QueueItemStatus;
  retries: number;
  imageUrl?: string;
  error?: string;
}
