import { useCallback, useMemo } from 'react';
import { PromptBuilder } from '@/core/prompts/PromptBuilder';
import { CharacterBible } from '@/core/characters/CharacterBible';
import { useNovel } from './useNovel';
import { useCharacters } from './useCharacters';
import type { Scene } from '@/types/scene';
import type { BuiltPrompt } from '@/core/prompts/PromptTypes';

export function usePromptBuilder() {
  const { activeProject, activeProjectId } = useNovel();
  const { characters } = useCharacters(activeProjectId);

  const builder = useMemo(() => {
    const bible = new CharacterBible();
    characters.forEach((c) => bible.add(c));
    return new PromptBuilder(bible);
  }, [characters]);

  const buildPrompt = useCallback((scene: Scene): BuiltPrompt | null => {
    if (!activeProject) return null;

    return builder.build({
      scene,
      characters,
      genre: activeProject.profile.genre,
      visualStyle: activeProject.profile.visualStyle,
      aspectRatio: activeProject.profile.aspectRatio,
      customStylePrompt: activeProject.profile.customStylePrompt,
    });
  }, [builder, activeProject, characters]);

  return { buildPrompt };
}
