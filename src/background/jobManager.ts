// --- jobManager ---------------------------------------------------------------
// Manages the active generation queue in the background service worker.
//
// ARCHITECTURE NOTE:
// Chrome MV3 service workers can be killed at any time (especially after 30s of
// inactivity). To survive restarts, the queue is persisted in chrome.storage.session.
// The inter-scene delay is managed by the CONTENT SCRIPT (index.ts), not by
// setTimeout here — because a SW-side setTimeout dies with the service worker.

import { createLogger } from '@/utils/logger';
import type { ExtensionMessage } from '@/types/messages';
import { TabManager } from './tabManager';

const logger = createLogger('JobManager');

const STORAGE_KEY = 'novel2visual_job_queue';

export interface QueueItem {
  sceneId: string;
  prompt: string;
  title?: string;
}

interface PersistedState {
  queue: QueueItem[];
  currentItem: QueueItem | null;
  status: 'idle' | 'running' | 'error';
  provider: 'gemini' | 'chatgpt';
}

function broadcast(message: ExtensionMessage): void {
  try {
    chrome.runtime.sendMessage(message, () => {
      void chrome.runtime.lastError;
    });
  } catch {
    // Extension context may be invalidated; nothing to do.
  }
}

export class JobManager {
  private queue: QueueItem[] = [];
  private currentItem: QueueItem | null = null;
  private status: 'idle' | 'running' | 'error' = 'idle';
  private provider: 'gemini' | 'chatgpt' = 'gemini';
  private interceptedImageUrl: string | null = null;

  constructor(private readonly tabManager: TabManager) {
    this.setupNetworkInterceptor();
    this.restoreFromStorage();
  }

  private restoreFromStorage() {
    chrome.storage.session.get(STORAGE_KEY, (result) => {
      const state = result[STORAGE_KEY] as PersistedState | undefined;
      if (!state || state.status === 'idle') return;

      logger.info('[Background] Restoring queue from session storage after SW restart.');
      this.queue = state.queue ?? [];
      this.currentItem = state.currentItem ?? null;
      this.status = state.status ?? 'idle';
      this.provider = state.provider ?? 'gemini';

      if (this.status === 'running' && this.currentItem) {
        logger.info(`[Background] Resuming interrupted scene: ${this.currentItem.sceneId}`);
        setTimeout(() => this.dispatchCurrentItem(), 2_000);
      } else if (this.status === 'running' && this.queue.length > 0) {
        this.processNext();
      }
    });
  }

  private saveToStorage() {
    const state: PersistedState = {
      queue: this.queue,
      currentItem: this.currentItem,
      status: this.status,
      provider: this.provider,
    };
    chrome.storage.session.set({ [STORAGE_KEY]: state });
  }

  private clearStorage() {
    chrome.storage.session.remove(STORAGE_KEY);
  }

  private setupNetworkInterceptor() {
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        if (
          this.status === 'running' &&
          this.currentItem &&
          (details.url.includes('lh3.googleusercontent.com/rd-gg/') || details.url.includes('files.oaiusercontent.com'))
        ) {
          logger.info(
            `[Background] Intercepted image URL from network: ${details.url.slice(0, 80)}...`,
          );
          this.interceptedImageUrl = details.url;
        }
      },
      { urls: ['https://lh3.googleusercontent.com/rd-gg/*', 'https://files.oaiusercontent.com/*'] },
    );
  }

  enqueue(items: QueueItem[], provider: 'gemini' | 'chatgpt' = 'gemini') {
    this.provider = provider;
    this.queue.push(...items);
    logger.info(`[Background] Queue updated. ${items.length} items added. Total: ${this.queue.length}`);
    this.broadcastState();

    if (this.status === 'idle') {
      this.status = 'running';
      this.processNext();
    }
  }

  private processNext() {
    this.interceptedImageUrl = null;

    if (this.queue.length === 0) {
      this.status = 'idle';
      this.currentItem = null;
      logger.info('[Background] Queue finished.');
      this.clearStorage();
      this.broadcastState();
      return;
    }

    this.currentItem = this.queue.shift() || null;
    if (!this.currentItem) return;

    this.saveToStorage();
    this.broadcastState();
    this.dispatchCurrentItem();
  }

  private dispatchCurrentItem() {
    if (!this.currentItem) return;
    const sceneId = this.currentItem.sceneId;
    logger.info(`[Background] Dispatching scene: ${sceneId} to ${this.provider}`);

    const tabId = this.provider === 'gemini' ? this.tabManager.getGeminiTabId() : this.tabManager.getChatgptTabId();
    
    if (tabId === null) {
      logger.error(`[Background] No ${this.provider} tab registered!`);
      this.handleCompletion(sceneId, { error: `${this.provider} tab not found. Please connect it first.` });
      return;
    }

    chrome.tabs.sendMessage(
      tabId,
      {
        type: 'SEND_PROMPT',
        sceneId,
        prompt: this.currentItem.prompt,
      } as ExtensionMessage,
      () => {
        if (chrome.runtime.lastError) {
          const msg = chrome.runtime.lastError.message ?? '';
          logger.error(`[Background] Failed to send to ${this.provider} tab: ${msg}`);
          this.status = 'error';
          this.broadcastState();
          this.handleCompletion(sceneId, { error: `${this.provider} content script unreachable: ${msg}` });
        }
      },
    );
  }

  handleCompletion(sceneId: string, result: { imageUrl?: string; error?: string }) {
    logger.info(`[Background] Completion received for scene: ${sceneId}`);

    if (this.currentItem?.sceneId !== sceneId) {
      logger.warn(`[Background] Stale completion for scene: ${sceneId}. Current: ${this.currentItem?.sceneId}`);
      return;
    }

    if (result.error) {
      if (this.interceptedImageUrl) {
        logger.info(`[Background] Scene ${sceneId} failed in DOM but URL intercepted from network! Overriding.`);
        result = { imageUrl: this.interceptedImageUrl };
      } else {
        logger.error(`[Background] Scene ${sceneId} failed: ${result.error}`);
        broadcast({
          type: 'SCENE_GENERATION_FAILED',
          sceneId,
          error: result.error,
        } satisfies ExtensionMessage);
        logger.info('[Background] Scene failed — waiting for content script to signal READY_FOR_NEXT.');
        return;
      }
    }

    logger.info(`[Background] Scene ${sceneId} succeeded.`);
    broadcast({
      type: 'SCENE_GENERATION_SUCCESS',
      sceneId,
      imageUrl: result.imageUrl,
    } satisfies ExtensionMessage);

    // Do NOT use setTimeout here — the SW dies and the timer is lost.
    // The content script waits the inter-scene delay and sends READY_FOR_NEXT.
    logger.info('[Background] Waiting for content script READY_FOR_NEXT signal...');
    this.saveToStorage();
  }

  /**
   * Called by the content script after waiting the inter-scene delay.
   * This is the only safe way to advance the queue — not a SW setTimeout.
   */
  readyForNext() {
    logger.info('[Background] READY_FOR_NEXT received. Processing next scene.');
    this.processNext();
  }

  private broadcastState() {
    broadcast({
      type: 'QUEUE_STATE_UPDATED',
      status: this.status,
      queue: this.queue,
      currentSceneId: this.currentItem?.sceneId || null,
    } satisfies ExtensionMessage);
  }
}

