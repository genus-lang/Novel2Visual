// ─── CharacterConsistency ─────────────────────────────────────────────────────
// Validates that a prompt contains character descriptions consistent with the bible.

import { CharacterBible } from './CharacterBible';

export class CharacterConsistency {
  constructor(private bible: CharacterBible) {}

  /**
   * Generates a markdown block of character descriptions for the prompt.
   */
  buildCharacterBlock(): string {
    const descriptions: string[] = [];
    const allCharacters = this.bible.all();

    for (const char of allCharacters) {
      const desc = this.bible.buildVisualDescription(char.name);
      if (desc) descriptions.push(`- ${desc}`);
    }

    if (descriptions.length === 0) return '';

    return descriptions.join('\n');
  }
}
