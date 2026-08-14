// ─── Genre Constants ──────────────────────────────────────────────────────────

export const GENRES = {
  fantasy: {
    name: 'Fantasy',
    emoji: '🧙',
    visualKeywords: ['magic', 'ancient ruins', 'mystical atmosphere', 'arcane energy'],
  },
  cultivation: {
    name: 'Cultivation',
    emoji: '⚔️',
    visualKeywords: [
      'spiritual energy',
      'martial aura',
      'cultivation robes',
      'heavenly tribulation',
    ],
  },
  romance: {
    name: 'Romance',
    emoji: '💕',
    visualKeywords: ['emotional expressions', 'romantic atmosphere', 'soft cinematic lighting'],
  },
  horror: {
    name: 'Horror',
    emoji: '👻',
    visualKeywords: ['ominous atmosphere', 'dark lighting', 'psychological tension', 'shadows'],
  },
  scifi: {
    name: 'Sci-Fi',
    emoji: '🚀',
    visualKeywords: [
      'futuristic technology',
      'neon environments',
      'advanced architecture',
      'holographic interfaces',
    ],
  },
  martialArts: {
    name: 'Martial Arts',
    emoji: '🥋',
    visualKeywords: ['fighting stances', 'chi energy', 'action blur', 'dojo', 'training grounds'],
  },
  historical: {
    name: 'Historical',
    emoji: '👑',
    visualKeywords: ['period-accurate clothing', 'ancient palaces', 'battlefields', 'lanterns'],
  },
  mystery: {
    name: 'Mystery',
    emoji: '🕵️',
    visualKeywords: ['foggy atmosphere', 'dim lighting', 'clues', 'noir aesthetic'],
  },
  apocalypse: {
    name: 'Apocalypse',
    emoji: '🧟',
    visualKeywords: ['destroyed cities', 'survival gear', 'desolate landscapes', 'ruins'],
  },
  litrpg: {
    name: 'LitRPG',
    emoji: '🎮',
    visualKeywords: [
      'dungeon environments',
      'glowing skill effects',
      'status screen overlays',
      'fantasy game aesthetic',
    ],
  },
  supernatural: {
    name: 'Supernatural',
    emoji: '🧛',
    visualKeywords: ['supernatural glow', 'mystical symbols', 'dark fantasy', 'spirit entities'],
  },
} as const;

export type Genre = keyof typeof GENRES;

export const GENRE_LIST = Object.entries(GENRES).map(([key, value]) => ({
  key: key as Genre,
  ...value,
}));
