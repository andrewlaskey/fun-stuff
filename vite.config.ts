import { defineConfig } from 'vite';
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: 'src',
  base: '/fun-stuff/',
  plugins: [vue(), react()],
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: './src/index.html',
        tunnel: './src/experiments/flashing-tunnel/index.html',
        mellings: './src/experiments/mellings/index.html',
        pixi: './src/experiments/pixi/index.html',
        solarSystem: './src/experiments/solar-system/index.html',
        inBillions: './src/experiments/in-billions/index.html',
        planetGen: './src/experiments/planet-gen/index.html',
      },
    },
  },
});
