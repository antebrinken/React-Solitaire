import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite configuration replacing the old CRA/webpack setup.
// Sets base for GitHub Pages and provides a convenient alias for `src`.
export default defineConfig({
  plugins: [
    react({
      // Use classic runtime to support React 16 (no jsx-runtime)
      jsxRuntime: 'classic'
    })
  ],
  base: '/react-solitaire/',
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
