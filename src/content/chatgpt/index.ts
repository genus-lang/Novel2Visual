import { ChatGPTController } from './ChatGPTController';
import { ChatGPTInput } from './ChatGPTInput';
import { ChatGPTGenerator } from './ChatGPTGenerator';
import { ChatGPTDetector } from './ChatGPTDetector';
import type { ExtensionMessage } from '@/types/messages';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChatGPTContent');

// 1. Initialize components
const input = new ChatGPTInput();
const detector = new ChatGPTDetector();
const generator = new ChatGPTGenerator(detector);
const controller = new ChatGPTController(input, generator, detector);

logger.info('ChatGPT content script loaded');

// 2. Announce presence to background script
const announcePresence = () => {
  try {
    chrome.runtime.sendMessage({ type: 'CHATGPT_CONNECTED' });
  } catch (err) {
    logger.warn('Failed to announce presence', err);
  }
};

announcePresence();

// Also announce presence periodically in case background script restarts
setInterval(announcePresence, 5000);

// 3. Listen for requests from background script
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ status: 'ok', provider: 'chatgpt' });
      return true;
    }

    if (message.type === 'SEND_PROMPT') {
      const { sceneId, prompt } = message;

      if (!controller.isReady()) {
        logger.warn('ChatGPT not ready for generation');
        sendResponse({ error: 'ChatGPT is not ready' });
        return true;
      }

      logger.info(`Received scene: ${sceneId}`);
      sendResponse({ status: 'started' }); // Acknowledge receipt

      // Run generation in background
      controller
        .generate(sceneId, prompt)
        .then((imageUrl) => {
          logger.info(`Generation completed: ${sceneId}`);
          
          chrome.runtime.sendMessage({
            type: 'SCENE_GENERATION_SUCCESS',
            sceneId,
            imageUrl,
          });

          // Wait 30 seconds before signalling ready for next (like Gemini adapter)
          logger.info('Waiting 30000ms before signalling READY_FOR_NEXT...');
          setTimeout(() => {
            logger.info('Sending READY_FOR_NEXT to background.');
            chrome.runtime.sendMessage({ type: 'READY_FOR_NEXT' });
          }, 30_000);
        })
        .catch((error) => {
          logger.error(`Generation failed: ${sceneId}`, error);
          chrome.runtime.sendMessage({
            type: 'SCENE_GENERATION_FAILED',
            sceneId,
            error: error instanceof Error ? error.message : String(error),
          });

          logger.info('Waiting 30000ms before signalling READY_FOR_NEXT after failure...');
          setTimeout(() => {
            logger.info('Sending READY_FOR_NEXT to background.');
            chrome.runtime.sendMessage({ type: 'READY_FOR_NEXT' });
          }, 30_000);
        });

      return true;
    }
  }
);
