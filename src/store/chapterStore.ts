// ─── chapterStore ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { Chapter } from '@/types/chapter';

interface ChapterStore {
  chapters: Chapter[];
  activeChapterId: string | null;
  setChapters: (chapters: Chapter[]) => void;
  addChapter: (chapter: Chapter) => void;
  setActiveChapter: (id: string) => void;
  get activeChapter(): Chapter | undefined;
}

export const useChapterStore = create<ChapterStore>((set, get) => ({
  chapters: [],
  activeChapterId: null,

  get activeChapter() {
    return get().chapters.find((c) => c.id === get().activeChapterId);
  },

  setChapters: (chapters) => set({ chapters }),
  addChapter: (chapter) => set((state) => ({ chapters: [...state.chapters, chapter] })),
  setActiveChapter: (id) => set({ activeChapterId: id }),
}));
