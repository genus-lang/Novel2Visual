// ─── messageRouter ────────────────────────────────────────────────────────────
// Wires all background message handlers.

import { MessageRouter } from '@/services/messaging/MessageRouter';
import { TabManager } from './tabManager';
import { JobManager } from './jobManager';
import { DownloadManager } from './downloadManager';

export function createBackgroundRouter(
  tabManager: TabManager,
  jobManager: JobManager,
  downloadManager: DownloadManager,
): MessageRouter {
  const router = new MessageRouter();

  router.on('FIND_GEMINI_TAB', (_msg, _sender, sendResponse) => {
    tabManager.findGeminiTab().then((tabId) => {
      if (tabId !== null) {
        sendResponse({ type: 'GEMINI_TAB_FOUND', tabId });
      } else {
        sendResponse({ type: 'GEMINI_TAB_NOT_FOUND' });
      }
    });
    return true;
  });

  router.on('FIND_CHATGPT_TAB', (_msg, _sender, sendResponse) => {
    tabManager.findChatgptTab().then((tabId) => {
      if (tabId !== null) {
        sendResponse({ type: 'CHATGPT_TAB_FOUND', tabId });
      } else {
        sendResponse({ type: 'CHATGPT_TAB_NOT_FOUND' });
      }
    });
    return true;
  });

  router.on('CONNECT_GEMINI_TAB', (msg, _sender, sendResponse) => {
    tabManager.connectGemini(msg.tabId);
    sendResponse({ type: 'GEMINI_TAB_CONNECTED', tabId: msg.tabId });
    return true;
  });

  router.on('CONNECT_CHATGPT_TAB', (msg, _sender, sendResponse) => {
    tabManager.connectChatgpt(msg.tabId);
    sendResponse({ type: 'CHATGPT_TAB_CONNECTED', tabId: msg.tabId });
    return true;
  });



  // Route completion events to the job manager. JobManager handles all
  // broadcasting to the side panel via broadcast().
  router.on('GEMINI_GENERATION_COMPLETED', (msg) => {
    jobManager.handleCompletion(msg.sceneId, { imageUrl: msg.imageUrl });
    return undefined;
  });

  router.on('GEMINI_GENERATION_FAILED', (msg) => {
    jobManager.handleCompletion(msg.sceneId, { error: msg.error });
    return undefined;
  });

  router.on('ENQUEUE_SCENES', (msg) => {
    jobManager.enqueue(msg.scenes, msg.provider);
    return undefined;
  });

  // Content script signals the background to process the next scene after
  // waiting the inter-scene delay on its side (safe from SW termination).
  router.on('READY_FOR_NEXT', () => {
    jobManager.readyForNext();
    return undefined;
  });

  router.on('EXPORT_ZIP', (msg) => {
    // We expect the msg to contain projectName and images
    const { projectName, images } = msg as any;
    if (projectName && images) {
      downloadManager.exportZip(projectName, images);
    }
    return undefined;
  });

  // Keep-alive heartbeat from content script — no action needed, just wakes the SW.
  router.on('PING', () => {
    return undefined;
  });

  return router;
}
