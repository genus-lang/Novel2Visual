import { useCallback, useEffect } from 'react';
import { useGenerationStore } from '@/store/generationStore';
import { ChromeMessenger } from '@/services/messaging/ChromeMessenger';

export function useAiProvider() {
  const { 
    activeProvider, setActiveProvider,
    geminiConnected, setGeminiTab, setGeminiConnected,
    chatgptConnected, setChatgptTab, setChatgptConnected 
  } = useGenerationStore();

  const findAndConnectGemini = useCallback(async () => {
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

  const findAndConnectChatgpt = useCallback(async () => {
    const response = await ChromeMessenger.toBackground<{ type: string; tabId?: number }>({
      type: 'FIND_CHATGPT_TAB',
    });
    if (response.type === 'CHATGPT_TAB_FOUND' && response.tabId) {
      setChatgptTab(response.tabId);
      setChatgptConnected(true);
      return response.tabId;
    }
    setChatgptConnected(false);
    return null;
  }, [setChatgptTab, setChatgptConnected]);

  // Periodic polling for the background connection
  useEffect(() => {
    const checkTabs = async () => {
      const gTab = await findAndConnectGemini();
      const cTab = await findAndConnectChatgpt();
      
      // Auto-detect platform if only one is connected
      if (gTab && !cTab) {
        useGenerationStore.getState().setActiveProvider('gemini');
      } else if (cTab && !gTab) {
        useGenerationStore.getState().setActiveProvider('chatgpt');
      }
    };
    checkTabs();
    const interval = setInterval(checkTabs, 5000);
    return () => clearInterval(interval);
  }, [findAndConnectGemini, findAndConnectChatgpt]);

  return { 
    activeProvider, setActiveProvider,
    geminiConnected, chatgptConnected, 
    findAndConnectGemini, findAndConnectChatgpt 
  };
}
