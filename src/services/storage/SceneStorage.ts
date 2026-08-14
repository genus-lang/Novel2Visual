// ─── SceneStorage ─────────────────────────────────────────────────────────────
// Persists scenes to IndexedDB via the idb library.

import type { Scene } from '@/types/scene';
import { IDB_NAME, IDB_VERSION, IDB_STORES } from '@/constants/storage';
import { openDB, type IDBPDatabase } from 'idb';

export class SceneStorage {
  private db: IDBPDatabase | null = null;

  private async getDb(): Promise<IDBPDatabase> {
    if (this.db) return this.db;
    this.db = await openDB(IDB_NAME, IDB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(IDB_STORES.SCENES)) {
          const store = db.createObjectStore(IDB_STORES.SCENES, { keyPath: 'id' });
          store.createIndex('chapterId', 'chapterId');
          store.createIndex('projectId', 'projectId');
        }
      },
    });
    return this.db;
  }

  async getByChapter(chapterId: string): Promise<Scene[]> {
    const db = await this.getDb();
    return db.getAllFromIndex(IDB_STORES.SCENES, 'chapterId', chapterId);
  }

  async save(scene: Scene): Promise<void> {
    const db = await this.getDb();
    await db.put(IDB_STORES.SCENES, scene);
  }

  async saveAll(scenes: Scene[]): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(IDB_STORES.SCENES, 'readwrite');
    await Promise.all([...scenes.map((s) => tx.store.put(s)), tx.done]);
  }

  async update(id: string, updates: Partial<Scene>): Promise<void> {
    const db = await this.getDb();
    const existing = await db.get(IDB_STORES.SCENES, id);
    if (existing) {
      await db.put(IDB_STORES.SCENES, { ...existing, ...updates, updatedAt: Date.now() });
    }
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(IDB_STORES.SCENES, id);
  }
}
