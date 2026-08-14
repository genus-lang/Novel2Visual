// ─── sceneStore ───────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { Scene } from '@/types/scene';
import { SceneStorage } from '@/services/storage/SceneStorage';

const storage = new SceneStorage();

interface SceneStore {
  scenes: Scene[];
  loadScenes: (chapterId: string) => Promise<void>;
  setScenes: (scenes: Scene[]) => Promise<void>;
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>;
  clearScenes: () => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  scenes: [],

  loadScenes: async (chapterId) => {
    const scenes = await storage.getByChapter(chapterId);
    set({ scenes });
  },

  setScenes: async (scenes) => {
    await storage.saveAll(scenes);
    set({ scenes });
  },

  updateScene: async (id, updates) => {
    await storage.update(id, updates);
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  clearScenes: () => set({ scenes: [] }),
}));
