// ─── tabManager ────────────────────────────────────────────────────────────────
// Finds and tracks the AI provider tabs.

import { isGeminiUrl } from '@/utils/validation';

export class TabManager {
  private geminiTabId: number | null = null;
  private chatgptTabId: number | null = null;

  async findGeminiTab(): Promise<number | null> {
    const tabs = await chrome.tabs.query({});
    const geminiTab = tabs.find((t) => t.url && isGeminiUrl(t.url));

    if (geminiTab?.id) {
      this.geminiTabId = geminiTab.id;
      return geminiTab.id;
    }
    return null;
  }

  async findChatgptTab(): Promise<number | null> {
    const tabs = await chrome.tabs.query({});
    const chatgptTab = tabs.find((t) => t.url && (t.url.includes('chatgpt.com')));

    if (chatgptTab?.id) {
      this.chatgptTabId = chatgptTab.id;
      return chatgptTab.id;
    }
    return null;
  }

  connectGemini(tabId: number): void {
    this.geminiTabId = tabId;
  }

  connectChatgpt(tabId: number): void {
    this.chatgptTabId = tabId;
  }

  getGeminiTabId(): number | null {
    return this.geminiTabId;
  }

  getChatgptTabId(): number | null {
    return this.chatgptTabId;
  }

  disconnectGemini(): void {
    this.geminiTabId = null;
  }

  disconnectChatgpt(): void {
    this.chatgptTabId = null;
  }
}
