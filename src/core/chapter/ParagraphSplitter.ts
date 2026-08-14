// ─── ParagraphSplitter ────────────────────────────────────────────────────────
// Groups paragraphs into logical "blocks" for scene detection.

export class ParagraphSplitter {
  /**
   * Splits paragraphs into sliding windows for context-aware scene detection.
   * Each window is `size` paragraphs with `overlap` paragraphs of shared context.
   */
  window(paragraphs: string[], size = 3, overlap = 1): string[][] {
    const windows: string[][] = [];
    const step = size - overlap;

    for (let i = 0; i < paragraphs.length; i += step) {
      windows.push(paragraphs.slice(i, i + size));
    }

    return windows;
  }

  /**
   * Returns paragraph indices that contain dialogue (likely character interaction scenes).
   */
  findDialogueParagraphs(paragraphs: string[]): number[] {
    return paragraphs
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => /["'""]/.test(p))
      .map(({ i }) => i);
  }

  /**
   * Returns paragraph indices that contain action keywords (visually rich scenes).
   */
  findActionParagraphs(paragraphs: string[], keywords: string[]): number[] {
    const pattern = new RegExp(keywords.join('|'), 'i');
    return paragraphs
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => pattern.test(p))
      .map(({ i }) => i);
  }
}
