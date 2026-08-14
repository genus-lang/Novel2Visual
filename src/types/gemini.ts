// ─── Gemini Automation Types ──────────────────────────────────────────────────

export type GeminiState =
  | 'idle'
  | 'typing'
  | 'generating'
  | 'image_ready'
  | 'error'
  | 'unknown';

export interface GeminiStatus {
  state: GeminiState;
  tabId?: number;
  connected: boolean;
  lastUpdated: number;
}

export interface GeminiGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
