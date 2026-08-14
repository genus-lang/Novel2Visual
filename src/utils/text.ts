// ─── Text Utilities ───────────────────────────────────────────────────────────

/** Splits text into paragraphs, filtering empty lines */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Counts words in a string */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Truncates a string to `maxLength` characters with an ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/** Strips HTML tags from a string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

/** Generates a simple unique ID (collision-safe enough for client-side use) */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
