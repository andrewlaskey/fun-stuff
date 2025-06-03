import gsap from "gsap";
import { Bodies, Body, Composite, Engine } from "matter-js";

import { CATEGORIES, COLORS } from "../utils/constants";
import { PlatformConfig, PlatformOrientation } from "../types/LevelConfig";

export interface PlatformMove {
  deltaX: number;
  deltaY: number;
  duration: number;
}

export class Platform {
  public body: Body;
  public x: number;
  public y: number;
  public width: number;
  public height: number = 15;
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

    if (config.isDynamic) {
      const move: PlatformMove = {
        deltaX: config.moveDelta?.x ?? 0,
        deltaY: config.moveDelta?.y ?? 0,
        duration: config.moveSpeed ?? 0,
      };
      this.move = move;
    }
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
        },
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS["Flame"];
    ctx.beginPath();

    if (this.orientation === "horizontal") {
      ctx.rect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      ctx.rect(
        this.x - this.height / 2,
        this.y - this.width / 2,
        this.height,
        this.width
      );
    }
    ctx.fill();
  }
}
