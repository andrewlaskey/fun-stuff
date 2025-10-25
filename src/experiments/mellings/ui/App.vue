<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePixiApp, useVideoFilters, useVideoSprite } from '../composables/pixi';
import { useWebcam } from '../composables/webcam';
import { useHandTracking } from '../composables/bodypose';
import Scoreboard from "./Scoreboard.vue";

const { pixiContainer, initPixiApp } = usePixiApp();
const { video, startWebcam } = useWebcam();
const { createVideoSprite } = useVideoSprite();
const { presetFilters } = useVideoFilters();
const { leftHand, rightHand, startTracking } = useHandTracking({
  confidenceThreshold: 0.05,
  flipped: true
});

const width = 800;
const height = 600;

onMounted(async () => {
  try {
    // Initialize PixiJS
    const pixiApp = await initPixiApp(width, height);
    
    // Start webcam
    const videoElement = await startWebcam({
      video: { width, height }
    });
    
    // Create video sprite with vintage filter
    createVideoSprite(videoElement, pixiApp, {
      width,
      height,
      filters: presetFilters.vintage(),
    });

    await startTracking(videoElement);
  } catch (error) {
    console.error('Setup failed:', error);
  }
});
</script>

<template>
  <div class="app-container">
    <p>{{ leftHand?.x }}, {{ leftHand?.y }}</p>
    <p>{{ rightHand?.x }}, {{ rightHand?.y }}</p>
    <Scoreboard :alive="0" :saved="0" :level="0" />
    <div ref="pixiContainer" class="pixi-container"></div>
    <!-- Hide the video element since we're displaying it through PixiJS -->
    <video
      ref="video"
      id="video"
      style="display: none"
      muted
      autoplay
      playsinline
      :width="width"
      :height="height"
    />
  </div>
</template>

<style lang="css">
.app-container {
  width: 800px;
}

.pixi-container {
  border: 2px solid #ccc;
  display: inline-block;
}
</style>
