// ─── CharacterConsistency ─────────────────────────────────────────────────────
// Validates that a prompt contains character descriptions consistent with the bible.

import { CharacterBible } from './CharacterBible';

export class CharacterConsistency {
  constructor(private bible: CharacterBible) {}

  /**
   * Generates a markdown block of character descriptions for the prompt.
   */
  buildCharacterBlock(mentionedNames: string[]): string {
    const descriptions: string[] = [];

    for (const name of mentionedNames) {
      const desc = this.bible.buildVisualDescription(name);
      if (desc) descriptions.push(`- ${desc}`);
    }

    if (descriptions.length === 0) return '';

    return descriptions.join('\n');
  }
}
