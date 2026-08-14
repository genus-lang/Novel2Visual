// ─── GeminiInput ─────────────────────────────────────────────────────────────
// Types a prompt into the Gemini input field and submits it.

import { SELECTORS, queryFirst } from './selectors';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GeminiInput');

export class GeminiInput {

  private findGeminiComposer(): HTMLElement | null {
    const candidates = [
        document.querySelector('rich-textarea [contenteditable="true"]'),
        document.querySelector('rich-textarea'),
        document.querySelector('[contenteditable="true"][role="textbox"]'),
    ].filter(Boolean) as HTMLElement[];

    for (const el of candidates) {
        const rect = el.getBoundingClientRect();

        if (
            rect.width > 0 &&
            rect.height > 0 &&
            !el.closest('[aria-hidden="true"]')
        ) {
            return el;
        }
    }

    return null;
  }

  /**
   * Inserts text into a contenteditable element in a way that Gemini's Wiz
   * framework actually sees as user input.
   *
   * The naive approach (element.textContent = text + InputEvent) bypasses
   * Gemini's event listeners completely — the text appears in the DOM but the
   * framework's internal model stays "empty", so the Send button stays disabled.
   *
   * document.execCommand('insertText') fires the full suite of native events
   * (beforeinput, input, selectionchange, etc.) that frameworks actually listen
   * to, making the Send button enable as if the user typed the text manually.
   *
   * execCommand is deprecated in the spec but fully supported in Chrome and is
   * the only reliable programmatic text-insertion method for contenteditable.
   */
  private async setComposerText(element: HTMLElement, text: string): Promise<void> {
    element.focus();

    // 1. Try standard execCommand first
    document.execCommand('selectAll', false, undefined);
    const inserted = document.execCommand('insertText', false, text);
    console.log('[Novel2Visual] execCommand insertText result:', inserted);

    // 2. Unconditionally run the ultra-aggressive fallback
    // Modern frameworks often ignore execCommand if not triggered by a trusted user gesture.
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(element);
      selection.collapseToStart();
    }

    // Fire beforeinput
    element.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, composed: true, inputType: 'insertText', data: text }));

    // Force DOM update
    element.textContent = text;

    // Fire generic textInput (used by some older Google frameworks)
    const textEvent = new Event('textInput', { bubbles: true, cancelable: true, composed: true });
    (textEvent as any).data = text;
    element.dispatchEvent(textEvent);

    // Fire standard input and change events
    element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: text }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    // Fire paste event as the ultimate fallback for Lexical/Draft.js
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    element.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true, cancelable: true, composed: true, clipboardData: dataTransfer
    }));
  }

  /**
   * Waits until the Gemini submit button is enabled and visible.
   * Searches relative to the composer element to withstand UI updates.
   */
  private async waitForSubmitButton(composer: HTMLElement, timeoutMs = 10_000): Promise<HTMLButtonElement | null> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      let btn = queryFirst<HTMLButtonElement>(SELECTORS.SUBMIT_BUTTON);
      
      // If we didn't find it or found a bad generic one, try relative searching
      if (!btn || (btn.getAttribute('aria-label') == null && btn.getAttribute('jsname') == null)) {
        // Traverse up to find the input wrapper (chat box container)
        let container = composer.parentElement;
        let attempts = 0;
        while (container && attempts < 6) {
          const buttons = Array.from(container.querySelectorAll('button'));
          // The send button is usually the very last button in the composer area
          if (buttons.length > 0) {
            const lastBtn = buttons[buttons.length - 1];
            // Make sure it has an SVG (arrow icon) and isn't the mic
            if (lastBtn.querySelector('svg') && !lastBtn.disabled) {
              btn = lastBtn;
              break;
            }
          }
          container = container.parentElement;
          attempts++;
        }
      }

      if (btn) {
        const isDisabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
        const ariaLabel  = btn.getAttribute('aria-label') ?? '(no aria-label)';
        if (!isDisabled) {
          logger.info(`Submit button ready — aria-label="${ariaLabel}"`);
          return btn;
        }
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    logger.warn('Submit button never became enabled within timeout');
    return null;
  }

  /**
   * Confirms Gemini accepted the submission by verifying the input cleared,
   * OR by seeing the generation indicator appear (e.g. the Stop button).
   */
  private async waitForSubmissionAccepted(input: HTMLElement, timeoutMs = 5_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      // 1. Did the input clear?
      const text = (input.innerText || input.textContent || '').trim();
      if (text.length === 0) {
        logger.info('Input cleared — submission confirmed');
        return true;
      }

      // 2. Did the "Stop" button appear? (Generation started)
      const isGenerating = queryFirst(SELECTORS.GENERATING_INDICATOR) !== null;
      if (isGenerating) {
        logger.info('Generating indicator appeared — submission confirmed');
        return true;
      }

      await new Promise((r) => setTimeout(r, 100));
    }
    logger.warn('Submission was not confirmed (input didn\'t clear and no generating indicator)');
    return false;
  }

  /**
   * Types a prompt into Gemini's input and clicks Send.
   */
  async submit(prompt: string): Promise<void> {
    const input = this.findGeminiComposer();
    if (!input) throw new Error('Gemini composer not found');

    logger.info('Composer found');
    await this.setComposerText(input, prompt);

    // Wait a brief moment for any React/Wiz state updates
    await new Promise(r => setTimeout(r, 500));

    let submitBtn = await this.waitForSubmitButton(input, 3_000);

    if (!submitBtn) {
      logger.warn('Submit button unavailable via waiting. Trying instant query.');
      submitBtn = queryFirst<HTMLButtonElement>(SELECTORS.SUBMIT_BUTTON);
    }

    let clickAttempted = false;
    if (submitBtn) {
      // Completely strip disabled state
      submitBtn.removeAttribute('disabled');
      submitBtn.setAttribute('aria-disabled', 'false');
      submitBtn.classList.remove('disabled');

      // Dispatch full pointer event sequence for JSAction / Lexical
      const events = [
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }),
        new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }),
        new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window }),
        new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }),
        new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
      ];
      for (const e of events) {
        submitBtn.dispatchEvent(e);
      }
      clickAttempted = true;
    }

    // Wait and verify if the click worked
    let accepted = false;
    if (clickAttempted) {
      accepted = await this.waitForSubmissionAccepted(input, 5_000);
    }

    // Fallback: If click failed or button was missing, try Enter key
    if (!accepted) {
      logger.info('Click submission failed or skipped. Falling back to Enter key.');
      input.focus();
      const enterEvents = [
        new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true }),
        new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true })
      ];
      for (const e of enterEvents) {
        input.dispatchEvent(e);
      }

      // Absolute last resort: try to submit the form directly
      const form = input.closest('form') || document.querySelector('form');
      if (form) {
        logger.info('Requesting form submit directly as last resort');
        try {
          form.requestSubmit();
        } catch (e) {
          logger.warn('Form submit failed:', e);
        }
      }

      accepted = await this.waitForSubmissionAccepted(input, 15_000);
    }

    if (!accepted) {
      logger.warn('Gemini submission was not explicitly confirmed, but proceeding anyway to wait for an image.');
    }
    
    logger.info('Submission successful!');
  }
}

