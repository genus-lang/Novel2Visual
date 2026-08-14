// ─── ProjectStorage ───────────────────────────────────────────────────────────

import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '@/constants/storage';
import type { Project } from '@/types/project';

export class ProjectStorage {
  private storage = new StorageService();

  async getAll(): Promise<Project[]> {
    return (await this.storage.get<Project[]>(STORAGE_KEYS.PROJECTS)) ?? [];
  }

  async getById(id: string): Promise<Project | undefined> {
    const all = await this.getAll();
    return all.find((p) => p.id === id);
  }

  async save(project: Project): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      all[index] = project;
    } else {
      all.push(project);
    }
    await this.storage.set(STORAGE_KEYS.PROJECTS, all);
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await this.storage.set(
      STORAGE_KEYS.PROJECTS,
      all.filter((p) => p.id !== id),
    );
  }

  async getActiveProjectId(): Promise<string | undefined> {
    return this.storage.get<string>(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  }

  async setActiveProjectId(id: string): Promise<void> {
    await this.storage.set(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  }
}
