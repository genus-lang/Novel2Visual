// ─── GenrePrompts ─────────────────────────────────────────────────────────────
// Genre-specific prompt fragments appended to every scene prompt.

import { GENRES, type Genre } from '@/constants/genres';

export function getGenreFragment(genre: Genre): string {
  const config = GENRES[genre];
  if (!config) return `Genre context: ${genre}.`;
  return `Genre context: ${config.name}. Include visual elements such as ${config.visualKeywords.join(', ')}.`;
}
