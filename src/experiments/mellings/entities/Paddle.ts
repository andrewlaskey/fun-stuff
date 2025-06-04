import { Bodies, Body, Composite, Engine } from "matter-js";

import { CATEGORIES } from "../utils/constants";
import { lerp } from "../../../utils/lerp";

interface Point {
  x: number;
  y: number;
}

// Optional confidence property for keypoints
interface Keypoint extends Point {
  confidence: number;
}

export class Paddle {
  public body: Body;

  private paddleVerticalOffset = 60;
  private smoothness = 0.2; // Lower = smoother/slower, Higher = more responsive
  private targetPosition: Point = { x: 0, y: 0 };
  private hasTarget = false;

  constructor(
    public width: number,
    public height: number,
    public color: string
  ) {
    this.body = Bodies.rectangle(0, 0, width, height, {
      isStatic: true,
      restitution: 0.8,
      collisionFilter: {
        mask: CATEGORIES.MELLING,
      },
    });
  }

  setupPhysics(engine: Engine): void {
    Composite.add(engine.world, [this.body]);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rect(
      this.body.position.x - this.width / 2,
      this.body.position.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.fill();
  }

  update(deltaTime: number, pose: Keypoint | undefined): void {
    if (pose && pose.confidence > 0.1) {
      this.targetPosition = {
        x: pose.x,
        y: pose.y - this.paddleVerticalOffset,
      };
      this.hasTarget = true;
    }

    if (this.hasTarget) {
      const smoothFactor = 1 - Math.pow(1 - this.smoothness, deltaTime * 60);

      const newPosition = {
        x: lerp(this.body.position.x, this.targetPosition.x, smoothFactor),
        y: lerp(this.body.position.y, this.targetPosition.y, smoothFactor),
      };

      Body.setPosition(this.body, newPosition);
    }
  }

  setSmoothness(value: number): void {
    this.smoothness = Math.max(0.01, Math.min(1.0, value));
  }

  getDistanceToTarget(): number {
    if (!this.hasTarget) return 0;
    const dx = this.targetPosition.x - this.body.position.x;
    const dy = this.targetPosition.y - this.body.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
