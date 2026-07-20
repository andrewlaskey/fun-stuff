<script setup lang="ts">
import { ref } from "vue";
import MainMenu from "./MainMenu.vue";
import GameView from "./GameView.vue";
import OptionsView from "./OptionsView.vue";
import LevelEditorView from "./LevelEditorView.vue";
import type { LevelConfig } from "../types/LevelConfig";

type View = "menu" | "game" | "editor" | "options";
const currentView = ref<View>("menu");

// Where "← Back to Menu" from GameView should land: the main menu for a
// normal "Start Game", or back to the editor when launched via "Play Level".
const returnView = ref<View>("menu");
const playLevels = ref<LevelConfig[] | null>(null);

function startGame() {
  playLevels.value = null;
  returnView.value = "menu";
  currentView.value = "game";
}

function playLevel(level: LevelConfig) {
  // level is a Vue reactive proxy (sourced from useLevelEditor's state) —
  // structuredClone() throws on those ("could not be cloned"); JSON
  // round-tripping strips reactivity and is safe since LevelConfig is
  // plain JSON-safe data.
  playLevels.value = [JSON.parse(JSON.stringify(level))];
  returnView.value = "editor";
  currentView.value = "game";
}

function backFromGame() {
  currentView.value = returnView.value;
}
</script>

<template>
  <MainMenu
    v-if="currentView === 'menu'"
    @start-game="startGame"
    @open-editor="currentView = 'editor'"
    @open-options="currentView = 'options'"
  />
  <GameView
    v-else-if="currentView === 'game'"
    :levels="playLevels ?? undefined"
    @back="backFromGame"
  />
  <OptionsView v-else-if="currentView === 'options'" @back="currentView = 'menu'" />
  <LevelEditorView
    v-else-if="currentView === 'editor'"
    @back="currentView = 'menu'"
    @play-level="playLevel"
  />
</template>
