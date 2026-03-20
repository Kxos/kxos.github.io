import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serve dalla root del repo o da /docs.
  // Se il repo si chiama "vito-iannone-portfolio", usa quel base.
  // Se è il repo user.github.io, usa '/'.
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Chunk separati per il gioco — non viene scaricato se non apri l'arcade
        manualChunks: {
          'pixi': ['pixi.js'],
          'dino-runner': [
            './src/games/dino-runner/DinoRunner.jsx',
            './src/games/dino-runner/gameLoop.js',
          ],
        },
      },
    },
  },
})
