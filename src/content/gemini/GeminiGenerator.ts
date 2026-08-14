// ─── GeminiGenerator ─────────────────────────────────────────────────────────
// Waits for Gemini to generate a new image.
// Uses DOM identity + src tracking + load-event listeners.

import { GeminiDetector } from './GeminiDetector';
import { SELECTORS, queryAll } from './selectors';
import { createLogger } from '@/utils/logger';
import { GENERATION_TIMEOUT_MS } from '@/constants/generation';

const logger = createLogger('GeminiGenerator');

export class GeminiGenerator {
  constructor(private readonly detector: GeminiDetector) {}

  /**
   * Waits for Gemini to produce a new image that was not present before submission.
   *
   * Detection strategy (two complementary tracks):
   *
   * Track A — Poll-based (runs every 300ms + MutationObserver):
   *   Calls getImages() to find fully-loaded, validated images not in imagesBefore.
   *
   * Track B — Event-based (set up once for each new candidate element):
   *   Attaches img.addEventListener('load', ...) to every new <img> element found
   *   in the selector set, even before it has finished loading.
   *   This catches the image the instant it finishes loading, without waiting
   *   for the next 300ms poll.
   *
   * Why both?
   *   - Track A handles images that were already loaded when we first checked.
   *   - Track B handles images that appear in the DOM still loading (complete=false)
   *     and then load asynchronously. Without this, we can miss them between polls.
   */
  async waitForNewImage(
    imagesBefore: Set<HTMLImageElement>,
    timeoutMs = GENERATION_TIMEOUT_MS,
  ): Promise<HTMLImageElement> {
    console.log(`[GeminiGenerator] Waiting for image. Existing image count: ${imagesBefore.size}`);

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
        const src = img.currentSrc || img.src || img.getAttribute('src') || '';
        logger.info('New generated image detected');
        console.log('[GeminiGenerator] Image validated:', {
          width: img.naturalWidth,
          height: img.naturalHeight,
          src: src.slice(0, 120),
        });
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
        const isGeminiAIImage = src.includes('lh3.googleusercontent.com') && !src.includes('/a/') && !src.includes('/ogw/');

        if (isGeminiAIImage || (img.naturalWidth >= 200 && img.naturalHeight >= 200)) {
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
            logger.info('Generation started');
          }

          if (generationStarted && !generationStopped && !isGenerating) {
            generationStopped = true;
            generationStoppedAt = now;
            logger.info('Generation stopped');
          }

          const urlsBefore = new Set<string>();
          for (const img of imagesBefore) {
            const s = img.currentSrc || img.src || img.getAttribute('src') || '';
            if (s) urlsBefore.add(s);
          }

          // ── The Ultimate Detection Strategy ──────────────────────────────────
          // Instead of tracking element identity across the entire page (which breaks
          // with Shadow DOM, Virtual DOM element reuse, or cached identical URLs),
          // we simply look at the LAST response bubble (the one Gemini just created).
          const responses = queryAll(SELECTORS.RESPONSE);
          
          if (responses.length > 0) {
            const lastResponse = responses[responses.length - 1];
            // Find all images within the newest chat bubble
            const imagesInNewestResponse = queryAll<HTMLImageElement>(SELECTORS.IMAGE, lastResponse);

            for (const img of imagesInNewestResponse) {
              if (imagesBefore.has(img)) continue;
              
              const src = img.currentSrc || img.src || img.getAttribute('src') || '';
              if (!src || src.includes('gstatic.com') || src.startsWith('data:')) continue;
              if (urlsBefore.has(src)) continue;

              if (img.complete) {
                tryAccept(img);
              } else {
                img.addEventListener('load', () => tryAccept(img), { once: true });
                img.addEventListener('error', () => tryAccept(img), { once: true });
              }
              if (settled) return;
            }
          } else {
            // FALLBACK: If we couldn't identify the response container (Gemini UI changed),
            // search the entire DOM for any image that wasn't in imagesBefore.
            const allImages = queryAll<HTMLImageElement>(SELECTORS.IMAGE);
            for (const img of allImages) {
              if (imagesBefore.has(img)) continue;
              
              const src = img.currentSrc || img.src || img.getAttribute('src') || '';
              if (!src || src.includes('gstatic.com') || src.startsWith('data:')) continue;
              if (urlsBefore.has(src)) continue;

              if (img.complete) {
                tryAccept(img);
              } else {
                img.addEventListener('load', () => tryAccept(img), { once: true });
                img.addEventListener('error', () => tryAccept(img), { once: true });
              }
              if (settled) return;
            }
          }

          // ── Grace-period check after generation stops ────────────────────
          if (generationStopped) {
            const responses = queryAll(SELECTORS.RESPONSE);
            if (responses.length > 0) {
              const lastResponseText = responses[responses.length - 1].textContent || '';
              if (
                lastResponseText.includes('You stopped this response') ||
                lastResponseText.includes("I can't fulfill this") ||
                lastResponseText.includes("safety") ||
                lastResponseText.includes("I am a text-based AI")
              ) {
                fail(`Gemini blocked or aborted the prompt: "${lastResponseText.trim().slice(0, 100)}..."`);
                return;
              }
            }

            if (now - generationStoppedAt > 30_000) {
              fail('Gemini generation finished but no new image appeared after 30s. Gemini likely refused the prompt (e.g., safety block) or output text only.');
              return;
            }
          }

          // ── Hard timeout ─────────────────────────────────────────────────
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
