// ─── GenerationController ─────────────────────────────────────────────────────
// Wires the GenerationQueue, GenerationWorker, and GenerationState together.

import { GenerationQueue } from './GenerationQueue';
import { GenerationWorker, type GenerationWorkerCallbacks } from './GenerationWorker';
import { GenerationState } from './GenerationState';
import type { Scene } from '@/types/scene';

export class GenerationController {
  private queue = new GenerationQueue();
  readonly state = new GenerationState();
  private worker: GenerationWorker | null = null;

  initialise(scenes: Scene[], prompts: Map<string, string>): void {
    const sceneIds = scenes.map((s) => s.id);
    this.queue.load(sceneIds, prompts);
    this.state.reset(sceneIds.length);
  }

  async start(callbacks: GenerationWorkerCallbacks): Promise<void> {
    this.worker = new GenerationWorker(this.queue, this.state, callbacks);
    await this.worker.run();
  }

  pause(): void {
    this.worker?.pause();
    this.state.status = 'paused';
  }

  resume(): void {
    this.worker?.resume();
    this.state.status = 'running';
  }

  stop(): void {
    this.worker?.stop();
    this.state.status = 'stopped';
  }

  getQueue() {
    return this.queue.getAll();
  }
}
