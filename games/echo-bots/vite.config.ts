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
  base: '/games/echo-bots/',
  // Serves the monorepo root public/ so gameRegistry.json etc. are reachable.
  // marketing-assets/ is handled by the serveMarketingAssets plugin above (dev)
  // and by the CI copy step (production).
  publicDir: path.resolve(__dirname, '../../public'),
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: { manualChunks: { react: ['react', 'react-dom'] } },
    },
  },
});
