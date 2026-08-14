// --- generationStore ---------------------------------------------------------

import { create } from 'zustand';
import type { GenerationStatus, GenerationProgress } from '@/types/generation';

export type SceneStatus = 'idle' | 'queued' | 'generating' | 'done' | 'error';

interface QueueItem {
  sceneId: string;
  title?: string;
}

export interface SceneStatusEntry {
  status: SceneStatus;
  error?: string;
}

interface GenerationStore {
  status: GenerationStatus;
  progress: GenerationProgress;
  currentSceneId: string | null;
  activeProvider: 'gemini' | 'chatgpt';
  geminiTabId: number | null;
  geminiConnected: boolean;
  chatgptTabId: number | null;
  chatgptConnected: boolean;
  queue: QueueItem[];
  sceneStatuses: Record<string, SceneStatusEntry>;

  setStatus: (status: GenerationStatus) => void;
  setProgress: (progress: GenerationProgress) => void;
  setCurrentScene: (sceneId: string | null) => void;
  setActiveProvider: (provider: 'gemini' | 'chatgpt') => void;
  setGeminiTab: (tabId: number | null) => void;
  setGeminiConnected: (connected: boolean) => void;
  setChatgptTab: (tabId: number | null) => void;
  setChatgptConnected: (connected: boolean) => void;
  setSceneStatus: (sceneId: string, entry: SceneStatusEntry) => void;
  syncState: (status: string, queue: any[], currentSceneId: string | null) => void;
  reset: () => void;
}

const INITIAL_PROGRESS: GenerationProgress = {
  total: 0,
  completed: 0,
  failed: 0,
  percentage: 0,
};

export const useGenerationStore = create<GenerationStore>((set) => ({
  status: 'idle',
  progress: INITIAL_PROGRESS,
  currentSceneId: null,
  activeProvider: 'gemini',
  geminiTabId: null,
  geminiConnected: false,
  chatgptTabId: null,
  chatgptConnected: false,
  queue: [],
  sceneStatuses: {},

  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setCurrentScene: (currentSceneId) => set({ currentSceneId }),
  setActiveProvider: (activeProvider) => set({ activeProvider }),
  setGeminiTab: (geminiTabId) => set({ geminiTabId }),
  setGeminiConnected: (geminiConnected) => set({ geminiConnected }),
  setChatgptTab: (chatgptTabId) => set({ chatgptTabId }),
  setChatgptConnected: (chatgptConnected) => set({ chatgptConnected }),
  setSceneStatus: (sceneId, entry) =>
    set((state) => ({
      sceneStatuses: { ...state.sceneStatuses, [sceneId]: entry },
    })),
  syncState: (status, queue, currentSceneId) =>
    set((state) => {
      const updates: Record<string, SceneStatusEntry> = { ...state.sceneStatuses };
      for (const item of queue) {
        if (!updates[item.sceneId] || updates[item.sceneId].status === 'idle') {
          updates[item.sceneId] = { status: 'queued' };
        }
      }
      if (currentSceneId) {
        updates[currentSceneId] = { status: 'generating' };
      }
      return { status: status as GenerationStatus, queue, currentSceneId, sceneStatuses: updates };
    }),
  reset: () =>
    set({ status: 'idle', progress: INITIAL_PROGRESS, currentSceneId: null, queue: [], sceneStatuses: {} }),
}));
