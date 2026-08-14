// ─── ChapterSummarizer ────────────────────────────────────────────────────────
// Produces a short summary of a chapter for display purposes.

import { truncate } from '@/utils/text';

export class ChapterSummarizer {
  /**
   * Returns a summary string from the first N paragraphs.
   * In a real implementation this would call a language model.
   */
  summarize(paragraphs: string[], maxLength = 300): string {
    const combined = paragraphs.slice(0, 3).join(' ');
    return truncate(combined, maxLength);
  }
}
