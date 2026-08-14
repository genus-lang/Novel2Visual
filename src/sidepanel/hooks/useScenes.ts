// ─── useScenes hook ───────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import { ScenePlanner } from '@/core/scenes/ScenePlanner';
import { ChapterParser } from '@/core/chapter/ChapterParser';
import type { SceneFilter } from '@/types/scene';

const parser = new ChapterParser();
const planner = new ScenePlanner();

export function useScenes() {
  const { scenes, setScenes, updateScene, clearScenes } = useSceneStore();

  const analyzeChapter = useCallback(
    async (rawText: string, projectId: string, filter: SceneFilter = {}) => {
      const chapter = parser.parse(rawText, projectId);
      const extracted = planner.plan(chapter, filter);
      await setScenes(extracted);
      return extracted;
    },
    [setScenes],
  );

  return { scenes, analyzeChapter, updateScene, clearScenes };
}
