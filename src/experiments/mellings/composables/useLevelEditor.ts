import { ref, watch, computed } from 'vue';
import type { LevelConfig, PlatformConfig, Position } from '../types/LevelConfig';
import type { Selection } from '../types/EditorState';
import levelsData from '../data/levels.json';
import { createBlankLevel } from '../utils/levelDefaults';

const seedLevels = levelsData as LevelConfig[];

const STORAGE_KEY = 'mellings.editor.levels.v1';
const AUTOSAVE_DEBOUNCE_MS = 400;
const COPY_ACKNOWLEDGMENT_MS = 2000;

interface StoredWorkingSet {
  version: 1;
  levels: LevelConfig[];
  savedAt: string;
}

function loadWorkingSet(): LevelConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredWorkingSet;
      if (parsed.version === 1 && Array.isArray(parsed.levels)) {
        return parsed.levels;
      }
    }
  } catch (err) {
    console.warn('Failed to load mellings level editor working set from localStorage', err);
  }

  return structuredClone(seedLevels);
}

function persistWorkingSet(levels: LevelConfig[]): void {
  try {
    const payload: StoredWorkingSet = {
      version: 1,
      levels,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to autosave mellings level editor working set', err);
  }
}

export function useLevelEditor() {
  const levels = ref<LevelConfig[]>(loadWorkingSet());
  const activeLevelId = ref<string | null>(null);
  const selection = ref<Selection>(null);

  const activeLevel = computed(
    () => levels.value.find((level) => level.id === activeLevelId.value) ?? null
  );

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    levels,
    () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => persistWorkingSet(levels.value), AUTOSAVE_DEBOUNCE_MS);
    },
    { deep: true }
  );

  const copied = ref(false);
  let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

  function exportJson(): string {
    return JSON.stringify(levels.value, null, 2);
  }

  async function copyToClipboard(): Promise<void> {
    await navigator.clipboard.writeText(exportJson());
    copied.value = true;
    if (copiedTimeout) clearTimeout(copiedTimeout);
    copiedTimeout = setTimeout(() => {
      copied.value = false;
    }, COPY_ACKNOWLEDGMENT_MS);
  }

  function downloadJson(): void {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'levels.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function createLevel(): void {
    const level = createBlankLevel(levels.value.length);
    levels.value.push(level);
    activeLevelId.value = level.id;
    selection.value = null;
  }

  function selectLevel(id: string): void {
    activeLevelId.value = id;
    selection.value = null;
  }

  function closeLevel(): void {
    activeLevelId.value = null;
    selection.value = null;
  }

  function select(sel: Selection): void {
    selection.value = sel;
  }

  function moveStart(position: Position): void {
    if (!activeLevel.value) return;
    activeLevel.value.startPosition = position;
  }

  function moveGoal(position: Position): void {
    if (!activeLevel.value) return;
    activeLevel.value.goalPosition = position;
  }

  function addPlatform(config: PlatformConfig): void {
    activeLevel.value?.platforms.push(config);
  }

  function movePlatform(index: number, position: Position): void {
    const platform = activeLevel.value?.platforms[index];
    if (platform) platform.position = position;
  }

  function updatePlatform(index: number, patch: Partial<PlatformConfig>): void {
    const platform = activeLevel.value?.platforms[index];
    if (platform) Object.assign(platform, patch);
  }

  function deletePlatform(index: number): void {
    if (!activeLevel.value) return;
    activeLevel.value.platforms.splice(index, 1);

    if (selection.value?.kind === 'platform' && selection.value.index === index) {
      selection.value = null;
    }
  }

  function deleteLevel(id: string): void {
    const index = levels.value.findIndex((level) => level.id === id);
    if (index === -1) return;

    levels.value.splice(index, 1);

    if (activeLevelId.value === id) {
      activeLevelId.value = null;
    }
  }

  function renameLevel(id: string, name: string): void {
    const level = levels.value.find((l) => l.id === id);
    if (level) level.name = name;
  }

  function updateActiveLevel(patch: Partial<Omit<LevelConfig, 'id'>>): void {
    if (!activeLevel.value) return;
    Object.assign(activeLevel.value, patch);
  }

  return {
    levels,
    activeLevelId,
    activeLevel,
    selection,
    createLevel,
    selectLevel,
    closeLevel,
    deleteLevel,
    renameLevel,
    updateActiveLevel,
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
  };
}
