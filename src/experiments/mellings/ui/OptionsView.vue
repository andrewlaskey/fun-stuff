<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { usePixiApp, useVideoFilters, useVideoSprite } from '../composables/pixi';
import { useWebcam } from '../composables/webcam';
import { useHandTracking } from '../composables/bodypose';

const emit = defineEmits<{ back: [] }>();

const { pixiContainer, initPixiApp } = usePixiApp();
const { video, startWebcam } = useWebcam();
const { createVideoSprite, videoSprite } = useVideoSprite();
const { presetFilters } = useVideoFilters();
const { leftHand, rightHand, startTracking } = useHandTracking({
  confidenceThreshold: 0.05,
  flipped: true
});

const width = 800;
const height = 600;

const showCamera = ref(true);

watch(showCamera, (visible) => {
  const sprite = videoSprite();
  if (sprite) {
    sprite.visible = visible;
  }
});

onMounted(async () => {
  try {
    const pixiApp = await initPixiApp(width, height);

    const videoElement = await startWebcam({
      video: { width, height }
    });

    createVideoSprite(videoElement, pixiApp, {
      width,
      height,
      filters: presetFilters.vintage(),
    });

    const sprite = videoSprite();
    if (sprite) {
      sprite.visible = showCamera.value;
    }

    await startTracking(videoElement);
  } catch (error) {
    console.error('Options setup failed:', error);
  }
});
</script>

<template>
  <div class="options-view">
    <div class="toolbar">
      <button type="button" @click="emit('back')">← Back to Menu</button>
      <button type="button" @click="showCamera = !showCamera">
        {{ showCamera ? 'Hide' : 'Show' }} Camera Feed
      </button>
    </div>

    <div class="hand-readout">
      <p>Left hand: {{ leftHand ? `${leftHand.x.toFixed(0)}, ${leftHand.y.toFixed(0)} (confidence ${leftHand.confidence.toFixed(2)})` : 'not detected' }}</p>
      <p>Right hand: {{ rightHand ? `${rightHand.x.toFixed(0)}, ${rightHand.y.toFixed(0)} (confidence ${rightHand.confidence.toFixed(2)})` : 'not detected' }}</p>
    </div>

    <div ref="pixiContainer" class="pixi-container"></div>
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
.options-view {
  width: 800px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.hand-readout {
  font-family: monospace;
  margin-bottom: 8px;
}

.pixi-container {
  border: 2px solid #ccc;
  display: inline-block;
}
</style>
