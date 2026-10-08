import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from https://melodexbd.github.io/ielts-vocabmaster/, so every asset
// and route lives under /ielts-vocabmaster/. Set BASE_PATH=/ when hosting on a root domain.
export default defineConfig({
  base: process.env.BASE_PATH || '/ielts-vocabmaster/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separate files for libraries, so browsers download them in parallel and keep them cached
        // when only the site's own code changes.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
});
