// ─── ChapterManager ───────────────────────────────────────────────────────────

import type { Chapter } from '@/types/chapter';
import { ChapterParser } from '@/core/chapter/ChapterParser';

export class ChapterManager {
  private parser = new ChapterParser();

  create(rawText: string, projectId: string, title?: string): Chapter {
    return this.parser.parse(rawText, projectId, title);
  }

  buildFilename(chapter: Chapter): string {
    const num = chapter.number !== undefined ? String(chapter.number).padStart(3, '0') : 'xxx';
    return `chapter-${num}-${chapter.id.slice(0, 8)}.json`;
  }
}
