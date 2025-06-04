import gsap from "gsap";
import {
  Bodies,
  Body,
  Vector,
  World,
  Query,
  Composite,
  Engine,
  Events,
  Collision,
} from "matter-js";

import { CATEGORIES } from "../utils/constants";

export type MellingState = "alive" | "dying" | "dead" | "goal";
export class Melling {
  public body: Body;
  public groundSensor: Body;
  public color: string;
  public state: MellingState = "alive";
  public isOnGround = true; // always move horizontally for now regardless if on ground. it looks better

  private width = 25;
  private height = 18;
  private direction = 1; // 1 for right, -1 for left
  private speed = 0.5;

  private dealthCountdown = 0.5;

  private particleFactor = 0;
  private scaleFactor = 1;

  private animationTimer = 0;
  private poseDuration = 0.25;
  private currentPose = 0;

  constructor(x: number, y: number, color = "#DB3069") {
    this.body = Bodies.rectangle(x, y, this.width, this.height, {
      restitution: 0.75,
      inertia: Infinity,
      collisionFilter: {
        category: CATEGORIES.MELLING,
        mask: ~CATEGORIES.MELLING,
      },
    });
    this.groundSensor = Bodies.rectangle(
      x,
      y + this.height / 2,
      this.width * 1.2,
      this.height * 0.1,
      {
        isSensor: true,
        collisionFilter: {
          category: CATEGORIES.MELLING,
          mask: ~CATEGORIES.MELLING,
        },
      }
    );
    this.color = color;
  }

  getBodies(): Body[] {
    return [this.body, this.groundSensor];
  }

  pose1(ctx: CanvasRenderingContext2D) {
    const path = new Path2D(
      "m 7.9961557,0.11687958 c -3.193488,0.21848 -5.020055,3.40777462 -6.249225,6.08369862 -1.241526,2.702826 1.566152,4.8455598 1.445144,7.4123018 -0.05894,1.250185 -4.345761,3.70723 -0.510009,4.168138 2.821595,0.339045 4.731425,-2.956736 6.949902,-2.792968 2.6257083,0.19383 3.9125813,0.733696 6.5218093,1.922961 1.738373,0.792336 7.461435,2.104476 4.644794,-1.173281 -1.199928,-1.396368 -1.695713,-1.0877 0.320446,-1.515907 2.593371,-0.550797 3.594372,-3.253315 3.938455,-5.7059628 0.383006,-2.730108 -2.101675,-5.242414 -4.752322,-5.250535 -2.564899,-0.0079 -3.492663,0.234457 -6.599636,-0.755117 C 11.716,1.8765469 10.158754,0.18415998 7.9961557,0.11687958 Z"
    );
    ctx.fillStyle = this.color;
    ctx.fill(path);
  }

  pose2(ctx: CanvasRenderingContext2D) {
    const path = new Path2D(
      "M 5.8013399,0.90763134 C 3.2312202,1.4187673 1.6454834,4.6303743 1.2739083,7.1016943 0.94957938,9.2588013 4.3666002,11.181922 4.2012471,13.00431 c -0.1561953,1.721498 0.8782646,6.199034 3.1933307,3.784855 1.2762864,-1.330928 0.5702065,-3.611324 3.5068202,-2.951501 1.924979,0.432523 4.654713,-1.668556 4.63473,1.410533 -0.02026,3.120178 3.708524,3.259071 3.011565,-0.838574 -0.456428,-2.683485 4.020536,-1.092568 5.509232,-3.271654 1.626264,-2.3804447 0.877889,-4.8725967 -0.650246,-6.9190657 -1.759351,-2.35611 -5.819561,1.233129 -7.495674,-0.477193 -1.822071,-1.859253 -4.283881,-3.36406096 -6.9094847,-3.24882196 -1.03414,0.04539 -2.4040119,-0.391825 -3.2001804,0.414743 z"
    );
    ctx.fillStyle = this.color;
    ctx.fill(path);
  }

  eyes(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#000000";

    ctx.beginPath();
    ctx.arc(this.width * 0.75, this.height * 0.4, 1, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.width * 0.85, this.height * 0.4, 1, 0, Math.PI * 2, true);
    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D, deltaTime: number) {
    this.animationTimer += deltaTime;

    // Switch pose every poseDuration seconds
    if (this.animationTimer >= this.poseDuration) {
      this.animationTimer = 0;
      this.currentPose = (this.currentPose + 1) % 2; // Toggle between 0 and 1
    }

    ctx.fillStyle = this.color;

    if (this.state === "alive") {
      ctx.save();
      ctx.translate(
        this.body.position.x - this.width / 2,
        this.body.position.y - this.height / 2
      );
      ctx.translate(-1.2521839, -0.4147566);
      ctx.scale(this.scaleFactor * this.direction, this.scaleFactor);

      if (this.currentPose === 0) {
        this.pose1(ctx);
      } else {
        this.pose2(ctx);
      }

      // Draw eyes
      this.eyes(ctx);

      ctx.restore();
    } else if (this.state === "dying") {
      const w = (this.width / 2) * this.particleFactor;
      const h = (this.height / 2) * this.particleFactor;
      const topLeftCorner = {
        x: this.body.position.x - w,
        y: this.body.position.y - h,
      };
      const topRightCorner = {
        x: this.body.position.x + w,
        y: this.body.position.y - h,
      };
      const bottomLeftCorner = {
        x: this.body.position.x - w,
        y: this.body.position.y + h,
      };
      const bottomRightCorner = {
        x: this.body.position.x + w,
        y: this.body.position.y + h,
      };
      ctx.beginPath();
      ctx.rect(topRightCorner.x, topRightCorner.y, 5, 5);
      ctx.rect(topLeftCorner.x, topLeftCorner.y, 5, 5);
      ctx.rect(bottomRightCorner.x, bottomRightCorner.y, 5, 5);
      ctx.rect(bottomLeftCorner.x, bottomLeftCorner.y, 5, 5);
      ctx.fill();
    }
  }

  update(engine: Engine): void {
    if (this.state === "alive") {
      this.aliveUpdate(engine);
    }
  }

  kill(engine: Engine): void {
    this.state = "dying";

    gsap.to(this, {
      particleFactor: 1,
      duration: this.dealthCountdown,
      ease: "expoOut",
      onComplete: () => {
        this.state = "dead";
        Composite.remove(engine.world, this.getBodies());
      },
    });
  }

  goal(engine: Engine): void {
    gsap.to(this, {
      scaleFactor: 0,
      delay: 0.5,
      duration: this.dealthCountdown,
      ease: "circOut",
      onComplete: () => {
        this.state = "goal";
        Composite.remove(engine.world, this.getBodies());
      },
    });
  }

  private aliveUpdate(engine: Engine): void {
    // Only move horizontally if on ground
    if (this.isOnGround) {
      // Check for wall collision
      const hitWall = this.checkWallCollision(engine);
      if (hitWall) {
        // Change direction when hitting a wall
        this.direction *= -1;
      }

      // Move in current direction
      Body.setVelocity(this.body, {
        x: this.speed * this.direction,
        y: this.body.velocity.y,
      });
    } else {
      // If falling, stop horizontal movement
      Body.setVelocity(this.body, {
        x: 0,
        y: this.body.velocity.y,
      });
    }

    Body.setPosition(this.groundSensor, {
      x: this.body.position.x,
      y: this.body.position.y + +(this.height / 2),
    });
  }

  // Check for wall collision using raycast
  private checkWallCollision(engine: Engine): boolean {
    const rayDistance = this.width / 2 + 2;
    const rayStart = Vector.create(this.body.position.x, this.body.position.y);
    const rayEnd = Vector.create(
      this.body.position.x + rayDistance * this.direction,
      this.body.position.y
    );

    const collisions = Query.ray(
      Composite.allBodies(engine.world),
      rayStart,
      rayEnd
    );

    // Filter out self and other Mellings from results
    return collisions.some((collision) => {
      const bodyA = collision.bodyA;
      const bodyB = collision.bodyB;

      // Check that it's not self
      if (bodyA === this.body || bodyB === this.body) {
        return false;
      }

      // Check that it's not another Melling by checking category
      const otherBody = bodyA === this.body ? bodyB : bodyA;
      return (
        otherBody.collisionFilter.category !== CATEGORIES.MELLING &&
        otherBody.collisionFilter.category !== CATEGORIES.GOAL
      );
    });
  }
}
