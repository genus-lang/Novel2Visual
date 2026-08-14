// ─── CharacterExtractor ───────────────────────────────────────────────────────
// Finds character names and basic appearance hints in chapter text.

import type { ExtractedCharacterMention } from './CharacterTypes';

export class CharacterExtractor {
  /**
   * Finds all proper-noun mentions that could be character names.
   */
  extractMentions(paragraphs: string[]): ExtractedCharacterMention[] {
    const mentions: ExtractedCharacterMention[] = [];

    paragraphs.forEach((paragraph, index) => {
      // Look for capitalised words after dialogue tags or action verbs
      const namePattern = /(?:said|called|shouted|whispered|asked|replied|said|yelled)\s+([A-Z][a-z]+)/g;
      let match: RegExpExecArray | null;

      while ((match = namePattern.exec(paragraph)) !== null) {
        mentions.push({
          name: match[1],
          paragraphIndex: index,
          context: paragraph.slice(Math.max(0, match.index - 50), match.index + 100),
        });
      }
    });

    return mentions;
  }

  /**
   * Returns a deduplicated list of unique character names from mentions.
   */
  uniqueNames(mentions: ExtractedCharacterMention[]): string[] {
    return [...new Set(mentions.map((m) => m.name))];
  }
}
