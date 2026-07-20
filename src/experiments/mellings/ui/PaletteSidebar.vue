<script setup lang="ts">
defineProps<{ armed: 'platform' | null }>();
const emit = defineEmits<{
  'toggle-place-platform': [];
  'select-start': [];
  'select-goal': [];
}>();
</script>

<template>
  <div class="palette-sidebar">
    <h3>Objects</h3>
    <button type="button" class="palette-item" @click="emit('select-start')">
      Start Portal
    </button>
    <button type="button" class="palette-item" @click="emit('select-goal')">
      Goal Portal
    </button>
    <button
      type="button"
      class="palette-item"
      :class="{ armed: armed === 'platform' }"
      @click="emit('toggle-place-platform')"
    >
      Platform{{ armed === 'platform' ? ' — click canvas to place' : '' }}
    </button>
  </div>
</template>

<style lang="css">
.palette-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 170px;
  flex-shrink: 0;
}

.palette-sidebar h3 {
  margin: 0 0 4px;
  font-size: 0.95em;
}

.palette-item {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.palette-item.armed {
  border-color: #eca72c;
  background: #fff7e8;
}
</style>
