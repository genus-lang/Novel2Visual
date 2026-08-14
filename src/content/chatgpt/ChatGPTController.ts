import { ChatGPTInput } from './ChatGPTInput';
import { ChatGPTGenerator } from './ChatGPTGenerator';
import { ChatGPTDetector } from './ChatGPTDetector';
import { createLogger } from '@/utils/logger';
import { GenerationLock } from '../gemini/GenerationLock'; // We can reuse the same lock class

const logger = createLogger('ChatGPTController');

export class ChatGPTController {
  private lock = new GenerationLock();

  constructor(
    private readonly input: ChatGPTInput,
    private readonly generator: ChatGPTGenerator,
    private readonly detector: ChatGPTDetector,
  ) {}

  async generate(sceneId: string, prompt: string): Promise<string> {
    await this.lock.acquire(sceneId);

    try {
      logger.info('Starting generation for prompt (first 80 chars):', prompt.slice(0, 80));

      const imagesBefore = this.detector.snapshotImages();

      await this.input.submit(prompt);

      const image = await this.generator.waitForNewImage(imagesBefore);

      let imageUrl = image.currentSrc || image.src || image.getAttribute('src') || '';

      if (!imageUrl) {
        throw new Error('Generated image was detected but has no usable URL');
      }

      // We ALWAYS convert to Base64 because ChatGPT Webp images can't be fetched easily 
      // from the Chrome Extension side panel due to OpenAI's strict CSP and auth tokens.
      // Doing it here inside the content script bypassing CORS.
      logger.info('Converting image to Base64 data URL...');
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read blob as Base64'));
          reader.readAsDataURL(blob);
        });
        logger.info('Successfully converted to Base64');
      } catch (err) {
        logger.error('Failed to convert image URL', err);
        throw new Error('Failed to extract image data from ChatGPT');
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
