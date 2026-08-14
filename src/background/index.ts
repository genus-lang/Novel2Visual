// ─── Background Service Worker Entry Point ────────────────────────────────────

import { TabManager } from './tabManager';
import { JobManager } from './jobManager';
import { DownloadManager } from './downloadManager';
import { createBackgroundRouter } from './messageRouter';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Background');

const tabManager = new TabManager();
const jobManager = new JobManager(tabManager);
const downloadManager = new DownloadManager();
const router = createBackgroundRouter(tabManager, jobManager, downloadManager);

// Register the message router
chrome.runtime.onMessage.addListener(router.listener());

console.log("[Novel2Visual] Background service worker loaded");

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  console.log("[Novel2Visual] Background received:", message.type, message);
  // We don't return anything here because router.listener() handles the actual routing and returns true/false
});

// Disable the global side panel by default (if it was set)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

// Open side panel ONLY on the specific tab when the action button is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'src/sidepanel/index.html',
      enabled: true
    });
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Track tab removal to disconnect tabs if closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabManager.getGeminiTabId() === tabId) {
    tabManager.disconnectGemini();
    logger.warn('Gemini tab was closed');
  }
  if (tabManager.getChatgptTabId() === tabId) {
    tabManager.disconnectChatgpt();
    logger.warn('ChatGPT tab was closed');
  }
});

logger.info('Background service worker started');

// Keep service worker alive during active generation
// Chrome MV3 service workers auto-suspend; we rely on message passing to wake them.
export {};
