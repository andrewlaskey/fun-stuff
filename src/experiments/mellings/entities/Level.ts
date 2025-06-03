import { Body, Vector, Bodies, Composite, Engine, Events } from "matter-js";
import gsap from "gsap";

import { COLORS } from "../utils/constants";
import { Melling } from "./Melling";
import { CATEGORIES } from "../utils/constants";
import { Platform, PlatformMove } from "./Platform";
import { LevelConfig } from "../types/LevelConfig";

export class Level {
  public startLocation: Vector;
  public goal: Body;
  public platforms: Platform[] = [];

  public readonly startWidth: number = 60;

  private goalWidth: number = 60;
  private goalHeight: number = 60;

  constructor(config: LevelConfig) {
    this.startLocation = Vector.create(
      config.startPosition.x,
      config.startPosition.y
    );
    this.goal = Bodies.rectangle(
      config.goalPosition.x,
      config.goalPosition.y,
      this.goalWidth,
      this.goalHeight,
      {
        isSensor: true,
        isStatic: true,
        collisionFilter: {
          category: CATEGORIES.GOAL,
        },
      }
    );

    for (const platformConfig of config.platforms) {
        const platform = new Platform(platformConfig);
        this.platforms.push(platform);
    }
  }

  setupPhysics(engine: Engine, mellings: Melling[]): void {
    Composite.add(engine.world, [this.goal]);

    for (const platform of this.platforms) {
      platform.setupPhysics(engine);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS["English Violet"];
    ctx.beginPath();
    ctx.rect(this.startLocation.x, this.startLocation.y, this.startWidth, 5);
    ctx.fill();

    ctx.fillStyle = COLORS["English Violet"];
    ctx.beginPath();
    ctx.rect(
      this.goal.position.x - this.goalWidth / 2,
      this.goal.position.y - this.goalHeight / 2,
      this.goalWidth,
      this.goalHeight
    );
    ctx.fill();

    for (const platform of this.platforms) {
      platform.draw(ctx);
    }
  }
}
