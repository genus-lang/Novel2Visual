import { SELECTORS, queryFirst } from './selectors';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChatGPTInput');

export class ChatGPTInput {

  private findComposer(): HTMLElement | null {
    return queryFirst<HTMLElement>(SELECTORS.INPUT);
  }

  private async setComposerText(element: HTMLElement, text: string): Promise<void> {
    element.focus();

    // 1. Try standard execCommand first
    document.execCommand('selectAll', false, undefined);
    document.execCommand('insertText', false, text);

    // 2. Fallbacks for React/Lexical
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(element);
      selection.collapseToStart();
    }

    element.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, composed: true, inputType: 'insertText', data: text }));
    element.textContent = text;
    
    const textEvent = new Event('textInput', { bubbles: true, cancelable: true, composed: true });
    (textEvent as any).data = text;
    element.dispatchEvent(textEvent);

    element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: text }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    element.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true, cancelable: true, composed: true, clipboardData: dataTransfer
    }));
  }

  private async waitForSubmitButton(timeoutMs = 10_000): Promise<HTMLButtonElement | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const btn = queryFirst<HTMLButtonElement>(SELECTORS.SUBMIT_BUTTON);
      if (btn && !btn.disabled) {
        return btn;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  }

  private async waitForSubmissionAccepted(input: HTMLElement, timeoutMs = 5_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const text = (input.innerText || input.textContent || '').trim();
      if (text.length === 0) {
        return true;
      }

      const isGenerating = queryFirst(SELECTORS.GENERATING_INDICATOR) !== null;
      if (isGenerating) {
        return true;
      }

      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  }

  async submit(prompt: string): Promise<void> {
    const input = this.findComposer();
    if (!input) throw new Error('ChatGPT composer not found');

    await this.setComposerText(input, prompt);

    await new Promise(r => setTimeout(r, 500));

    const submitBtn = await this.waitForSubmitButton(3_000);

    let clickAttempted = false;
    if (submitBtn) {
      submitBtn.removeAttribute('disabled');
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

    let accepted = false;
    if (clickAttempted) {
      accepted = await this.waitForSubmissionAccepted(input, 5_000);
    }

    if (!accepted) {
      input.focus();
      const enterEvents = [
        new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true }),
        new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true }),
        new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, bubbles: true, cancelable: true })
      ];
      for (const e of enterEvents) {
        input.dispatchEvent(e);
      }
      accepted = await this.waitForSubmissionAccepted(input, 15_000);
    }

    if (!accepted) {
      logger.warn('ChatGPT submission was not explicitly confirmed.');
    }
  }
}
