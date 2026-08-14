// ─── Extension Message Types ──────────────────────────────────────────────────
// All messages passed between side panel, background, and content scripts.
// Keep this as the single source of truth for the messaging protocol.

export type ExtensionMessage =
  // ── Tab Management ──────────────────────────────────────────────────────────
  | { type: 'FIND_GEMINI_TAB' }
  | { type: 'GEMINI_TAB_FOUND'; tabId: number }
  | { type: 'GEMINI_TAB_NOT_FOUND' }
  | { type: 'CONNECT_GEMINI_TAB'; tabId: number }
  | { type: 'GEMINI_TAB_CONNECTED'; tabId: number }
  | { type: 'GEMINI_TAB_DISCONNECTED' }

  // ── Generation Lifecycle ────────────────────────────────────────────────────
  | { type: 'START_GENERATION'; jobId: string; projectId: string; chapterId: string }
  | { type: 'PAUSE_GENERATION'; jobId: string }
  | { type: 'RESUME_GENERATION'; jobId: string }
  | { type: 'STOP_GENERATION'; jobId: string }

  // ── Scene / Prompt Passing ──────────────────────────────────────────────────
  | { type: 'SEND_GEMINI_PROMPT'; sceneId: string; prompt: string }
  | { type: 'ENQUEUE_SCENES'; scenes: { sceneId: string; prompt: string; title?: string }[] }
  | { type: 'QUEUE_STATE_UPDATED'; status: string; queue: any[]; currentSceneId: string | null }
  | { type: 'SCENE_GENERATION_SUCCESS'; sceneId: string; imageUrl?: string }
  | { type: 'SCENE_GENERATION_FAILED'; sceneId: string; error?: string }

  // ── Gemini State Updates (content script → background → sidepanel) ──────────
  | { type: 'GEMINI_GENERATION_STARTED'; sceneId: string }
  | { type: 'GEMINI_GENERATION_COMPLETED'; sceneId: string; imageUrl: string }
  | { type: 'GEMINI_GENERATION_FAILED'; sceneId: string; error: string }
  | { type: 'GEMINI_STATE_CHANGED'; state: import('./gemini').GeminiState }

  // ── Image Download ──────────────────────────────────────────────────────────
  | { type: 'DOWNLOAD_IMAGE'; sceneId: string; imageUrl: string; filename: string }
  | { type: 'DOWNLOAD_ALL_IMAGES'; jobId: string }
  | { type: 'EXPORT_ZIP'; projectName: string; images: { filename: string; dataUrl: string }[] }

  // ── Progress Updates ────────────────────────────────────────────────────────
  | { type: 'GENERATION_PROGRESS'; progress: import('./generation').GenerationProgress }
  | { type: 'JOB_COMPLETED'; jobId: string }
  | { type: 'JOB_FAILED'; jobId: string; error: string }

  // ── Keep-Alive / Flow Control ────────────────────────────────────────────────
  | { type: 'PING' }
  | { type: 'READY_FOR_NEXT' };

export type MessageType = ExtensionMessage['type'];

export type MessagePayload<T extends MessageType> = Extract<ExtensionMessage, { type: T }>;
