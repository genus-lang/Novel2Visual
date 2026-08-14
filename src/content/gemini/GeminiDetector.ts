// ─── GeminiDetector ──────────────────────────────────────────────────────────
// Detects the current state of the Gemini UI by inspecting the DOM.

import { SELECTORS, queryFirst, queryAll } from './selectors';
import type { GeminiState } from '@/types/gemini';

export class GeminiDetector {
  /**
   * Returns true only if a generating indicator is both present AND visually
   * active (visible, non-zero dimensions).
   */
  isGenerating(): boolean {
    const indicators = queryAll(SELECTORS.GENERATING_INDICATOR);
    return indicators.some((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      );
    });
  }

  isInputAvailable(): boolean {
    return queryFirst(SELECTORS.INPUT) !== null;
  }

  /**
   * Returns all valid generated images currently loaded on the page.
   *
   * Filter criteria (in order of application):
   * 1. src must exist and NOT be from gstatic.com (Gemini UI assets), blob:, or data:
   * 2. img.complete must be true (image finished loading — successfully or not)
   * 3. naturalWidth AND naturalHeight must be >= 200
   *    (Gemini generates 512–2048px images; UI icons are <100px)
   *
   * We do NOT require naturalWidth >= 500 because:
   * - The image might still be decoding at detection time
   * - Gemini sometimes uses thumbnails at intermediate stages
   *
   * Diagnostic logging is included so the console shows WHY each image was rejected.
   */
  getImages(): HTMLImageElement[] {
    const candidates = queryAll<HTMLImageElement>(SELECTORS.IMAGE);
    const result: HTMLImageElement[] = [];

    for (const img of candidates) {
      const src = img.currentSrc || img.src || img.getAttribute('src') || '';

      if (!src) continue;
      if (src.includes('gstatic.com') || src.startsWith('data:')) {
        continue;
      }

      const isGeminiAIImage = src.includes('lh3.googleusercontent.com') && !src.includes('/a/') && !src.includes('/ogw/');

      // If it's explicitly from Gemini's AI image CDN, accept it immediately.
      // Gemini's own UI sometimes fails to load these due to CORS or adblockers,
      // resulting in naturalWidth=0 or it getting permanently stuck in a "pending" state.
      // The URL is perfectly valid for our Sidepanel to download directly.
      if (isGeminiAIImage) {
        console.log(`[GeminiDetector] ACCEPTED (Gemini AI CDN): ${src.slice(0, 80)}`);
        result.push(img);
        continue;
      }

      if (!img.complete) {
        console.log(`[GeminiDetector] PENDING (still loading): ${src.slice(0, 80)}`);
        continue;
      }

      if (img.naturalWidth < 200 || img.naturalHeight < 200) {
        console.log(
          `[GeminiDetector] REJECTED size=${img.naturalWidth}x${img.naturalHeight}: ${src.slice(0, 80)}`,
        );
        continue;
      }

      result.push(img);
    }

    return result;
  }

  /**
   * Returns a snapshot Set of current validated image elements for identity-based tracking.
   * Call this BEFORE submitting a prompt. Pass it to waitForNewImage().
   */
  snapshotImages(): Set<HTMLImageElement> {
    return new Set(this.getImages());
  }

  getImageCount(): number {
    return this.getImages().length;
  }

  getLatestImage(): HTMLImageElement | null {
    const images = this.getImages();
    return images.length > 0 ? images[images.length - 1] : null;
  }

  getLatestImageUrl(): string | null {
    const image = this.getLatestImage();
    if (!image) return null;
    return image.currentSrc || image.src || image.getAttribute('src') || null;
  }

  detect(): GeminiState {
    if (this.isGenerating()) return 'generating';
    if (this.getImageCount() > 0) return 'image_ready';
    if (this.isInputAvailable()) return 'idle';
    return 'unknown';
  }
}
