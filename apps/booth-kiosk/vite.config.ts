import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import type { Plugin } from 'vite';

/**
 * Dev-only plugin: serve the marketing-assets submodule at /marketing-assets/.
 * In production, the CI deploy workflow copies marketing-assets/ into public/
 * before the build runs, so Vite's publicDir picks it up automatically.
 */
function serveMarketingAssets(): Plugin {
  const assetDir = path.resolve(__dirname, '../../marketing-assets');
  return {
    name: 'serve-marketing-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/marketing-assets', (req, res, next) => {
        const filePath = path.join(assetDir, decodeURIComponent(req.url ?? '/'));
        fs.stat(filePath, (err, stat) => {
          if (!err && stat.isFile()) {
            res.end(fs.readFileSync(filePath));
          } else {
            next();
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveMarketingAssets()],
  publicDir: path.resolve(__dirname, '../../public'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Dev-only: route the kiosk's /games/<id>/ links to each game's own Vite
    // dev server (fixed ports set in games/<id>/vite.config.ts). In production
    // the deploy workflow assembles all games under /games/ as static files.
    proxy: {
      '/games/echo-bots': { target: 'http://localhost:5175', ws: true },
      '/games/math-pop': { target: 'http://localhost:5176', ws: true },
      '/games/code-cracker': { target: 'http://localhost:5177', ws: true },
      '/games/robo-quiz': { target: 'http://localhost:5178', ws: true },
      '/games/blast-off': { target: 'http://localhost:5179', ws: true },
    },
  },
});
