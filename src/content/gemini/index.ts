// --- Gemini Content Script Entry Point ---------------------------------------
// Injected into gemini.google.com pages only.
//
// ARCHITECTURE NOTE ON INTER-SCENE DELAY:
// Chrome MV3 service workers die after ~30s of inactivity. Because we wait
// 30s between scenes, any setTimeout in the background would be destroyed.
// We therefore manage the inter-scene delay HERE in the content script,
// which lives as long as the Gemini tab is open.
// After waiting, we send READY_FOR_NEXT to tell the background to dispatch the
// next scene from its persisted queue.

import { GeminiController } from './GeminiController';
import { GeminiStateTracker } from './GeminiState';
import { GeminiDetector } from './GeminiDetector';
import { debounce } from '@/utils/debounce';
import { createLogger } from '@/utils/logger';
import type { ExtensionMessage } from '@/types/messages';

import { GeminiInput } from './GeminiInput';
import { GeminiGenerator } from './GeminiGenerator';
import { INTER_SCENE_DELAY_MS } from '@/constants/generation';

const logger = createLogger('GeminiContent');
const detector = new GeminiDetector();
const input = new GeminiInput();
const generator = new GeminiGenerator(detector);
const controller = new GeminiController(input, generator, detector);
const stateTracker = new GeminiStateTracker();

logger.info('Gemini content script loaded');
console.log('[Novel2Visual] Gemini adapter initialized');
console.log('[Novel2Visual] Gemini input:', detector.isInputAvailable());
console.log('[Novel2Visual] Gemini state:', detector.detect());

// --- Safe Message Sender ------------------------------------------------------
function sendToExtension(message: ExtensionMessage): boolean {
  try {
    if (!chrome?.runtime?.id) {
      console.warn('[Novel2Visual] Extension context invalid');
      return false;
    }
    chrome.runtime.sendMessage(message);
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('[Novel2Visual] Extension context invalid:', msg);
    return false;
  }
}

// --- State monitoring via MutationObserver ------------------------------------
const updateState = debounce(() => {
  const state = detector.detect();
  stateTracker.set(state);
  sendToExtension({
    type: 'GEMINI_STATE_CHANGED',
    state,
  } satisfies ExtensionMessage);
}, 300);

const observer = new MutationObserver(updateState as MutationCallback);
observer.observe(document.body, { childList: true, subtree: true, attributes: true });

// --- Message listener ---------------------------------------------------------
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'SEND_GEMINI_PROMPT') {
    const { sceneId, prompt } = message;

    console.log(`[GeminiContent] Received scene: ${sceneId}`);
    sendToExtension({ type: 'GEMINI_GENERATION_STARTED', sceneId } satisfies ExtensionMessage);

    controller
      .generate(sceneId, prompt)
      .then((dataUrl) => {
        console.log(`[GeminiContent] Generation completed: ${sceneId}`);
        sendToExtension({
          type: 'GEMINI_GENERATION_COMPLETED',
          sceneId,
          imageUrl: dataUrl,
        } satisfies ExtensionMessage);

        // -- CRITICAL: Wait the inter-scene delay HERE in the content script --
        // The background SW cannot safely use setTimeout for a 30s delay because
        // Chrome will kill the SW. We own the delay, then signal the background.
        console.log(`[GeminiContent] Waiting ${INTER_SCENE_DELAY_MS}ms before signalling READY_FOR_NEXT...`);
        setTimeout(() => {
          console.log(`[GeminiContent] Sending READY_FOR_NEXT to background.`);
          sendToExtension({ type: 'READY_FOR_NEXT' } satisfies ExtensionMessage);
        }, INTER_SCENE_DELAY_MS);
      })
      .catch((err: Error) => {
        console.error(`[GeminiContent] Generation failed: ${sceneId}`, err);
        sendToExtension({
          type: 'GEMINI_GENERATION_FAILED',
          sceneId,
          error: err.message,
        } satisfies ExtensionMessage);
        // On failure, still signal ready so the queue can continue.
        setTimeout(() => {
          sendToExtension({ type: 'READY_FOR_NEXT' } satisfies ExtensionMessage);
        }, 3_000);
      });

    sendResponse({ acknowledged: true });
    return true;
  }
});

// --- Service Worker Keep-Alive Heartbeat --------------------------------------
// Ping the background every 20s to prevent Chrome killing the SW between scenes.
setInterval(() => {
  sendToExtension({ type: 'PING' } satisfies ExtensionMessage);
}, 20_000);
