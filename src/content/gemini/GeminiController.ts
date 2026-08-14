// ─── GeminiController ────────────────────────────────────────────────────────
// Top-level façade for the Gemini automation adapter.
// YOUR CORE APP talks to this. It never touches the DOM directly.

import { GeminiInput } from './GeminiInput';
import { GeminiGenerator } from './GeminiGenerator';
import { GeminiDetector } from './GeminiDetector';
import { createLogger } from '@/utils/logger';

import { GenerationLock } from './GenerationLock';

const logger = createLogger('GeminiController');

export class GeminiController {
  private lock = new GenerationLock();

  constructor(
    private readonly input: GeminiInput,
    private readonly generator: GeminiGenerator,
    private readonly detector: GeminiDetector,
  ) {}

  async generate(sceneId: string, prompt: string): Promise<string> {
    await this.lock.acquire(sceneId);

    try {
      logger.info('Starting generation for prompt (first 80 chars):', prompt.slice(0, 80));

      // Snapshot existing images BEFORE submitting so we can identify truly new ones
      const imagesBefore = this.detector.snapshotImages();

      await this.input.submit(prompt);

      const image = await this.generator.waitForNewImage(imagesBefore);

      let imageUrl = image.currentSrc || image.src || image.getAttribute('src') || '';

      if (!imageUrl) {
        throw new Error('Generated image was detected but has no usable URL');
      }

      // If Gemini uses a blob: URL (which it does for the new Image Editor UI),
      // we must convert it to a Base64 data URL. The extension sidepanel runs on 
      // chrome-extension:// origin and cannot access blob: URLs from gemini.google.com.
      if (imageUrl.startsWith('blob:')) {
        logger.info('Detected blob: URL, converting to Base64 data URL...');
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          imageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read blob as Base64'));
            reader.readAsDataURL(blob);
          });
          logger.info('Successfully converted blob: to Base64');
        } catch (err) {
          logger.error('Failed to convert blob URL', err);
          throw new Error('Failed to extract image data from Gemini blob URL');
        }
      }

      logger.info('Generation successful');

      return imageUrl;
    } finally {
      this.lock.release(sceneId);
    }
  }

  isReady(): boolean {
    return this.detector.isInputAvailable();
  }
}
