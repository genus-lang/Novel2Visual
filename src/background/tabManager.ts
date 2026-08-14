// ─── tabManager ────────────────────────────────────────────────────────────────
// Finds and tracks the AI provider tabs.

import { isGeminiUrl } from '@/utils/validation';

export class TabManager {
  private geminiTabId: number | null = null;
  private chatgptTabId: number | null = null;

  async findGeminiTab(): Promise<number | null> {
    const tabs = await chrome.tabs.query({});
    
    // Sort so active tabs are checked first, then other tabs
    tabs.sort((a, b) => {
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return 0;
    });

    const geminiTab = tabs.find((t) => t.url && isGeminiUrl(t.url));

    if (geminiTab?.id) {
      this.geminiTabId = geminiTab.id;
      return geminiTab.id;
    }
    return null;
  }

  async findChatgptTab(): Promise<number | null> {
    const tabs = await chrome.tabs.query({});
    
    // Sort so active tabs are checked first, then other tabs
    tabs.sort((a, b) => {
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return 0;
    });

    const chatgptTab = tabs.find((t) => t.url && (t.url.includes('chatgpt.com')));

    if (chatgptTab?.id) {
      this.chatgptTabId = chatgptTab.id;
      return chatgptTab.id;
    }
    return null;
  }

  connectGemini(tabId: number): void {
    this.geminiTabId = tabId;
    chrome.tabs.update(tabId, { autoDiscardable: false }).catch(() => {});
  }

  connectChatgpt(tabId: number): void {
    this.chatgptTabId = tabId;
    chrome.tabs.update(tabId, { autoDiscardable: false }).catch(() => {});
  }

  getGeminiTabId(): number | null {
    return this.geminiTabId;
  }

  getChatgptTabId(): number | null {
    return this.chatgptTabId;
  }

  disconnectGemini(): void {
    if (this.geminiTabId) {
      chrome.tabs.update(this.geminiTabId, { autoDiscardable: true }).catch(() => {});
    }
    this.geminiTabId = null;
  }

  disconnectChatgpt(): void {
    if (this.chatgptTabId) {
      chrome.tabs.update(this.chatgptTabId, { autoDiscardable: true }).catch(() => {});
    }
    this.chatgptTabId = null;
  }
}
