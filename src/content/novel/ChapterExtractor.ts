// ─── ChapterExtractor ────────────────────────────────────────────────────────
// Extracts clean chapter text from the current novel page DOM.

import { NovelDetector } from './NovelDetector';
import { stripHtml } from '@/utils/text';

export class ChapterExtractor {
  private detector = new NovelDetector();

  extract(): { title: string; content: string } | null {
    const container = this.detector.detectChapterContainer();
    if (!container) return null;

    const title = this.extractTitle();
    const content = stripHtml(container.innerHTML);

    return { title, content };
  }

  private extractTitle(): string {
    const candidates = [
      document.querySelector('.chapter-title'),
      document.querySelector('h1'),
      document.querySelector('h2.chapter'),
    ];

    for (const el of candidates) {
      if (el?.textContent) return el.textContent.trim();
    }

    return document.title || 'Untitled Chapter';
  }
}
