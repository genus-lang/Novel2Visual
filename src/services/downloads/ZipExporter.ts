// ─── ZipExporter ─────────────────────────────────────────────────────────────
// Bundles all generated images into a ZIP file for download.

import JSZip from 'jszip';
import { ImageSaver } from './ImageSaver';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ZipExporter');

export interface ImageEntry {
  filename: string;
  dataUrl: string;
}

export class ZipExporter {
  private saver = new ImageSaver();

  async export(projectName: string, images: ImageEntry[]): Promise<void> {
    logger.info(`Zipping ${images.length} images for project: ${projectName}`);

    const zip = new JSZip();
    const folder = zip.folder(projectName) ?? zip;

    for (const { filename, dataUrl } of images) {
      if (dataUrl.startsWith('data:')) {
        // Strip the data URL header: "data:image/png;base64,..."
        const base64 = dataUrl.split(',')[1];
        folder.file(filename, base64, { base64: true });
      } else {
        // It's a standard URL, fetch it to get a blob
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          folder.file(filename, blob);
        } catch (e) {
          logger.error(`Failed to fetch image ${filename} for ZIP`, e);
        }
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const blobUrl = URL.createObjectURL(blob);

    await this.saver.save(blobUrl, `${projectName}.zip`);
    URL.revokeObjectURL(blobUrl);

    logger.info('ZIP exported successfully');
  }
}
