import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import type { Plugin } from 'vite';

function serveMarketingAssets(): Plugin {
  const assetDir = path.resolve(__dirname, '../../marketing-assets');
  return {
    name: 'serve-marketing-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/marketing-assets', (req, res, next) => {
        const filePath = path.join(assetDir, decodeURIComponent(req.url ?? '/'));
        fs.stat(filePath, (err, stat) => {
          if (!err && stat.isFile()) { res.end(fs.readFileSync(filePath)); } else { next(); }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveMarketingAssets()],
  base: '/games/color-clash/',
  // Fixed port so booth-kiosk's dev proxy can route /games/color-clash/ here.
  server: { port: 5178, strictPort: true },
  publicDir: path.resolve(__dirname, '../../public'),
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    outDir: 'dist',
    rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom'] } } },
  },
});
