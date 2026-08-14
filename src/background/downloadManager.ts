// ─── downloadManager ──────────────────────────────────────────────────────────
// Handles download requests forwarded from content scripts / side panel.

import { ImageSaver } from '@/services/downloads/ImageSaver';
import { ZipExporter } from '@/services/downloads/ZipExporter';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DownloadManager');

export class DownloadManager {
  private saver = new ImageSaver();
  private zipper = new ZipExporter();

  async saveImage(sceneId: string, dataUrl: string, projectName: string): Promise<void> {
    const filename = `${projectName}/scene-${sceneId}.png`;
    logger.info('Saving image:', filename);
    await this.saver.save(dataUrl, filename);
  }

  async exportZip(projectName: string, images: { filename: string; dataUrl: string }[]): Promise<void> {
    logger.info(`Exporting ZIP: ${images.length} images`);
    await this.zipper.export(projectName, images);
  }
}
