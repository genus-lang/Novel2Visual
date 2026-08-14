// ─── MessageRouter ────────────────────────────────────────────────────────────
// Routes incoming messages to registered handlers by type.

import type { ExtensionMessage, MessageType } from '@/types/messages';
import { createLogger } from '@/utils/logger';

const logger = createLogger('MessageRouter');

type Handler<T extends MessageType> = (
  message: Extract<ExtensionMessage, { type: T }>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean | undefined;

export class MessageRouter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Map<MessageType, Handler<any>> = new Map();

  on<T extends MessageType>(type: T, handler: Handler<T>): this {
    this.handlers.set(type, handler);
    return this;
  }

  /** Returns the chrome.runtime.onMessage listener. Call addListener with this. */
  listener() {
    return (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ): boolean | undefined => {
      const handler = this.handlers.get(message.type);
      if (!handler) {
        logger.debug('No handler for:', message.type);
        return;
      }
      logger.debug('Routing:', message.type);
      return handler(message, sender, sendResponse);
    };
  }
}
