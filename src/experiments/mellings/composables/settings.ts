import { ref, watch } from 'vue';

const STORAGE_KEY = 'mellings:showCameraFeed';

function readStoredShowCameraFeed(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

const showCameraFeed = ref(readStoredShowCameraFeed());

watch(showCameraFeed, (visible) => {
  localStorage.setItem(STORAGE_KEY, String(visible));
});

export function useSettings() {
  return {
    showCameraFeed,
  };
}
