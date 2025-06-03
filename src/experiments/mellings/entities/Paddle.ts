import { Bodies, Body, Composite, Engine } from "matter-js";

import { CATEGORIES } from "../utils/constants";
import { lerp } from '../../../utils/lerp';

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
    private smooth = 0.5;

    constructor(public width: number, public height: number, public color: string) {
        this.body = Bodies.rectangle(0, 0, width, height, {
            isStatic: true,
            restitution: 0.8,
            collisionFilter: {
                mask: CATEGORIES.MELLING
            }
        });
    }

    setupPhysics(engine: Engine): void {
        Composite.add(engine.world, [this.body]);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(this.body.position.x - (this.width / 2), this.body.position.y, this.width, this.height);
        ctx.fill();
    }

    update(deltaTime: number, pose: Keypoint | undefined): void {
        // Adjust smooth factor based on deltaTime
        const smoothFactor = Math.min(1.0, this.smooth * deltaTime * 60);
        
        if (pose && pose.confidence > 0.1) {
            Body.setPosition(this.body, {
                x: lerp(this.body.position.x, pose.x, smoothFactor),
                y: lerp(this.body.position.y, pose.y - this.paddleVerticalOffset, smoothFactor)
            });
        }
    }
}