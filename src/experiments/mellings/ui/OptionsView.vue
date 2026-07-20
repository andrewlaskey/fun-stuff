<script setup lang="ts">
import { onMounted, watch } from "vue";
import { Graphics } from 'pixi.js';
import { usePixiApp, useVideoFilters, useVideoSprite } from '../composables/pixi';
import { useWebcam } from '../composables/webcam';
import { useHandTracking, type Keypoint } from '../composables/bodypose';
import { useSettings } from '../composables/settings';
import { COLORS } from '../utils/constants';

const emit = defineEmits<{ back: [] }>();

const { pixiContainer, initPixiApp } = usePixiApp();
const { video, startWebcam } = useWebcam();
const { createVideoSprite, videoSprite } = useVideoSprite();
const { presetFilters } = useVideoFilters();
const { leftHand, rightHand, startTracking } = useHandTracking({
  confidenceThreshold: 0.05,
  flipped: true
});
const { showCameraFeed } = useSettings();

const width = 800;
const height = 600;

watch(showCameraFeed, (visible) => {
  const sprite = videoSprite();
  if (sprite) {
    sprite.visible = visible;
  }
});

let leftHandMarker: Graphics | null = null;
let rightHandMarker: Graphics | null = null;

function createHandMarker(color: string): Graphics {
  const marker = new Graphics()
    .circle(0, 0, 16)
    .stroke({ width: 3, color })
    .circle(0, 0, 5)
    .fill(color);
  marker.visible = false;
  return marker;
}

function positionHandMarker(marker: Graphics | null, hand: Keypoint | null) {
  if (!marker) return;

  const sprite = videoSprite();
  const videoEl = video.value;

  if (!hand || !sprite || !videoEl || !videoEl.videoWidth || !videoEl.videoHeight) {
    marker.visible = false;
    return;
  }

  // Sprite may be hidden (camera feed toggled off) while tracking keeps running,
  // and Pixi's getBounds() returns an empty rect for invisible objects — so the
  // on-screen position is derived from the sprite's transform directly instead.
  // The anchor is centered, so the AABB is symmetric regardless of scale sign
  // (used for mirroring), hence Math.abs() here.
  marker.position.set(
    sprite.x + (hand.x - videoEl.videoWidth / 2) * Math.abs(sprite.scale.x),
    sprite.y + (hand.y - videoEl.videoHeight / 2) * Math.abs(sprite.scale.y)
  );
  marker.visible = true;
}

watch([leftHand, rightHand], ([left, right]) => {
  positionHandMarker(leftHandMarker, left);
  positionHandMarker(rightHandMarker, right);
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
      sprite.visible = showCameraFeed.value;
    }

    leftHandMarker = createHandMarker(COLORS["Hunyadi yellow"]);
    rightHandMarker = createHandMarker(COLORS["Vermillion"]);
    pixiApp.stage.addChild(leftHandMarker, rightHandMarker);

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
      <button type="button" @click="showCameraFeed = !showCameraFeed">
        {{ showCameraFeed ? 'Hide' : 'Show' }} Camera Feed
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
