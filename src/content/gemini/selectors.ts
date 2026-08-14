// ─── Gemini DOM Selectors ─────────────────────────────────────────────────────
// Keep Gemini-specific selectors isolated in this file.

export const SELECTORS = {
  /**
   * Gemini's prompt/editor area.
   */
  INPUT: [
    'rich-textarea [contenteditable="true"]',
    'rich-textarea',
    '[contenteditable="true"][role="textbox"]'
  ] as const,

  /**
   * Gemini's send button.
   */
  SUBMIT_BUTTON: [
    '[aria-label*="Send" i]',
    '[data-test-id="send-button"]',
    '[jsname="Qx7uuf"]',
    'button[type="submit"]',
    '.send-button',
  ] as const,

  /**
   * Indicators that Gemini is currently generating.
   */
  GENERATING_INDICATOR: [
    '[aria-label*="Generating" i]',
    '[aria-label*="Stop" i]',
    '[data-test-id*="loading" i]',
    '[data-test-id*="generating" i]',
    '.loading-indicator',
    'mat-progress-spinner',
    '.generation-in-progress',
  ] as const,

  /**
   * Possible generated image elements.
   * IMPORTANT: Gemini serves AI-generated images from lh3.googleusercontent.com.
   * This CDN selector is the most reliable fallback since Gemini's class names change.
   */
  IMAGE: [
    'model-response img',
    '.generated-image img',
    '[data-test-id*="image" i] img',
    '[data-testid*="image" i] img',
    // Broad CDN-based fallback — Gemini AI images always come from this host
    'img[src*="lh3.googleusercontent.com"]',
    // Additional structural fallbacks for Gemini DOM variations
    'response-container img',
    'conversation-container img',
    'message-content img',
  ] as const,

  /**
   * Possible response containers.
   */
  RESPONSE: [
    'model-response',
    '[data-test-id="model-response"]',
    '[data-testid="model-response"]',
    '.response-container',
    'message-content',
    'gemini-message',
    'chat-message',
  ] as const,
} as const;

type QueryRoot = Document | Element | ShadowRoot;

/**
 * Recursively collects all elements matching the given selector,
 * piercing through any Shadow DOM boundaries it encounters.
 */
function querySelectorAllDeep(selector: string, root: QueryRoot = document): Element[] {
  const results: Element[] = [];

  // Find matches in the current root
  const matches = root.querySelectorAll(selector);
  results.push(...Array.from(matches));

  // Find all elements in the current root to check for shadowRoots
  const allElements = root.querySelectorAll('*');
  for (const el of allElements) {
    if (el.shadowRoot) {
      results.push(...querySelectorAllDeep(selector, el.shadowRoot));
    }
  }

  return results;
}

export function queryFirst<T extends Element = HTMLElement>(
  selectors: readonly string[],
  root: QueryRoot = document,
): T | null {
  for (const selector of selectors) {
    try {
      const elements = querySelectorAllDeep(selector, root);
      if (elements.length > 0) return elements[0] as T;
    } catch (error) {
      console.warn('[Novel2Visual] Invalid Gemini selector:', selector, error);
    }
  }
  return null;
}

export function queryAll<T extends Element = HTMLElement>(
  selectors: readonly string[],
  root: QueryRoot = document,
): T[] {
  const results: T[] = [];
  const seen = new Set<Element>();

  for (const selector of selectors) {
    try {
      const elements = querySelectorAllDeep(selector, root);
      for (const element of elements) {
        if (!seen.has(element)) {
          seen.add(element);
          results.push(element as T);
        }
      }
    } catch (error) {
      console.warn('[Novel2Visual] Invalid Gemini selector:', selector, error);
    }
  }

  return results;
}
