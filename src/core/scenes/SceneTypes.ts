// ─── SceneTypes ───────────────────────────────────────────────────────────────
// Internal types used only within core/scenes/

export interface RawScene {
  paragraphIndices: number[];
  sourceText: string;
  characters: string[];
  location?: string;
  timeOfDay?: string;
  mood?: string;
  visualElements: string[];
  rawScore: number;
}
