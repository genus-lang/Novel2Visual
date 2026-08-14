// ─── GenerationWorker ────────────────────────────────────────────────────────
// Drives the queue loop: fetch next scene → send to Gemini → wait → save image.
// This class is provider-agnostic: it communicates through the ChromeMessenger.

import type { GenerationQueue } from './GenerationQueue';
import type { GenerationState } from './GenerationState';
import { createLogger } from '@/utils/logger';
import { INTER_SCENE_DELAY_MS } from '@/constants/generation';

const logger = createLogger('GenerationWorker');

export interface GenerationWorkerCallbacks {
  onSceneStart: (sceneId: string) => void;
  onSceneComplete: (sceneId: string, imageUrl: string) => void;
  onSceneFailed: (sceneId: string, error: string) => void;
  onQueueComplete: () => void;
  sendPromptToGemini: (sceneId: string, prompt: string) => Promise<void>;
  waitForGeminiResult: (sceneId: string) => Promise<string>; // resolves with imageUrl
}

export class GenerationWorker {
  private aborted = false;
  private paused = false;

  constructor(
    private queue: GenerationQueue,
    private state: GenerationState,
    private callbacks: GenerationWorkerCallbacks,
  ) {}

  pause(): void {
    this.paused = true;
    logger.info('Worker paused');
  }

  resume(): void {
    this.paused = false;
    logger.info('Worker resumed');
  }

  stop(): void {
    this.aborted = true;
    logger.info('Worker stopped');
  }

  async run(): Promise<void> {
    logger.info('Worker started');
    this.state.status = 'running';

    while (this.queue.hasPending() && !this.aborted) {
      // Wait while paused
      if (this.paused) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      const item = this.queue.next();
      if (!item) break;

      logger.info(`Processing scene: ${item.sceneId}`);
      this.queue.markGenerating(item.sceneId);
      this.callbacks.onSceneStart(item.sceneId);

      try {
        await this.callbacks.sendPromptToGemini(item.sceneId, item.prompt);
        const imageUrl = await this.callbacks.waitForGeminiResult(item.sceneId);

        this.queue.markCompleted(item.sceneId, imageUrl);
        this.state.completedCount++;
        this.callbacks.onSceneComplete(item.sceneId, imageUrl);

        // Brief pause before sending the next prompt
        await new Promise((resolve) => setTimeout(resolve, INTER_SCENE_DELAY_MS));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.queue.markFailed(item.sceneId, message);
        this.state.failedCount++;
        this.callbacks.onSceneFailed(item.sceneId, message);
        logger.error(`Scene ${item.sceneId} failed:`, message);
      }

      this.state.currentSceneIndex++;
    }

    if (!this.aborted) {
      this.state.status = 'completed';
      this.callbacks.onQueueComplete();
      logger.info('Queue complete');
    }
  }
}
