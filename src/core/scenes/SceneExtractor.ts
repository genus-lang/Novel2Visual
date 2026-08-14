// ─── SceneExtractor ───────────────────────────────────────────────────────────
// Converts RawScenes into typed Scene objects.

import type { Scene, SceneFilter } from '@/types/scene';
import type { RawScene } from './SceneTypes';
import { SceneScorer } from './SceneScorer';
import { truncate, generateId } from '@/utils/text';

export class SceneExtractor {
  private scorer = new SceneScorer();

  extract(
    rawScenes: RawScene[],
    chapterId: string,
    projectId: string,
    filter: SceneFilter = {},
  ): Scene[] {
    const { minImportance = 1, maxScenes, includeAll = false } = filter;

    let scenes = rawScenes
      .map((raw, index) => {
        const importance = this.scorer.score(raw);
        const scene: Scene = {
          id: generateId(),
          chapterId,
          projectId,
          index: index + 1,
          title: this.buildTitle(raw, index),
          summary: truncate(raw.sourceText, 200),
          sourceText: raw.sourceText,
          characters: raw.characters,
          location: raw.location,
          mood: raw.mood,
          visualElements: raw.visualElements,
          importance,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return scene;
      });

    if (!includeAll) {
      scenes = scenes.filter((s) => s.importance >= minImportance);
    }

    if (maxScenes !== undefined) {
      scenes = scenes
        .sort((a, b) => b.importance - a.importance)
        .slice(0, maxScenes)
        .sort((a, b) => a.index - b.index);
    }

    return scenes;
  }

  private buildTitle(raw: RawScene, index: number): string {
    if (raw.characters.length > 0 && raw.location) {
      return `${raw.characters[0]} at ${raw.location}`;
    }
    if (raw.characters.length > 0) {
      return `${raw.characters[0]}'s scene`;
    }
    return `Scene ${index + 1}`;
  }
}
