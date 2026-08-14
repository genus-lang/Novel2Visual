// ─── selectors ────────────────────────────────────────────────────────────────
// CSS selectors for navigating the ChatGPT DOM.

export const SELECTORS = {
  // The main text area where users type prompts
  INPUT: '#prompt-textarea',

  // The send message button
  SUBMIT_BUTTON: '[data-testid="send-button"]',

  // ChatGPT's Stop button (indicates generation is in progress)
  GENERATING_INDICATOR: '[data-testid="stop-button"]',

  // Container for each turn in the conversation
  RESPONSE: 'article[data-testid^="conversation-turn-"]',

  // Images within the response
  IMAGE: 'img',
} as const;

export function queryAll<T extends HTMLElement>(selector: string, root: Document | Element = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function queryFirst<T extends HTMLElement>(selector: string, root: Document | Element = document): T | null {
  return root.querySelector<T>(selector);
}
