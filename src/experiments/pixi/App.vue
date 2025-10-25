<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Application, Graphics, Text } from "pixi.js";

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;

onMounted(() => {
  (async () => {
    if (!pixiContainer.value) return;

    // Create PixiJS application
    app = new Application();

    await app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
    });

    // Add the canvas to our container
    pixiContainer.value.appendChild(app.canvas);

    // Create a simple sprite example
    const graphics = new Graphics().rect(50, 50, 100, 100).fill(0xff0000);
    app.stage.addChild(graphics);

    // Create a text object
    const text = new Text({
      text: "Hello PixiJS!",
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
        align: "center",
      },
    });
    text.x = 200;
    text.y = 100;
    app.stage.addChild(text);

    // Add a simple animation
    let elapsed = 0.0;

    app.ticker.add((ticker) => {
      elapsed += ticker.deltaTime;
      graphics.rotation = elapsed * 0.01;
    });
  })();
});

onUnmounted(() => {
  // Clean up PixiJS application
  if (app) {
    app.destroy(true, true);
  }
});
</script>

<template>
  <div>
    <div ref="pixiContainer" class="pixi-container"></div>
  </div>
</template>
