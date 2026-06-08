import { defineConfig } from 'vite';

// Multi-page build: include the landing page plus the standalone legal pages
// so they are emitted (with bundled CSS) on `vite build`.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html',
        disclaimer: 'disclaimer/index.html',
        security: 'security/index.html',
        dataAi: 'data-ai/index.html',
      },
    },
  },
});
