// ─── projectStore ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { Project } from '@/types/project';
import { ProjectStorage } from '@/services/storage/ProjectStorage';
import { generateId } from '@/utils/text';

const storage = new ProjectStorage();

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;

  loadProjects: () => Promise<void>;
  createProject: (profile: Project['profile']) => Promise<Project>;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  get activeProject(): Project | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,

  get activeProject() {
    return get().projects.find((p) => p.id === get().activeProjectId);
  },

  loadProjects: async () => {
    const projects = await storage.getAll();
    const activeProjectId = await storage.getActiveProjectId();
    set({ projects, activeProjectId: activeProjectId ?? null });
  },

  createProject: async (profile) => {
    const project: Project = {
      id: generateId(),
      profile,
      chapterIds: [],
      characterIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.save(project);
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  setActiveProject: (id) => {
    set({ activeProjectId: id });
    void storage.setActiveProjectId(id);
  },

  updateProject: async (id, updates) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p,
    );
    const updated = projects.find((p) => p.id === id);
    if (updated) await storage.save(updated);
    set({ projects });
  },

  deleteProject: async (id) => {
    await storage.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    }));
  },
}));
