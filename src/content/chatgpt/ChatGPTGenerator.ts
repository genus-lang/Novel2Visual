import { ChatGPTDetector } from './ChatGPTDetector';
import { SELECTORS, queryAll } from './selectors';
import { createLogger } from '@/utils/logger';
import { GENERATION_TIMEOUT_MS } from '@/constants/generation';

const logger = createLogger('ChatGPTGenerator');

export class ChatGPTGenerator {
  constructor(private readonly detector: ChatGPTDetector) {}

  async waitForNewImage(
    imagesBefore: Set<HTMLImageElement>,
    timeoutMs = GENERATION_TIMEOUT_MS,
  ): Promise<HTMLImageElement> {
    console.log(`[ChatGPTGenerator] Waiting for image. Existing count: ${imagesBefore.size}`);

    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      let observer: MutationObserver | null = null;
      let interval: ReturnType<typeof setInterval> | null = null;
      let settled = false;

      let generationStarted = false;
      let generationStopped = false;
      let generationStoppedAt = 0;

      const cleanup = () => {
        observer?.disconnect();
        if (interval) clearInterval(interval);
      };

      const succeed = (img: HTMLImageElement) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(img);
      };

      const fail = (message: string) => {
        if (settled) return;
        settled = true;
        cleanup();
        logger.warn(message);
        reject(new Error(message));
      };

      const tryAccept = (img: HTMLImageElement) => {
        if (settled) return;
        const src = img.currentSrc || img.src || img.getAttribute('src') || '';
        
        if (src && img.naturalWidth >= 200) {
          succeed(img);
        }
      };

      const check = () => {
        if (settled) return;

        try {
          const now = Date.now();
          const isGenerating = this.detector.isGenerating();

          if (!generationStarted && isGenerating) {
            generationStarted = true;
          }

          if (generationStarted && !generationStopped && !isGenerating) {
            generationStopped = true;
            generationStoppedAt = now;
          }

          const urlsBefore = new Set<string>();
          for (const img of imagesBefore) {
            const s = img.currentSrc || img.src || img.getAttribute('src') || '';
            if (s) urlsBefore.add(s);
          }

          const imagesInDocument = queryAll<HTMLImageElement>(SELECTORS.IMAGE);

          for (const img of imagesInDocument) {
            if (imagesBefore.has(img)) continue;
            
            const src = img.currentSrc || img.src || img.getAttribute('src') || '';
            if (!src) continue;
            if (urlsBefore.has(src)) continue;

            // CRITICAL: ChatGPT uses loading="lazy". If the window is unfocused or 
            // doesn't scroll down, the image NEVER loads, causing a 30s timeout!
            if (img.getAttribute('loading') === 'lazy') {
              img.removeAttribute('loading');
              img.setAttribute('loading', 'eager');
            }
            // Also force it into view just in case
            try { img.scrollIntoView({ behavior: 'instant', block: 'nearest' }); } catch (e) {}

            if (img.complete) {
              tryAccept(img);
            } else {
              img.addEventListener('load', () => tryAccept(img), { once: true });
              img.addEventListener('error', () => tryAccept(img), { once: true });
            }
            if (settled) return;
          }

          if (generationStopped) {
            // ChatGPT often shows an error message inside the conversation turn
            const responses = queryAll(SELECTORS.RESPONSE);
            if (responses.length > 0) {
              const lastResponseText = responses[responses.length - 1].textContent || '';
              if (lastResponseText.includes('I cannot generate') || lastResponseText.includes('safety system')) {
                fail(`ChatGPT refused the prompt: ${lastResponseText.trim().slice(0, 100)}...`);
                return;
              }
            }

            if (now - generationStoppedAt > 30_000) {
              fail('ChatGPT generation finished but no new image appeared after 30s.');
              return;
            }
          }

          if (now - startedAt >= timeoutMs) {
            fail(`Generation timed out after ${timeoutMs}ms`);
            return;
          }
        } catch (error) {
          fail(error instanceof Error ? error.message : String(error));
        }
      };

      observer = new MutationObserver(check);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });

      interval = setInterval(check, 300);
      check();
    });
  }
}
