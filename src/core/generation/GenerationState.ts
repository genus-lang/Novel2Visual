// ─── GenerationState ─────────────────────────────────────────────────────────
// Observable state object for the current generation job.

import type { GenerationStatus } from '@/types/generation';

export class GenerationState {
  status: GenerationStatus = 'idle';
  currentSceneIndex = 0;
  completedCount = 0;
  failedCount = 0;
  totalCount = 0;
  isPaused = false;

  get percentage(): number {
    if (this.totalCount === 0) return 0;
    return Math.round(((this.completedCount + this.failedCount) / this.totalCount) * 100);
  }

  reset(total: number): void {
    this.status = 'idle';
    this.currentSceneIndex = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.totalCount = total;
    this.isPaused = false;
  }
}
