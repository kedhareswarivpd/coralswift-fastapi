import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { reticle } from '@reticlehq/vite-plugin';
// Backend target for the dev-server proxy. Override with:
//   VITE_API_PROXY_TARGET=http://localhost:8000 npm run dev
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000';
const BASE_PATH = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [reticle({ captureNetworkBodies: true }),react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 5173,
    watch: {
      ignored: ['**/public/**'],
    },
    proxy: {
      // Frontend code calls relative paths like `/api/v1/services`.
      // In dev, Vite forwards those to the FastAPI backend below, so no
      // CORS configuration is needed. In production, point your reverse
      // proxy (nginx, etc.) at the backend the same way -- see README.
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, status_code: 503, message: 'Backend service offline. Start backend with uvicorn on port 8000.' }));
            }
          });
        },
      },
      '/uploads': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'text/plain' });
              res.end('Backend storage service offline');
            }
          });
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    // e2e/ holds Playwright specs, not Vitest ones — same `*.spec.js` naming
    // convention, different `test`/`expect` runtime (Playwright's, not
    // Vitest's), so it must never be collected here. Extends (not replaces)
    // Vitest's own default exclude list.
    exclude: [
      '**/node_modules/**', '**/dist/**', '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      'e2e/**',
    ],
  },
});
