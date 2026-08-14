// ─── SceneDetector ────────────────────────────────────────────────────────────
// Identifies which paragraph groups represent distinct visual scenes.

import type { ParsedChapter } from '@/types/chapter';
import type { RawScene } from './SceneTypes';

export class SceneDetector {
  /**
   * Detects candidate scenes from a parsed chapter.
   * A "scene" is a group of 1–4 consecutive paragraphs that share
   * a common location/character focus.
   */
  detect(chapter: ParsedChapter): RawScene[] {
    const { paragraphs } = chapter;
    const scenes: RawScene[] = [];
    let i = 0;

    while (i < paragraphs.length) {
      const group = paragraphs.slice(i, i + 3);
      const sourceText = group.join('\n\n');

      const characters = this.extractMentionedNames(sourceText);
      const location = this.extractLocation(sourceText);
      const mood = this.extractMood(sourceText);
      const visualElements = this.extractVisualElements(sourceText);

      scenes.push({
        paragraphIndices: Array.from({ length: group.length }, (_, k) => i + k),
        sourceText,
        characters,
        location,
        mood,
        visualElements,
        rawScore: 0, // filled in by SceneScorer
      });

      i += 3;
    }

    return scenes;
  }

  private extractMentionedNames(text: string): string[] {
    // Simple heuristic: capitalised words not at sentence start
    const matches = text.match(/(?<=[a-z,] )[A-Z][a-z]+/g) ?? [];
    return [...new Set(matches)];
  }

  private extractLocation(text: string): string | undefined {
    const locationPatterns = [
      /(?:in the|at the|inside the|outside the|within the|entered the|arrived at)(?: \w+){1,4}/i,
    ];
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) return match[0].replace(/^(?:in the|at the|inside the|outside the|within the|entered the|arrived at)\s*/i, '');
    }
    return undefined;
  }

  private extractMood(text: string): string | undefined {
    const moodMap: Record<string, string[]> = {
      tense: ['danger', 'fear', 'threat', 'panic', 'trembled'],
      epic: ['powerful', 'incredible', 'massive', 'divine', 'ancient'],
      mysterious: ['hidden', 'secret', 'unknown', 'shadow', 'dark'],
      romantic: ['beautiful', 'gentle', 'soft', 'heart', 'love'],
    };

    const lowerText = text.toLowerCase();
    for (const [mood, keywords] of Object.entries(moodMap)) {
      if (keywords.some((kw) => lowerText.includes(kw))) return mood;
    }
    return undefined;
  }

  private extractVisualElements(text: string): string[] {
    const visualTerms = [
      'lightning', 'fire', 'flames', 'light', 'darkness', 'glow', 'aura',
      'sword', 'blood', 'tears', 'rain', 'snow', 'fog', 'mist', 'shadow',
      'energy', 'explosion', 'portal', 'runes', 'symbols',
    ];
    const lower = text.toLowerCase();
    return visualTerms.filter((term) => lower.includes(term));
  }
}
