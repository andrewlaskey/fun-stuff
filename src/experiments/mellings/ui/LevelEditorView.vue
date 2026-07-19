<script setup lang="ts">
const emit = defineEmits<{ back: [] }>();
</script>

<template>
  <div class="level-editor-view">
    <div class="toolbar">
      <button type="button" @click="emit('back')">← Back to Menu</button>
    </div>
    <h2>Level Editor</h2>
    <p>Coming soon.</p>
  </div>
</template>

<style lang="css">
.level-editor-view {
  width: 800px;
}

.level-editor-view .toolbar {
  margin-bottom: 8px;
}
</style>
