// ─── useGeneration hook ───────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useGenerationStore } from '@/store/generationStore';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';

export function useGeneration() {
  const store = useGenerationStore();

  const start = useCallback(
    async (jobId: string, projectId: string, chapterId: string) => {
      store.setStatus('running');
      await ChromeMessenger.toBackground({ type: 'START_GENERATION', jobId, projectId, chapterId });
    },
    [store],
  );

  const pause = useCallback(
    async (jobId: string) => {
      store.setStatus('paused');
      await ChromeMessenger.toBackground({ type: 'PAUSE_GENERATION', jobId });
    },
    [store],
  );

  const resume = useCallback(
    async (jobId: string) => {
      store.setStatus('running');
      await ChromeMessenger.toBackground({ type: 'RESUME_GENERATION', jobId });
    },
    [store],
  );

  const stop = useCallback(
    async (jobId: string) => {
      store.setStatus('stopped');
      await ChromeMessenger.toBackground({ type: 'STOP_GENERATION', jobId });
    },
    [store],
  );

  return {
    status: store.status,
    progress: store.progress,
    currentSceneId: store.currentSceneId,
    start,
    pause,
    resume,
    stop,
  };
}
