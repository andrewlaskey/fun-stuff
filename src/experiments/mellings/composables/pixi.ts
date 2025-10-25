import { ref, onUnmounted } from 'vue';
import { Application as PixiApplication, ColorMatrixFilter, BlurFilter, Filter, Texture, Sprite } from 'pixi.js';

export function usePixiApp() {
  const pixiContainer = ref<HTMLDivElement | null>(null);
  let pixiApp: PixiApplication | null = null;

  const initPixiApp = async (width: number, height: number) => {
    if (!pixiContainer.value) {
      throw new Error('Pixi container not available');
    }

    pixiApp = new PixiApplication();

    await pixiApp.init({
      width,
      height,
      resolution: window.devicePixelRatio || 1,
    });

    pixiContainer.value.appendChild(pixiApp.canvas);
    return pixiApp;
  };

  const destroyPixiApp = () => {
    if (pixiApp) {
      pixiApp.destroy(true, true);
      pixiApp = null;
    }
  };

  onUnmounted(() => {
    destroyPixiApp();
  });

  return {
    pixiContainer,
    pixiApp: () => pixiApp,
    initPixiApp,
    destroyPixiApp,
  };
}

export interface VideoFilterOptions {
  grayscale?: boolean;
  sepiaIntensity?: number; // 0-1
  blurRadius?: number;
}

export function useVideoFilters() {
  const createFilters = (options: VideoFilterOptions): Filter[] => {
    const filters: Filter[] = [];

    if (options.grayscale) {
      const grayscaleFilter = new ColorMatrixFilter();
      grayscaleFilter.desaturate();
      filters.push(grayscaleFilter);
    }

    if (options.sepiaIntensity && options.sepiaIntensity > 0) {
      const sepiaFilter = new ColorMatrixFilter();
      sepiaFilter.sepia(true);
      sepiaFilter.alpha = options.sepiaIntensity;
      filters.push(sepiaFilter);
    }

    if (options.blurRadius && options.blurRadius > 0) {
      const blurFilter = new BlurFilter(options.blurRadius);
      filters.push(blurFilter);
    }

    return filters;
  };

  const presetFilters = {
    vintage: (): Filter[] => createFilters({
      grayscale: true,
      sepiaIntensity: 0.4,
      blurRadius: 3,
    }),
    blur: (radius = 5): Filter[] => createFilters({
      blurRadius: radius,
    }),
    blackAndWhite: (): Filter[] => createFilters({
      grayscale: true,
    }),
    sepia: (intensity = 0.6): Filter[] => createFilters({
      sepiaIntensity: intensity,
    }),
  };

  return {
    createFilters,
    presetFilters,
  };
}

export function useVideoSprite() {
  let videoTexture: Texture | null = null;
  let videoSprite: Sprite | null = null;

  const createVideoSprite = (
    videoElement: HTMLVideoElement,
    pixiApp: PixiApplication,
    options: {
      width: number;
      height: number;
      scale?: number;
      filters?: Filter[];
    }
  ) => {
    // Create texture and sprite
    videoTexture = Texture.from(videoElement);
    videoSprite = new Sprite(videoTexture);

    // Position and scale
    videoSprite.anchor.set(0.5);
    videoSprite.x = options.width / 2;
    videoSprite.y = options.height / 2;

    const scale = options.scale || Math.min(
      (options.width * 0.8) / videoSprite.width,
      (options.height * 0.8) / videoSprite.height
    );
    videoSprite.scale.set(scale * -1, scale);

    // Apply filters if provided
    if (options.filters && options.filters.length > 0) {
      videoSprite.filters = options.filters;
    }

    // Add to stage
    pixiApp.stage.addChild(videoSprite);

    // Start animation loop for texture updates
    const animate = () => {
      if (videoTexture && videoElement && !videoElement.paused) {
        videoTexture.update();
      }
    };
    pixiApp.ticker.add(animate);

    return videoSprite;
  };

  const updateFilters = (filters: Filter[]) => {
    if (videoSprite) {
      videoSprite.filters = filters;
    }
  };

  const destroySprite = () => {
    if (videoSprite && videoSprite.parent) {
      videoSprite.parent.removeChild(videoSprite);
    }
    if (videoTexture) {
      videoTexture.destroy();
    }
    videoSprite = null;
    videoTexture = null;
  };

  return {
    videoSprite: () => videoSprite,
    videoTexture: () => videoTexture,
    createVideoSprite,
    updateFilters,
    destroySprite,
  };
}