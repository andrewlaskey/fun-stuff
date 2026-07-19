<script setup lang="ts">
const emit = defineEmits<{
  "start-game": [];
  "open-editor": [];
  "open-options": [];
}>();
</script>

<template>
  <div class="main-menu">
    <h1>Mellings</h1>
    <nav class="menu-actions">
      <button type="button" @click="emit('start-game')">Start Game</button>
      <button type="button" @click="emit('open-editor')">Level Editor</button>
      <button type="button" @click="emit('open-options')">Options</button>
    </nav>
  </div>
</template>

<style lang="css">
.main-menu {
  width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 80px 0;
}

.main-menu h1 {
  font-size: 3em;
  margin: 0;
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 240px;
}

.menu-actions button {
  padding: 12px 20px;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  background-color: #44355b;
  color: #fff;
  cursor: pointer;
}

.menu-actions button:hover {
  background-color: #ee5622;
}
</style>
