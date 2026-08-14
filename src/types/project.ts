// ─── Project Types ────────────────────────────────────────────────────────────

import type { Genre } from '@/constants/genres';
import type { VisualStyle, AspectRatio } from '@/constants/styles';

export interface NovelProfile {
  name: string;
  genre: Genre;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
  customStylePrompt?: string;
  maintainCharacterConsistency: boolean;
}

export interface Project {
  id: string;
  profile: NovelProfile;
  chapterIds: string[];
  characterIds: string[];
  createdAt: number;
  updatedAt: number;
}
