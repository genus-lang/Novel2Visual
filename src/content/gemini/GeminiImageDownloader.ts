// ─── GeminiImageDownloader ────────────────────────────────────────────────────
// Converts an image URL/src to a downloadable blob / base64 data URL.

import { createLogger } from '@/utils/logger';

const logger = createLogger('GeminiImageDownloader');

export class GeminiImageDownloader {
  /**
   * Fetches an image from the given URL and returns a base64 data URL.
   * Handles both absolute URLs and blob: URLs.
   */
  async toDataUrl(imageUrl: string): Promise<string> {
    logger.info('Fetching image:', imageUrl.slice(0, 80));

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return this.blobToDataUrl(blob);
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
      reader.readAsDataURL(blob);
    });
  }
}
