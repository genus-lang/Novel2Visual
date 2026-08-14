// ─── Validation Utilities ─────────────────────────────────────────────────────

/** Returns true if the string is non-empty after trimming */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/** Returns true if the value is a valid Gemini URL */
export function isGeminiUrl(url: string): boolean {
  return url.startsWith('https://gemini.google.com') || url.startsWith('https://aistudio.google.com');
}

/** Returns true if the text looks like a novel chapter (>200 words) */
export function isValidChapterContent(text: string): boolean {
  const words = text.trim().split(/\s+/).length;
  return words >= 200;
}
