// ─── StylePrompts ─────────────────────────────────────────────────────────────
// Visual style and aspect ratio fragments for prompt building.

import { VISUAL_STYLES, ASPECT_RATIOS, type VisualStyle, type AspectRatio } from '@/constants/styles';

export function getStyleFragment(style: VisualStyle): string {
  const config = VISUAL_STYLES[style];
  if (!config) return `Visual style: ${style}.`;
  return `Visual style: ${config.name} — ${config.description}.`;
}

export function getAspectRatioFragment(ratio: AspectRatio): string {
  const config = ASPECT_RATIOS[ratio];
  if (!config) return `Aspect ratio: ${ratio}.`;
  return `Aspect ratio: ${ratio} (${config.width}×${config.height}).`;
}
