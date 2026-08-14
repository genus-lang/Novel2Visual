// ─── SceneScorer ─────────────────────────────────────────────────────────────
// Assigns a visual importance score (1–5) to each raw scene candidate.

import type { RawScene } from './SceneTypes';
import type { SceneImportance } from '@/types/scene';

const ACTION_KEYWORDS = [
  'attacked', 'exploded', 'shattered', 'descended', 'awakened', 'appeared',
  'revealed', 'transformed', 'collapsed', 'unleashed', 'activated', 'breakthrough',
  'lightning', 'flames', 'darkness', 'glow', 'aura', 'power', 'battle', 'fight',
  'sword', 'trembled', 'roared', 'screamed', 'vanished', 'portal',
];

export class SceneScorer {
  score(scene: RawScene): SceneImportance {
    let score = 0;

    // Character presence
    if (scene.characters.length > 0) score += 1;
    if (scene.characters.length > 2) score += 1;

    // Action keyword density
    const actionCount = ACTION_KEYWORDS.filter((kw) =>
      scene.sourceText.toLowerCase().includes(kw),
    ).length;
    if (actionCount >= 1) score += 1;
    if (actionCount >= 3) score += 1;

    // Location / environment description
    if (scene.location) score += 1;

    // Visual elements
    if (scene.visualElements.length > 0) score += 1;

    // Clamp to 1–5
    return (Math.min(5, Math.max(1, score)) as SceneImportance);
  }
}
