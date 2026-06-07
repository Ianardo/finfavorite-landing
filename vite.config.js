import { defineConfig } from 'vite';

// Multi-page build: include the landing page plus the standalone legal pages
// so they are emitted (with bundled CSS) on `vite build`.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        disclaimer: 'disclaimer.html',
        security: 'security.html',
        dataAi: 'data-ai.html',
      },
    },
  },
});
