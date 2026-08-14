// ─── CharacterStorage ─────────────────────────────────────────────────────────
// Handles persistence of Characters to chrome.storage.local

import { StorageService } from './StorageService';
import type { Character } from '@/types/character';

export class CharacterStorage {
  private storage = new StorageService();
  private readonly PREFIX = 'char_';

  private getKey(projectId: string): string {
    return `${this.PREFIX}${projectId}`;
  }

  async getProjectCharacters(projectId: string): Promise<Character[]> {
    const chars = await this.storage.get<Character[]>(this.getKey(projectId));
    return chars || [];
  }

  async saveProjectCharacters(projectId: string, characters: Character[]): Promise<void> {
    await this.storage.set(this.getKey(projectId), characters);
  }

  async addCharacter(projectId: string, character: Character): Promise<void> {
    const chars = await this.getProjectCharacters(projectId);
    chars.push(character);
    await this.saveProjectCharacters(projectId, chars);
  }

  async updateCharacter(projectId: string, characterId: string, updates: Partial<Character>): Promise<void> {
    const chars = await this.getProjectCharacters(projectId);
    const index = chars.findIndex((c) => c.id === characterId);
    if (index !== -1) {
      chars[index] = { ...chars[index], ...updates, updatedAt: Date.now() };
      await this.saveProjectCharacters(projectId, chars);
    }
  }

  async deleteCharacter(projectId: string, characterId: string): Promise<void> {
    const chars = await this.getProjectCharacters(projectId);
    const filtered = chars.filter((c) => c.id !== characterId);
    await this.saveProjectCharacters(projectId, filtered);
  }
}
