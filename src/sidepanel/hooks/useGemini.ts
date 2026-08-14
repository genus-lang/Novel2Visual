// ─── useGemini hook ───────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useGenerationStore } from '@/store/generationStore';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';

export function useGemini() {
  const { geminiTabId, geminiConnected, setGeminiTab, setGeminiConnected } = useGenerationStore();

  const findAndConnect = useCallback(async () => {
    const response = await ChromeMessenger.toBackground<{ type: string; tabId?: number }>({
      type: 'FIND_GEMINI_TAB',
    });

    if (response.type === 'GEMINI_TAB_FOUND' && response.tabId) {
      setGeminiTab(response.tabId);
      setGeminiConnected(true);
      return response.tabId;
    }

    setGeminiConnected(false);
    return null;
  }, [setGeminiTab, setGeminiConnected]);

  const disconnect = useCallback(() => {
    setGeminiTab(null);
    setGeminiConnected(false);
  }, [setGeminiTab, setGeminiConnected]);

  return { geminiTabId, geminiConnected, findAndConnect, disconnect };
}
