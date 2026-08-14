// ─── Generation Constants ─────────────────────────────────────────────────────

/** How often (ms) the MutationObserver polling is debounced */
export const OBSERVER_DEBOUNCE_MS = 300;

/** Max time (ms) to wait for a single image generation before declaring failure */
export const GENERATION_TIMEOUT_MS = 180_000; // 3 minutes

/** Delay (ms) between detecting image-ready and sending the next prompt */
export const INTER_SCENE_DELAY_MS = 30_000;

/** Number of times to retry a failed scene before marking it as permanently failed */
export const MAX_RETRY_ATTEMPTS = 2;

/** Default minimum importance score to include a scene in generation */
export const DEFAULT_MIN_IMPORTANCE = 3;

/** Default maximum scenes to generate per chapter */
export const DEFAULT_MAX_SCENES = 20;
