import { ref } from "vue";
import {
  Bodies,
  Body,
  Common,
  Composite,
  Engine,
  Events,
  Vector,
} from "matter-js";
import { Application as PixiApplication, ColorMatrixFilter, BlurFilter, Filter, Texture, Sprite } from 'pixi.js';
import { CATEGORIES } from "../utils/constants";

export type GameState =
  | "loading"
  | "ready"
  | "playing"
  | "win"
  | "lose"
  | "pause";

export interface GameOptions {
  width?: number;
  height?: number;
  gravityScale?: number;
}

export function useGame(options: GameOptions = {}) {
    let pixiApp: PixiApplication | null = null;

  const isInitialized = ref(false);
  const state = ref<GameState>("loading");
  const level = ref(0);

  const engine = Engine.create();

  const config = {
    width: options?.width ?? 800,
    height: options?.height ?? 600,
    gravityScale: options?.gravityScale ?? 0.0005,
  };

  const setup = (pixi: PixiApplication) => {
    pixiApp = pixi;
    engine.gravity.scale = config.gravityScale;

    // Add World Bounds
    addWorldBounds();

    isInitialized.value = true;
    state.value = 'ready';
  };

  const start = () => {
    if (isInitialized.value && pixiApp) {
        state.value = 'playing';

        pixiApp.ticker.add((ticker) => {
            gameLoop();
        })
    }
  }

  const gameLoop = () => {
    Engine.update(engine, 1000 / 60);
  }

  const addWorldBounds = () => {
    const topWall = Bodies.rectangle(config.width / 2, -30, 1000, 60, {
      isStatic: true,
      restitution: 0.8,
    });
    const floorIsLava = Bodies.rectangle(
      config.width / 2,
      config.height + 30,
      1000,
      60,
      {
        isStatic: true,
        restitution: 1,
        collisionFilter: {
          category: CATEGORIES.LAVA,
        },
      }
    );
    const leftWall = Bodies.rectangle(-30, config.height / 2, 60, 1000, {
      isStatic: true,
      restitution: 0.8,
    });
    const rightWall = Bodies.rectangle(670, config.height / 2, 60, 1000, {
      isStatic: true,
      restitution: 0.8,
    });

    Composite.add(engine.world, [topWall, floorIsLava, leftWall, rightWall]);
  }

  return {
    isInitialized,
    state,
    level,
    setup,
    start
  }
}
