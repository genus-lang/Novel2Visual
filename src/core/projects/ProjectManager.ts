// ─── ProjectManager ───────────────────────────────────────────────────────────

import type { Project } from '@/types/project';
import { ProjectStorage } from '@/services/storage/ProjectStorage';
import { generateId } from '@/utils/text';

export class ProjectManager {
  private storage = new ProjectStorage();

  async create(profile: Project['profile']): Promise<Project> {
    const project: Project = {
      id: generateId(),
      profile,
      chapterIds: [],
      characterIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.storage.save(project);
    return project;
  }

  async getAll(): Promise<Project[]> {
    return this.storage.getAll();
  }

  async getById(id: string): Promise<Project | undefined> {
    return this.storage.getById(id);
  }

  async update(id: string, updates: Partial<Project>): Promise<void> {
    const project = await this.getById(id);
    if (project) {
      await this.storage.save({ ...project, ...updates, updatedAt: Date.now() });
    }
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
  }
}
