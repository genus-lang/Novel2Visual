import { create } from 'zustand';

export type Page = 'home' | 'chapter' | 'scenes' | 'characters' | 'style' | 'gallery';

interface UiStore {
  page: Page;
  setPage: (page: Page) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  page: 'home',
  setPage: (page) => set({ page }),
}));
