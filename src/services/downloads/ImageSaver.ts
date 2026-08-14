// ─── ImageSaver ───────────────────────────────────────────────────────────────
// Saves generated images via chrome.downloads API.

import { createLogger } from '@/utils/logger';

const logger = createLogger('ImageSaver');

export class ImageSaver {
  /**
   * Triggers a browser download for a base64 data URL.
   */
  async save(dataUrl: string, filename: string): Promise<void> {
    logger.info('Saving image:', filename);
    await chrome.downloads.download({ url: dataUrl, filename, saveAs: false });
  }
}
