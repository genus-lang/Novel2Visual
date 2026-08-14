// ─── PromptBuilder ────────────────────────────────────────────────────────────
// Assembles the final Gemini image-generation prompt from scene + context.

import type { PromptContext, BuiltPrompt } from './PromptTypes';
import { getGenreFragment } from './GenrePrompts';
import { getStyleFragment, getAspectRatioFragment } from './StylePrompts';
import { CharacterBible } from '@/core/characters/CharacterBible';
import { CharacterConsistency } from '@/core/characters/CharacterConsistency';

export class PromptBuilder {
  private consistency: CharacterConsistency;

  constructor(bible: CharacterBible) {
    this.consistency = new CharacterConsistency(bible);
  }

  build(ctx: PromptContext): BuiltPrompt {
    const { scene, genre, visualStyle, aspectRatio, customStylePrompt } = ctx;

    const sceneText = (scene.sourceText || '').trim() || (scene.title || '').trim() || 'Generate a scene.';
    
    const parts: string[] = [
      `Create a cinematic illustration based ONLY on the following novel scene.`,
      '',
      `SCENE`,
      sceneText,
      '',
    ];

    // Placeholder for CHARACTER section to be filled by CharacterConsistency
    parts.push(`CHARACTER`);
    parts.push(`{CHARACTERS_PLACEHOLDER}`);
    parts.push('');

    if (scene.location) {
      parts.push(`LOCATION`);
      parts.push(scene.location);
      parts.push('');
    }

    // Since we don't have an explicit 'action' field in Scene (based on standard summary), we use summary or visualElements
    if (scene.visualElements?.length) {
      parts.push(`COMPOSITION & ACTION`);
      parts.push(scene.visualElements.join('\n'));
      parts.push('');
    }

    if (scene.mood) {
      parts.push(`MOOD`);
      parts.push(scene.mood);
      parts.push('');
    }

    parts.push(`STYLE`);
    const styles = [
      getGenreFragment(genre),
      getStyleFragment(visualStyle),
      getAspectRatioFragment(aspectRatio),
    ];
    if (customStylePrompt) styles.push(customStylePrompt);
    parts.push(styles.filter(Boolean).join('\n'));
    parts.push('');

    parts.push(`IMPORTANT:`);
    parts.push(`Do not invent unrelated characters or locations.`);
    parts.push(`Do not create a generic fantasy battlefield.`);

    let raw = parts.join('\n');

    // Generate character descriptions block
    const characterBlock = this.consistency.buildCharacterBlock(scene.characters);
    raw = raw.replace('{CHARACTERS_PLACEHOLDER}', characterBlock || 'None specified.');

    return { raw, sceneId: scene.id };
  }
}
