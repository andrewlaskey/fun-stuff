<script setup lang="ts">
import { onMounted } from "vue";
import { usePixiApp, useVideoFilters, useVideoSprite } from '../composables/pixi';
import { useWebcam } from '../composables/webcam';
import { useHandTracking } from '../composables/bodypose';
import { useGame } from '../composables/game';
import { useSettings } from '../composables/settings';
import levelsData from '../data/levels.json';
import type { LevelConfig } from '../types/LevelConfig';
import Scoreboard from "./Scoreboard.vue";

const props = defineProps<{ levels?: LevelConfig[] }>();
const emit = defineEmits<{ back: [] }>();

const levels = props.levels && props.levels.length > 0 ? props.levels : (levelsData as LevelConfig[]);

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

const game = useGame({ width, height });

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

    const sprite = videoSprite();
    if (sprite) {
      sprite.visible = showCameraFeed.value;
    }

    await startTracking(videoElement);

    await game.setup(pixiApp, levels);
    game.start(leftHand, rightHand);
  } catch (error) {
    console.error('Setup failed:', error);
  }
});
</script>

<template>
  <div class="app-container">
    <div class="toolbar">
      <button type="button" @click="emit('back')">← Back to Menu</button>
    </div>
    <Scoreboard
      :spawned="game.uiState.spawnedCount"
      :total="game.uiState.totalCount"
      :alive="game.uiState.aliveCount"
      :dead="game.uiState.deadCount"
      :saved="game.uiState.savedCount"
      :level="game.uiState.level"
    />
    <div class="pixi-container-wrapper">
      <div ref="pixiContainer" class="pixi-container"></div>
      <div v-if="game.state.value === 'lose'" class="end-overlay">
        <p class="end-message">Game Over</p>
        <button type="button" @click="game.retry()">Retry</button>
      </div>
      <div v-else-if="game.state.value === 'win'" class="end-overlay">
        <template v-if="game.hasNextLevel()">
          <p class="end-message">Level Complete!</p>
          <button type="button" @click="game.nextLevel()">Continue</button>
        </template>
        <template v-else>
          <p class="end-message">You Win!</p>
          <button type="button" @click="game.restartGame()">Play Again</button>
        </template>
      </div>
    </div>
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

.toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}

.pixi-container-wrapper {
  position: relative;
  display: inline-block;
}

.pixi-container {
  border: 2px solid #ccc;
  display: inline-block;
}

.end-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.6);
}

.end-message {
  color: #fff;
  font-size: 2.5em;
  font-weight: bold;
  margin: 0;
}

.end-overlay button {
  font-size: 1.2em;
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #3772FF;
  color: #fff;
}

.end-overlay button:hover {
  background-color: #2a5adf;
}
</style>
