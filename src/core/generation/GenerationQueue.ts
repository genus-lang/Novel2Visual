// ─── GenerationQueue ─────────────────────────────────────────────────────────
// Ordered list of scene prompts with status tracking.

import type { QueueItem } from './GenerationTypes';
import { MAX_RETRY_ATTEMPTS } from '@/constants/generation';

export class GenerationQueue {
  private items: QueueItem[] = [];

  load(sceneIds: string[], prompts: Map<string, string>): void {
    this.items = sceneIds.map((id) => ({
      sceneId: id,
      prompt: prompts.get(id) ?? '',
      status: 'waiting',
      retries: 0,
    }));
  }

  hasPending(): boolean {
    return this.items.some((item) => item.status === 'waiting');
  }

  next(): QueueItem | undefined {
    return this.items.find((item) => item.status === 'waiting');
  }

  markGenerating(sceneId: string): void {
    this.updateItem(sceneId, { status: 'generating' });
  }

  markCompleted(sceneId: string, imageUrl: string): void {
    this.updateItem(sceneId, { status: 'completed', imageUrl });
  }

  markFailed(sceneId: string, error: string): void {
    const item = this.getItem(sceneId);
    if (!item) return;

    if (item.retries < MAX_RETRY_ATTEMPTS) {
      this.updateItem(sceneId, { status: 'waiting', retries: item.retries + 1, error });
    } else {
      this.updateItem(sceneId, { status: 'failed', error });
    }
  }

  getAll(): QueueItem[] {
    return [...this.items];
  }

  private getItem(sceneId: string): QueueItem | undefined {
    return this.items.find((i) => i.sceneId === sceneId);
  }

  private updateItem(sceneId: string, updates: Partial<QueueItem>): void {
    const index = this.items.findIndex((i) => i.sceneId === sceneId);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updates };
    }
  }
}
