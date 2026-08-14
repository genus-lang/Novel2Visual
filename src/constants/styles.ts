// ─── Visual Style Constants ───────────────────────────────────────────────────

export const VISUAL_STYLES = {
  anime: { name: 'Anime', description: 'Japanese animation style with expressive characters' },
  manga: { name: 'Japanese Manga', description: 'Black and white manga with detailed linework' },
  manhua: { name: 'Chinese Manhua', description: 'Colorful Chinese comic style' },
  manhwa: { name: 'Korean Manhwa', description: 'Vertical webtoon with vibrant colors' },
  webtoon: { name: 'Webtoon', description: 'Modern digital webcomic aesthetic' },
  cinematic3d: {
    name: '3D Cinematic',
    description: 'Photorealistic 3D render with cinematic lighting',
  },
  realistic: { name: 'Realistic', description: 'Highly detailed photorealistic painting' },
  darkFantasy: {
    name: 'Dark Fantasy',
    description: 'Gritty, atmospheric dark fantasy illustration',
  },
  watercolor: { name: 'Watercolor', description: 'Soft watercolor painting aesthetic' },
  comicBook: { name: 'Comic Book', description: 'Western comic book style with bold inks' },
  oilPainting: {
    name: 'Oil Painting',
    description: 'Classical oil painting with rich textures',
  },
} as const;

export type VisualStyle = keyof typeof VISUAL_STYLES;

export const VISUAL_STYLE_LIST = Object.entries(VISUAL_STYLES).map(([key, value]) => ({
  key: key as VisualStyle,
  ...value,
}));

// ─── Aspect Ratio Constants ───────────────────────────────────────────────────

export const ASPECT_RATIOS = {
  '16:9': { name: '16:9 Widescreen', width: 1920, height: 1080 },
  '9:16': { name: '9:16 Portrait', width: 1080, height: 1920 },
  '1:1': { name: '1:1 Square', width: 1024, height: 1024 },
  '4:3': { name: '4:3 Standard', width: 1024, height: 768 },
  '3:4': { name: '3:4 Portrait', width: 768, height: 1024 },
  '21:9': { name: '21:9 Ultrawide', width: 2560, height: 1080 },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;

export const ASPECT_RATIO_LIST = Object.entries(ASPECT_RATIOS).map(([key, value]) => ({
  key: key as AspectRatio,
  ...value,
}));
