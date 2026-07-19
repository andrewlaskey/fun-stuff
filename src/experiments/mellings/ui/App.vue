<script setup lang="ts">
import { ref } from "vue";
import MainMenu from "./MainMenu.vue";
import GameView from "./GameView.vue";
import OptionsView from "./OptionsView.vue";
import LevelEditorView from "./LevelEditorView.vue";

type View = "menu" | "game" | "editor" | "options";
const currentView = ref<View>("menu");
</script>

<template>
  <MainMenu
    v-if="currentView === 'menu'"
    @start-game="currentView = 'game'"
    @open-editor="currentView = 'editor'"
    @open-options="currentView = 'options'"
  />
  <GameView v-else-if="currentView === 'game'" @back="currentView = 'menu'" />
  <OptionsView v-else-if="currentView === 'options'" @back="currentView = 'menu'" />
  <LevelEditorView v-else-if="currentView === 'editor'" @back="currentView = 'menu'" />
</template>
