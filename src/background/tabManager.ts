// ─── tabManager ───────────────────────────────────────────────────────────────
// Finds and tracks the Gemini tab.

import { isGeminiUrl } from '@/utils/validation';
import { createLogger } from '@/utils/logger';

const logger = createLogger('TabManager');

export class TabManager {
  private geminiTabId: number | null = null;

  async findGeminiTab(): Promise<number | null> {
    const tabs = await chrome.tabs.query({});
    const geminiTab = tabs.find((t) => t.url && isGeminiUrl(t.url));

    if (geminiTab?.id) {
      this.geminiTabId = geminiTab.id;
      logger.info('Gemini tab found:', geminiTab.id, geminiTab.url);
      return geminiTab.id;
    }

    logger.warn('No Gemini tab found');
    return null;
  }

  connect(tabId: number): void {
    this.geminiTabId = tabId;
    logger.info('Connected to Gemini tab:', tabId);
  }

  getGeminiTabId(): number | null {
    return this.geminiTabId;
  }

  disconnect(): void {
    this.geminiTabId = null;
    logger.info('Disconnected from Gemini tab');
  }
}
