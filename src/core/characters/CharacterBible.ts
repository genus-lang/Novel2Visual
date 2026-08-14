// ─── CharacterBible ───────────────────────────────────────────────────────────
// In-memory store for character visual profiles used during prompt building.

import type { Character } from '@/types/character';

export class CharacterBible {
  private characters: Map<string, Character> = new Map();

  add(character: Character): void {
    this.characters.set(character.name.toLowerCase(), character);
  }

  get(name: string): Character | undefined {
    return this.characters.get(name.toLowerCase());
  }

  has(name: string): boolean {
    return this.characters.has(name.toLowerCase());
  }

  update(name: string, updates: Partial<Character>): void {
    const existing = this.get(name);
    if (existing) {
      this.characters.set(name.toLowerCase(), { ...existing, ...updates, updatedAt: Date.now() });
    }
  }

  all(): Character[] {
    return [...this.characters.values()];
  }

  buildVisualDescription(name: string): string | undefined {
    const character = this.get(name);
    if (!character) return undefined;

    const { appearance, visualDescription } = character;
    const parts: string[] = [name];

    if (appearance.age) parts.push(`age ${appearance.age}`);
    if (appearance.gender) parts.push(appearance.gender);
    if (appearance.hair) parts.push(`${appearance.hair} hair`);
    if (appearance.eyes) parts.push(`${appearance.eyes} eyes`);
    if (appearance.clothing) parts.push(`wearing ${appearance.clothing}`);
    if (character.weapons?.length) parts.push(`wielding ${character.weapons.join(', ')}`);

    let finalDesc = parts.join(', ');
    if (visualDescription) {
      finalDesc += `. ${visualDescription}`;
    }

    return finalDesc;
  }
}
