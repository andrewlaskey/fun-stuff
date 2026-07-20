<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import { useLevelEditor } from '../composables/useLevelEditor';
import { useEditorCanvas } from '../composables/useEditorCanvas';
import { createDefaultPlatform } from '../utils/levelDefaults';
import type { LevelConfig, PlatformConfig } from '../types/LevelConfig';
import PaletteSidebar from './PaletteSidebar.vue';
import PropertiesPanel from './PropertiesPanel.vue';

const emit = defineEmits<{ back: []; 'play-level': [level: LevelConfig] }>();

const {
  levels,
  activeLevel,
  selection,
  createLevel,
  selectLevel,
  closeLevel,
  duplicateLevel,
  deleteLevel,
  select,
  moveStart,
  moveGoal,
  addPlatform,
  movePlatform,
  updatePlatform,
  deletePlatform,
  copied,
  copyToClipboard,
  downloadJson,
} = useLevelEditor();

const armed = ref<'platform' | null>(null);
const previewing = ref(false);

const {
  pixiContainer,
  initEditorCanvas,
  mountLevel,
  rebuildPlatform,
  setSelection,
  setPlacementMode,
  startPreview,
  stopPreview,
  teardown,
} = useEditorCanvas({
  onObjectMoved: (kind, index, position) => {
    if (kind === 'start') moveStart(position);
    else if (kind === 'goal') moveGoal(position);
    else if (kind === 'platform' && index !== null) movePlatform(index, position);
  },
  onObjectSelected: (kind, index) => {
    if (kind === 'platform' && index !== null) select({ kind: 'platform', index });
    else if (kind === 'start') select({ kind: 'start' });
    else if (kind === 'goal') select({ kind: 'goal' });
  },
  onPlatformPlaced: (position) => {
    if (!activeLevel.value) return;
    addPlatform(createDefaultPlatform(position));
    mountLevel(activeLevel.value);
    if (previewing.value) startPreview(activeLevel.value.platforms);
    armed.value = null;
    select({ kind: 'platform', index: activeLevel.value.platforms.length - 1 });
    setSelection(selection.value);
  },
});

watch(
  activeLevel,
  async (level) => {
    armed.value = null;
    previewing.value = false;
    teardown();
    if (!level) return;
    await initEditorCanvas(800, 600);
    mountLevel(level);
  },
  { flush: 'post' }
);

watch(selection, (sel) => setSelection(sel));

onUnmounted(() => {
  teardown();
});

function onDelete(id: string, name: string) {
  if (confirm(`Delete "${name}"? This can't be undone.`)) {
    deleteLevel(id);
  }
}

function togglePlacePlatform() {
  armed.value = armed.value === 'platform' ? null : 'platform';
  setPlacementMode(armed.value);
}

function selectStart() {
  select({ kind: 'start' });
}

function selectGoal() {
  select({ kind: 'goal' });
}

function onUpdatePlatform(index: number, patch: Partial<PlatformConfig>) {
  updatePlatform(index, patch);

  if ('width' in patch || 'orientation' in patch) {
    const platform = activeLevel.value?.platforms[index];
    if (platform) {
      rebuildPlatform(index, platform.width, platform.orientation);
      setSelection(selection.value);
    }
  }
}

function onDeletePlatform(index: number) {
  deletePlatform(index);
  if (activeLevel.value) {
    mountLevel(activeLevel.value);
    if (previewing.value) startPreview(activeLevel.value.platforms);
  }
  setSelection(selection.value);
}

function togglePreview() {
  if (!activeLevel.value) return;

  previewing.value = !previewing.value;

  if (previewing.value) {
    startPreview(activeLevel.value.platforms);
  } else {
    stopPreview(activeLevel.value.platforms);
  }
}

function onPlay() {
  if (activeLevel.value) emit('play-level', activeLevel.value);
}
</script>

<template>
  <div class="level-editor-view">
    <div class="toolbar">
      <button type="button" @click="emit('back')">← Back to Menu</button>
      <div class="toolbar-spacer"></div>
      <button type="button" @click="copyToClipboard">
        {{ copied ? 'Copied!' : 'Copy JSON to Clipboard' }}
      </button>
      <button type="button" @click="downloadJson">Download levels.json</button>
    </div>

    <template v-if="!activeLevel">
      <div class="editor-header">
        <div>
          <h2>Level Editor</h2>
          <span class="level-count">{{ levels.length }} level{{ levels.length === 1 ? '' : 's' }}</span>
        </div>
        <button type="button" @click="createLevel">+ New Level</button>
      </div>

      <draggable
        v-model="levels"
        item-key="id"
        tag="ul"
        class="level-list"
        handle=".drag-handle"
        :animation="150"
        :force-fallback="true"
      >
        <template #item="{ element: level, index }">
          <li class="level-card">
            <span class="drag-handle" title="Drag to reorder">⠿</span>
            <div class="level-card-info">
              <strong>{{ index + 1 }}: {{ level.name }}</strong>
              <span>{{ level.platforms.length }} platform{{ level.platforms.length === 1 ? '' : 's' }}</span>
            </div>
            <div class="level-card-actions">
              <button type="button" @click="selectLevel(level.id)">Edit</button>
              <button type="button" @click="duplicateLevel(level.id)">Duplicate</button>
              <button type="button" class="danger" @click="onDelete(level.id, level.name)">Delete</button>
            </div>
          </li>
        </template>
      </draggable>
      <p v-if="levels.length === 0" class="empty-state">No levels yet — create one to get started.</p>
    </template>

    <template v-else>
      <div class="editor-header">
        <button type="button" @click="closeLevel">← Back to Levels</button>
        <input
          type="text"
          class="level-name-input"
          v-model="activeLevel.name"
          placeholder="Level name"
        />
        <div class="editor-header-actions">
          <button type="button" @click="togglePreview">
            {{ previewing ? 'Stop Preview' : 'Preview' }}
          </button>
          <button type="button" class="play" @click="onPlay">▶ Play Level</button>
        </div>
      </div>

      <div class="editor-workspace">
        <PaletteSidebar
          :armed="armed"
          @toggle-place-platform="togglePlacePlatform"
          @select-start="selectStart"
          @select-goal="selectGoal"
        />
        <div ref="pixiContainer" class="pixi-container"></div>
        <PropertiesPanel
          :level="activeLevel"
          :selection="selection"
          @update:platform="onUpdatePlatform"
          @delete="onDeletePlatform"
        />
      </div>
    </template>
  </div>
</template>

<style lang="css">
.level-editor-view {
  width: 1240px;
}

.level-editor-view .toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.toolbar-spacer {
  flex: 1;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.level-count {
  display: block;
  font-size: 0.85em;
  color: #666;
}

.level-name-input {
  flex: 1;
  padding: 8px 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.editor-header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.editor-header-actions button.play {
  background-color: #3F826D;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.level-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
}

.drag-handle {
  cursor: grab;
  color: #999;
  font-size: 1.2em;
  padding: 0 4px;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.level-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level-card-info span {
  font-size: 0.85em;
  color: #666;
}

.level-card-actions {
  display: flex;
  gap: 8px;
}

.level-card-actions button.danger {
  background-color: #ED3D2D;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
}

.empty-state {
  color: #666;
  font-style: italic;
}

.editor-workspace {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.pixi-container {
  border: 2px solid #ccc;
  display: inline-block;
}
</style>
