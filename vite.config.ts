/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Offline support, set up like grammatik.deulern.com. All 150 texts are in the main
    // bundle, so precaching it makes every text readable offline. A new version waits
    // until every tab is closed; there is no "update ready" prompt.
    // ponytail: no web manifest or 192/512 icons yet, so the app works offline but
    // browsers will not offer to install it. Add both when there is a real icon.
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'script',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
