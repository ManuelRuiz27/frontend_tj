import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const projectDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@sentry/browser': resolve(projectDir, 'src/vendor/sentry-browser.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    css: true,
  }
});
