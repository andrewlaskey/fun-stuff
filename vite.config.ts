import { defineConfig } from 'vite';
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  root: 'src',
  base: '/fun-stuff/',
  plugins: [vue()],
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: './src/index.html', // Default entry point
        tunnel: './src/experiments/flashing-tunnel/index.html',
        mellings: './src/experiments/mellings/index.html',
        pixi: './src/experiments/pixi/index.html',
        cafe: './src/experiments/cafe-calculator/index.html',
        solarSystem: './src/experiments/solar-system/index.html',
      },
    },
  },
});
