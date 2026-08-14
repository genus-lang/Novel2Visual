// ─── GeminiImageDetector ─────────────────────────────────────────────────────
// Finds the most recently generated image in the Gemini response.

import { GeminiDetector } from './GeminiDetector';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GeminiImageDetector');

export class GeminiImageDetector {
  private detector = new GeminiDetector();

  /**
   * Returns the src URL of the latest generated image.
   * Returns null if no image is present.
   */
  getLatestImageUrl(): string | null {
    const img = this.detector.getLatestImage();
    if (!img) {
      logger.warn('No image element found in latest response');
      return null;
    }

    const url = img.src || img.getAttribute('src');
    if (!url) {
      logger.warn('Image element has no src');
      return null;
    }

    logger.info('Image URL found:', url.slice(0, 80) + '...');
    return url;
  }
}
