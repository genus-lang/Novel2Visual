// ─── PromptEnhancer ───────────────────────────────────────────────────────────
// Adds quality boosters and negative-prompt guidance to a raw prompt.

const QUALITY_BOOSTERS = [
  'highly detailed',
  'professional illustration',
  'cinematic composition',
  'dramatic lighting',
  '4K quality',
  'masterpiece',
] as const;

const NEGATIVE_TERMS = [
  'blurry',
  'low quality',
  'text',
  'watermark',
  'logo',
  'duplicate',
  'bad anatomy',
] as const;

export class PromptEnhancer {
  enhance(prompt: string): string {
    const boosters = QUALITY_BOOSTERS.join(', ');
    const negative = `\n\nAvoid: ${NEGATIVE_TERMS.join(', ')}.`;
    return `${prompt}\n\nQuality: ${boosters}.${negative}`;
  }
}
