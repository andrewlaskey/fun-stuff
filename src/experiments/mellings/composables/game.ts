import { ref, reactive, onUnmounted, Ref } from "vue";
import {
  Bodies,
  Body,
  Common,
  Composite,
  Engine,
  Events,
} from "matter-js";
import { Application as PixiApplication, TickerCallback } from "pixi.js";
import { draw, group } from "radash";
import { CATEGORIES, COLORS } from "../utils/constants";
import { Level } from "../entities/Level";
import { Melling } from "../entities/Melling";
import { Paddle } from "../entities/Paddle";
import { LevelConfig } from "../types/LevelConfig";
import { Keypoint } from "./bodypose";

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
  totalMellings?: number;
  addMellingIntervalMs?: number;
}

const MELLING_COLORS = [
  "#F7F7FF", "#3F826D", "#3772FF", "#A9F0D1", "#EAFDCF", "#B1F8F2",
  "#7EA3CC", "#F7EDF0", "#7FD1B9", "#3C91E6", "#F7CACD", "#9FC2CC", "#A9CEF4",
  "#F2F5EA", "#9AD2CB", "#F3F3F3", "#437C90", "#E5A4CB", "#20A39E", "#009FFD",
  "#3E92CC", "#899E8B", "#BEEF9E", "#DB3069",
];

export function useGame(options: GameOptions = {}) {
  let pixiApp: PixiApplication | null = null;

  const isInitialized = ref(false);
  const state = ref<GameState>("loading");

  const uiState = reactive({
    spawnedCount: 0,
    totalCount: 0,
    aliveCount: 0,
    deadCount: 0,
    savedCount: 0,
    level: 0,
  });

  const engine = Engine.create();

  const config = {
    width: options?.width ?? 800,
    height: options?.height ?? 600,
    gravityScale: options?.gravityScale ?? 0.0005,
    totalMellings: options?.totalMellings ?? 100,
    addMellingIntervalMs: options?.addMellingIntervalMs ?? 500,
  };

  let levels: Level[] = [];
  let mellings: Melling[] = [];
  let leftPaddle: Paddle;
  let rightPaddle: Paddle;
  let currentLevelIndex = 0;

  let spawnTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let spawnIntervalId: ReturnType<typeof setInterval> | null = null;
  let tickerCallback: TickerCallback<unknown> | null = null;

  const currentLevel = () => levels[currentLevelIndex];

  onUnmounted(() => {
    if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    if (tickerCallback) pixiApp?.ticker?.remove(tickerCallback);
    state.value = "pause";
  });

  const setup = async (
    pixi: PixiApplication,
    levelData: LevelConfig[]
  ): Promise<void> => {
    pixiApp = pixi;
    engine.gravity.scale = config.gravityScale;

    addWorldBounds();

    levels = levelData.map((levelConfig) => new Level(levelConfig));
    currentLevelIndex = 0;
    uiState.level = currentLevelIndex;
    uiState.totalCount = config.totalMellings;

    const paddleWidth = 200;
    const paddleHeight = 12;
    leftPaddle = new Paddle(paddleWidth, paddleHeight, COLORS["Hunyadi yellow"]);
    rightPaddle = new Paddle(paddleWidth, paddleHeight, COLORS["Flame"]);

    currentLevel().setupPhysics(engine, mellings);
    leftPaddle.setupPhysics(engine);
    rightPaddle.setupPhysics(engine);

    pixiApp.stage.addChild(currentLevel().view, leftPaddle.view, rightPaddle.view);

    setupCollisions();

    isInitialized.value = true;
    state.value = "ready";
  };

  const start = (
    leftHand: Ref<Keypoint | null>,
    rightHand: Ref<Keypoint | null>
  ): void => {
    if (!isInitialized.value || !pixiApp) return;

    state.value = "playing";

    spawnTimeoutId = setTimeout(() => {
      spawnMellings();
    }, 3 * 1000);

    tickerCallback = (ticker) => {
      gameLoop(ticker.deltaMS / 1000, leftHand, rightHand);
    };
    pixiApp.ticker.add(tickerCallback);
  };

  const gameLoop = (
    deltaTime: number,
    leftHand: Ref<Keypoint | null>,
    rightHand: Ref<Keypoint | null>
  ): void => {
    if (state.value !== "playing") return;

    leftPaddle.update(deltaTime, leftHand.value ?? undefined);
    rightPaddle.update(deltaTime, rightHand.value ?? undefined);

    for (const melling of mellings) {
      melling.update(engine);
    }

    Engine.update(engine, 1000 / 60);

    checkEndCondition();

    uiState.spawnedCount = mellings.length;
    uiState.aliveCount = mellings.filter((m) => m.state === "alive").length;
    uiState.deadCount = mellings.filter((m) => m.state === "dead" || m.state === "dying").length;
    uiState.savedCount = mellings.filter((m) => m.state === "goal").length;

    for (const melling of mellings) {
      melling.render(deltaTime);
    }
  };

  const spawnMellings = (): void => {
    let count = 0;

    spawnIntervalId = setInterval(() => {
      if (!pixiApp || !spawnIntervalId) return;

      if (count < config.totalMellings) {
        const level = currentLevel();
        const x = Common.random(
          level.startLocation.x,
          level.startLocation.x + level.startWidth
        );
        const melling = new Melling(x, level.startLocation.y, draw(MELLING_COLORS) ?? "#DB3069");
        mellings.push(melling);
        Composite.add(engine.world, melling.getBodies());
        pixiApp.stage.addChild(melling.view);
        count++;
      } else {
        clearInterval(spawnIntervalId);
        spawnIntervalId = null;
      }
    }, config.addMellingIntervalMs);
  };

  const addWorldBounds = (): void => {
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
    const rightWall = Bodies.rectangle(config.width + 30, config.height / 2, 60, 1000, {
      isStatic: true,
      restitution: 0.8,
    });

    Composite.add(engine.world, [topWall, floorIsLava, leftWall, rightWall]);
  };

  const setupCollisions = (): void => {
    Events.on(engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        checkLavaCollision(pair.bodyA, pair.bodyB);
        checkGoalCollision(pair.bodyA, pair.bodyB);
      }
    });
  };

  const checkLavaCollision = (bodyA: Body, bodyB: Body): void => {
    const isMellingA = bodyA.collisionFilter.category === CATEGORIES.MELLING;
    const isLavaB = bodyB.collisionFilter.category === CATEGORIES.LAVA;
    const isMellingB = bodyB.collisionFilter.category === CATEGORIES.MELLING;
    const isLavaA = bodyA.collisionFilter.category === CATEGORIES.LAVA;

    if ((isMellingA && isLavaB) || (isMellingB && isLavaA)) {
      const mellingBody = isMellingA ? bodyA : bodyB;
      const melling = mellings.find((m) => m.body === mellingBody);
      melling?.kill(engine);
    }
  };

  const checkGoalCollision = (bodyA: Body, bodyB: Body): void => {
    const goalBody = currentLevel().goal;
    const isMellingA = bodyA.collisionFilter.category === CATEGORIES.MELLING;
    const isGoalB = bodyB === goalBody;
    const isMellingB = bodyB.collisionFilter.category === CATEGORIES.MELLING;
    const isGoalA = bodyA === goalBody;

    if ((isMellingA && isGoalB) || (isMellingB && isGoalA)) {
      const mellingBody = isMellingA ? bodyA : bodyB;
      const melling = mellings.find((m) => m.body === mellingBody);
      melling?.goal(engine);
    }
  };

  const checkEndCondition = (): void => {
    if (mellings.length === 0) return;

    const mellingStates = group(mellings, (m) => m.state);

    if (!mellingStates.alive) {
      state.value = mellingStates.goal ? "win" : "lose";
    }
  };

  return {
    isInitialized,
    state,
    uiState,
    setup,
    start,
  };
}
