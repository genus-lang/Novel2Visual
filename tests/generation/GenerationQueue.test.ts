import { describe, it, expect } from 'vitest';
import { GenerationQueue } from '@/core/generation/GenerationQueue';

describe('GenerationQueue', () => {
  it('marks items and tracks pending', () => {
    const q = new GenerationQueue();
    q.load(['s1','s2'], new Map([['s1','prompt1'],['s2','prompt2']]));
    expect(q.hasPending()).toBe(true);
    q.markCompleted('s1', 'data:image/png;base64,...');
    expect(q.hasPending()).toBe(true);
    q.markCompleted('s2', 'data:image/png;base64,...');
    expect(q.hasPending()).toBe(false);
  });
});
