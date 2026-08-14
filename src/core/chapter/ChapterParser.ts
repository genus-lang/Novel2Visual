// ─── ChapterParser ────────────────────────────────────────────────────────────
// Cleans raw chapter text and extracts structural information.

import { splitParagraphs, countWords, stripHtml, generateId } from '@/utils/text';
import type { ParsedChapter } from '@/types/chapter';

export class ChapterParser {
  /**
   * Parses raw text (copied from a novel site) into a structured Chapter.
   */
  parse(rawText: string, projectId: string, title = 'Untitled Chapter'): ParsedChapter {
    const cleanContent = this.clean(rawText);
    const paragraphs = splitParagraphs(cleanContent);

    return {
      id: generateId(),
      projectId,
      title,
      content: rawText,
      cleanContent,
      paragraphs,
      wordCount: countWords(cleanContent),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /** Strips HTML, normalises whitespace, removes translator notes etc. */
  private clean(text: string): string {
    let cleaned = stripHtml(text);
    // Remove common novel-site boilerplate
    cleaned = cleaned.replace(/\[TL note[^\]]*\]/gi, '');
    cleaned = cleaned.replace(/\(TN:[^)]*\)/gi, '');
    // Normalise line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Collapse excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
  }
}
