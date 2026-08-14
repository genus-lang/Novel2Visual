// ─── Character Types ──────────────────────────────────────────────────────────

export interface CharacterAppearance {
  age?: string;
  gender?: string;
  hair?: string;
  eyes?: string;
  skin?: string;
  height?: string;
  body?: string;
  clothing?: string;
  distinctiveFeatures?: string[];
}

export interface Character {
  id: string;
  projectId: string;
  name: string;

  /** Aliases or alternate names (e.g. titles, nicknames) */
  aliases?: string[];

  appearance: CharacterAppearance;

  personality?: string;

  weapons?: string[];
  abilities?: string[];

  /** Pre-built one-paragraph visual description used in prompts */
  visualDescription: string;

  /** Chapter ID where the character first appeared */
  firstSeenChapterId?: string;

  createdAt: number;
  updatedAt: number;
}
