// ─── useCharacters ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { CharacterStorage } from '@/services/storage/CharacterStorage';
import type { Character, CharacterAppearance } from '@/types/character';
import { generateId } from '@/utils/text';

const storage = new CharacterStorage();

export function useCharacters(projectId: string | null) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCharacters = useCallback(async () => {
    if (!projectId) {
      setCharacters([]);
      return;
    }
    setIsLoading(true);
    const chars = await storage.getProjectCharacters(projectId);
    setCharacters(chars);
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    void loadCharacters();
  }, [loadCharacters]);

  const addCharacter = async (
    name: string,
    appearance: CharacterAppearance,
    visualDescription: string
  ): Promise<Character> => {
    if (!projectId) throw new Error('No active project');
    
    const newChar: Character = {
      id: generateId(),
      projectId,
      name,
      appearance,
      visualDescription,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.addCharacter(projectId, newChar);
    setCharacters((prev) => [...prev, newChar]);
    return newChar;
  };

  const updateCharacter = async (id: string, updates: Partial<Character>) => {
    if (!projectId) return;
    await storage.updateCharacter(projectId, id, updates);
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c))
    );
  };

  const deleteCharacter = async (id: string) => {
    if (!projectId) return;
    await storage.deleteCharacter(projectId, id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    characters,
    isLoading,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    refresh: loadCharacters,
  };
}
