<script setup lang="ts">
import { onMounted, ref } from "vue";
import { App } from "../control/App";
import Scoreboard from "./Scoreboard.vue";

const app = new App(document, "#canvas");

app
  .preload()
  .then(() => {
    console.log("preload complete");
    app.manager.start();
  })
  .catch((e) => {
    console.error("failed to start app", e);
  });
</script>

<template>
  <div class="app-container">
    <Scoreboard
      :alive="app?.manager.uiState.aliveCount || 0"
      :saved="app?.manager.uiState.savedCount || 0"
      :level="app?.manager.uiState.level || 0"
    />
  </div>
</template>

<style lang="css">
.app-container {
  width: 720px;
}
</style>
