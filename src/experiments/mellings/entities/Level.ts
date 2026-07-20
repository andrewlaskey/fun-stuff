import { Body, Vector, Bodies, Composite, Engine, Events } from "matter-js";
import gsap from "gsap";
import { Container, Graphics } from "pixi.js";

import { COLORS } from "../utils/constants";
import { Melling } from "./Melling";
import { CATEGORIES } from "../utils/constants";
import { Platform, PlatformMove } from "./Platform";
import { LevelConfig } from "../types/LevelConfig";

export class Level {
  public startLocation: Vector;
  public goal: Body;
  public platforms: Platform[] = [];
  public view: Container;

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

    this.view = new Container();

    const startMarker = new Graphics()
      .rect(0, 0, this.startWidth, 5)
      .fill(COLORS["English Violet"]);
    startMarker.position.set(this.startLocation.x, this.startLocation.y);

    const goalMarker = new Graphics()
      .rect(-this.goalWidth / 2, -this.goalHeight / 2, this.goalWidth, this.goalHeight)
      .fill(COLORS["English Violet"]);
    goalMarker.position.set(this.goal.position.x, this.goal.position.y);

    this.view.addChild(startMarker, goalMarker);

    for (const platform of this.platforms) {
      this.view.addChild(platform.view);
    }
  }

  setupPhysics(engine: Engine, mellings: Melling[]): void {
    Composite.add(engine.world, [this.goal]);

    for (const platform of this.platforms) {
      platform.setupPhysics(engine);
    }
  }

  teardown(engine: Engine): void {
    Composite.remove(engine.world, [this.goal]);

    for (const platform of this.platforms) {
      platform.teardown(engine);
    }

    this.view.destroy({ children: true });
  }
}
