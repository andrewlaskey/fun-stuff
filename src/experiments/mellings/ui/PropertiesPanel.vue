<script setup lang="ts">
import { computed } from 'vue';
import type { LevelConfig, PlatformConfig, PlatformOrientation } from '../types/LevelConfig';
import type { Selection } from '../types/EditorState';

const props = defineProps<{
  level: LevelConfig;
  selection: Selection;
}>();

const emit = defineEmits<{
  'update:platform': [index: number, patch: Partial<PlatformConfig>];
  delete: [index: number];
}>();

const selectedPlatform = computed(() =>
  props.selection?.kind === 'platform' ? props.level.platforms[props.selection.index] : null
);

function updateOrientation(event: Event) {
  if (props.selection?.kind !== 'platform') return;
  const orientation = (event.target as HTMLSelectElement).value as PlatformOrientation;
  emit('update:platform', props.selection.index, { orientation });
}

function updateWidth(event: Event) {
  if (props.selection?.kind !== 'platform') return;
  const width = Number((event.target as HTMLInputElement).value);
  emit('update:platform', props.selection.index, { width });
}

function updateIsDynamic(event: Event) {
  if (props.selection?.kind !== 'platform') return;
  const isDynamic = (event.target as HTMLInputElement).checked;
  emit('update:platform', props.selection.index, { isDynamic });
}

function updateMoveDeltaX(event: Event) {
  if (props.selection?.kind !== 'platform' || !selectedPlatform.value) return;
  const x = Number((event.target as HTMLInputElement).value);
  emit('update:platform', props.selection.index, {
    moveDelta: { x, y: selectedPlatform.value.moveDelta?.y ?? 0 },
  });
}

function updateMoveDeltaY(event: Event) {
  if (props.selection?.kind !== 'platform' || !selectedPlatform.value) return;
  const y = Number((event.target as HTMLInputElement).value);
  emit('update:platform', props.selection.index, {
    moveDelta: { x: selectedPlatform.value.moveDelta?.x ?? 0, y },
  });
}

function updateMoveSpeed(event: Event) {
  if (props.selection?.kind !== 'platform') return;
  const moveSpeed = Number((event.target as HTMLInputElement).value);
  emit('update:platform', props.selection.index, { moveSpeed });
}

function onDelete() {
  if (props.selection?.kind !== 'platform') return;
  emit('delete', props.selection.index);
}
</script>

<template>
  <div class="properties-panel">
    <h3>Properties</h3>

    <p v-if="!selection" class="empty-state">Select an object to edit its properties.</p>

    <template v-else-if="selection.kind === 'start'">
      <p class="readout"><strong>Start Portal</strong></p>
      <p class="readout">x: {{ level.startPosition.x.toFixed(0) }}, y: {{ level.startPosition.y.toFixed(0) }}</p>
      <p class="hint">Drag on the canvas to reposition.</p>
    </template>

    <template v-else-if="selection.kind === 'goal'">
      <p class="readout"><strong>Goal Portal</strong></p>
      <p class="readout">x: {{ level.goalPosition.x.toFixed(0) }}, y: {{ level.goalPosition.y.toFixed(0) }}</p>
      <p class="hint">Drag on the canvas to reposition.</p>
    </template>

    <template v-else-if="selectedPlatform">
      <label>
        Orientation
        <select :value="selectedPlatform.orientation" @change="updateOrientation">
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </label>

      <label>
        Width
        <input type="number" min="10" :value="selectedPlatform.width" @change="updateWidth" />
      </label>

      <label class="checkbox">
        <input type="checkbox" :checked="selectedPlatform.isDynamic" @change="updateIsDynamic" />
        Moving platform
      </label>

      <template v-if="selectedPlatform.isDynamic">
        <label>
          Move delta X
          <input
            type="number"
            :value="selectedPlatform.moveDelta?.x ?? 0"
            @change="updateMoveDeltaX"
          />
        </label>
        <label>
          Move delta Y
          <input
            type="number"
            :value="selectedPlatform.moveDelta?.y ?? 0"
            @change="updateMoveDeltaY"
          />
        </label>
        <label>
          Move duration (s)
          <input
            type="number"
            min="0.1"
            step="0.1"
            :value="selectedPlatform.moveSpeed ?? 0"
            @change="updateMoveSpeed"
          />
        </label>
      </template>

      <button type="button" class="danger" @click="onDelete">Delete Platform</button>
    </template>
  </div>
</template>

<style lang="css">
.properties-panel {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.properties-panel h3 {
  margin: 0 0 4px;
  font-size: 0.95em;
}

.properties-panel label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9em;
}

.properties-panel label.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.properties-panel input,
.properties-panel select {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.properties-panel .empty-state,
.properties-panel .hint {
  color: #666;
  font-style: italic;
  font-size: 0.9em;
}

.properties-panel .readout {
  margin: 0;
}

.properties-panel button.danger {
  margin-top: 8px;
  background-color: #ED3D2D;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
}
</style>
