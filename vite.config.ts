import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/fun-stuff/',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: './src/index.html', // Default entry point
        tunnel: './src/experiments/flashing-tunnel/index.html'
      },
    },
  },
});
