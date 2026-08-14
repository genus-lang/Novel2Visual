// ─── ChromeMessenger ─────────────────────────────────────────────────────────
// Type-safe wrapper around chrome.runtime.sendMessage and tab messaging.

import type { ExtensionMessage } from '@/types/messages';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ChromeMessenger {
  /** Send a message to the background service worker */
  static async toBackground<R = unknown>(message: ExtensionMessage): Promise<R> {
    console.log('[Novel2Visual] SIDE PANEL → BACKGROUND', message.type, message);
    try {
      const response = await chrome.runtime.sendMessage(message);
      console.log('[Novel2Visual] BACKGROUND → SIDE PANEL', response);
      return response;
    } catch (error) {
      console.error('[Novel2Visual] Background message failed:', error);
      throw error;
    }
  }

  /** Send a message to a specific tab's content script */
  static async toTab<R = unknown>(tabId: number, message: ExtensionMessage): Promise<R> {
    console.log(`[Novel2Visual] BACKGROUND → GEMINI TAB ${tabId}:`, message.type, message);
    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      console.log(`[Novel2Visual] GEMINI TAB ${tabId} → BACKGROUND`, response);
      return response;
    } catch (error) {
      console.error('[Novel2Visual] Gemini tab message failed:', error);
      throw error;
    }
  }

  /** Listen for messages from any source */
  static onMessage(
    handler: (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean | undefined,
  ): () => void {
    const listener = (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => handler(message, sender, sendResponse);

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }
}
