// ─── PromptTypes ──────────────────────────────────────────────────────────────

import type { Genre } from '@/constants/genres';
import type { VisualStyle, AspectRatio } from '@/constants/styles';
import type { Scene } from '@/types/scene';
import type { Character } from '@/types/character';

export interface PromptContext {
  scene: Scene;
  characters: Character[];
  genre: Genre;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
  customStylePrompt?: string;
}

export interface BuiltPrompt {
  raw: string;
  sceneId: string;
}
