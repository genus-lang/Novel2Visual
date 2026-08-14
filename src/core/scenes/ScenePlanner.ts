// ─── ScenePlanner ─────────────────────────────────────────────────────────────
// Orchestrates the full scene pipeline: detect → score → extract → plan.

import type { ParsedChapter } from '@/types/chapter';
import type { Scene, SceneFilter } from '@/types/scene';
import { SceneDetector } from './SceneDetector';
import { SceneExtractor } from './SceneExtractor';

export class ScenePlanner {
  private detector = new SceneDetector();
  private extractor = new SceneExtractor();

  plan(chapter: ParsedChapter, filter: SceneFilter = {}): Scene[] {
    const rawScenes = this.detector.detect(chapter);
    return this.extractor.extract(rawScenes, chapter.id, chapter.projectId, filter);
  }
}
