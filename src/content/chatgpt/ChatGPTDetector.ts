import { SELECTORS, queryFirst, queryAll } from './selectors';
import type { GeminiState } from '@/types/gemini'; // We can reuse this type since the states are the same

export class ChatGPTDetector {
  isGenerating(): boolean {
    const stopBtn = queryFirst(SELECTORS.GENERATING_INDICATOR);
    if (!stopBtn) return false;
    
    const style = getComputedStyle(stopBtn);
    const rect = stopBtn.getBoundingClientRect();
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  isInputAvailable(): boolean {
    return queryFirst(SELECTORS.INPUT) !== null;
  }

  getImages(): HTMLImageElement[] {
    const candidates = queryAll<HTMLImageElement>(SELECTORS.IMAGE);
    const result: HTMLImageElement[] = [];

    for (const img of candidates) {
      const src = img.currentSrc || img.src || img.getAttribute('src') || '';

      if (!src) continue;

      // Filter by size to avoid UI icons. DALL-E images are large (1024x1024).
      if (img.naturalWidth >= 200 && img.naturalHeight >= 200) {
        if (img.complete) {
          result.push(img);
        } else {
          console.log(`[ChatGPTDetector] PENDING (still loading): ${src.slice(0, 80)}`);
        }
      }
    }

    return result;
  }

  snapshotImages(): Set<HTMLImageElement> {
    return new Set(this.getImages());
  }

  getImageCount(): number {
    return this.getImages().length;
  }

  detect(): GeminiState {
    if (this.isGenerating()) return 'generating';
    if (this.getImageCount() > 0) return 'image_ready';
    if (this.isInputAvailable()) return 'idle';
    return 'unknown';
  }
}
