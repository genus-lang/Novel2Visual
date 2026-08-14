// ─── GeminiState ─────────────────────────────────────────────────────────────
// Observable state of the Gemini tab as seen by the content script.

import type { GeminiState } from '@/types/gemini';

export class GeminiStateTracker {
  private _state: GeminiState = 'idle';
  private listeners: ((state: GeminiState) => void)[] = [];

  get state(): GeminiState {
    return this._state;
  }

  set(state: GeminiState): void {
    if (state !== this._state) {
      this._state = state;
      this.listeners.forEach((fn) => fn(state));
    }
  }

  onChange(fn: (state: GeminiState) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}
