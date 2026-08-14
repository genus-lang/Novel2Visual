import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: resolve(__dirname, 'manifest.json'),
      additionalInputs: [
        'src/sidepanel/index.html',
        'src/content/gemini/index.ts',
        'src/content/chatgpt/index.ts',
        'src/content/novel/index.ts',
        'src/background/index.ts',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@services': resolve(__dirname, 'src/services'),
      '@store': resolve(__dirname, 'src/store'),
      '@types': resolve(__dirname, 'src/types'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@sidepanel': resolve(__dirname, 'src/sidepanel'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
