import gsap from "gsap";
import { Bodies, Body, Composite, Engine } from "matter-js";
import { Graphics } from "pixi.js";

import { CATEGORIES, COLORS } from "../utils/constants";
import { PlatformConfig, PlatformOrientation } from "../types/LevelConfig";
import { drawPlatform, PLATFORM_HEIGHT } from "../utils/platformGraphics";
import { getPlatformMove, PlatformMove } from "../utils/platformMove";

export type { PlatformMove } from "../utils/platformMove";

export class Platform {
  public body: Body;
  public view: Graphics;
  public x: number;
  public y: number;
  public width: number;
  public height: number = PLATFORM_HEIGHT;
  public orientation: PlatformOrientation;
  private move: PlatformMove | undefined | null;

  constructor(config: PlatformConfig) {
    this.x = config.position.x;
    this.y = config.position.y;
    this.orientation = config.orientation;
    this.width = config.width;

    if (config.orientation === "horizontal") {
      this.body = this.body = Bodies.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        {
          isStatic: true,
        }
      );
    } else {
      this.body = this.body = Bodies.rectangle(
        this.x,
        this.y,
        this.height,
        this.width,
        {
          isStatic: true,
        }
      );
    }

    this.move = getPlatformMove(config);

    this.view = new Graphics();
    drawPlatform(this.view, this.width, this.orientation, COLORS["Flame"]);
    this.view.position.set(this.x, this.y);
  }

  setupPhysics(engine: Engine): void {
    Composite.add(engine.world, [this.body]);

    if (this.move) {
      const finalX = this.x + this.move.deltaX;
      const finalY = this.y + this.move.deltaY;

      gsap.to(this, {
        x: finalX,
        y: finalY,
        repeat: -1,
        duration: this.move.duration,
        yoyo: true,
        ease: "elastic.inOut",
        onUpdate: () => {
          Body.setPosition(this.body, {
            x: this.x,
            y: this.y,
          });
          this.view.position.set(this.x, this.y);
        },
      });
    }
  }
}
