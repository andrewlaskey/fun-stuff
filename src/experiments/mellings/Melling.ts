import gsap from "gsap";
import { Bodies, Body, Vector, World, Query, Composite, Engine, Events, Collision } from "matter-js";

import { CATEGORIES } from "./constants";

export class Melling {
    public body: Body;
    public color: string;
    public state: 'alive' | 'dying' | 'dead' | 'goal' = 'alive';

    private width = 25;
    private height = this.width * 1.6;
    private direction = 1; // 1 for right, -1 for left
    private speed = 0.5;

    private groundSensor: Body;

    private dealthCountdown = 0.5;

    private particleFactor = 0;
    private scaleFactor = 1;

    constructor(x: number, y: number, color = '#DB3069') {
        this.body = Bodies.rectangle(x, y, this.width, this.height, {
            restitution: 0.75,
            inertia: Infinity,
            collisionFilter: {
                category: CATEGORIES.MELLING,
                mask: CATEGORIES.DEFAULT | CATEGORIES.WALL | CATEGORIES.LAVA // Mellings collide with walls and default objects
            }
        });
        this.groundSensor = Bodies.rectangle(x, y + (this.height / 2), this.width * 1.2, this.height * 0.1, {
            isSensor: true,
            collisionFilter: {
                category: CATEGORIES.MELLING
            }
        });
        this.color = color;
    }

    getBodies(): Body[] {
        return [this.body, this.groundSensor];
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;

        if (this.state === 'alive') {
            ctx.beginPath();
            ctx.rect(
                this.body.position.x - (this.width / 2),
                this.body.position.y - (this.height / 2),
                this.width * this.scaleFactor,
                this.height * this.scaleFactor
            );
            ctx.fill();
        } else if (this.state === 'dying') {
            const w = (this.width / 2) * this.particleFactor;
            const h = (this.height / 2) * this.particleFactor;
            const topLeftCorner = {
                x: this.body.position.x - w,
                y: this.body.position.y - h
            };
            const topRightCorner = {
                x: this.body.position.x + w,
                y: this.body.position.y - h
            };
            const bottomLeftCorner = {
                x: this.body.position.x - w,
                y: this.body.position.y + h
            };
            const bottomRightCorner = {
                x: this.body.position.x + w,
                y: this.body.position.y + h
            };
            ctx.beginPath();
            ctx.rect(
                topRightCorner.x,
                topRightCorner.y,
                5,
                5
            );
            ctx.rect(
                topLeftCorner.x,
                topLeftCorner.y,
                5,
                5
            );
            ctx.rect(
                bottomRightCorner.x,
                bottomRightCorner.y,
                5,
                5
            );
            ctx.rect(
                bottomLeftCorner.x,
                bottomLeftCorner.y,
                5,
                5
            );
            ctx.fill();
        }
    }

    update(engine: Engine): void {
        if (this.state === 'alive') {
            this.aliveUpdate(engine);
        }
    }

    kill(engine: Engine): void {
        this.state = 'dying';

        gsap.to(this, {
            particleFactor: 1,
            duration: this.dealthCountdown,
            ease: 'expoOut',
            onComplete: () => {
                this.state = 'dead';
                Composite.remove(engine.world, this.getBodies());
            }
        });
    }

    goal(engine: Engine): void {
        gsap.to(this, {
            scaleFactor: 0,
            delay: 0.5,
            duration: this.dealthCountdown,
            ease: 'circOut',
            onComplete: () => {
                this.state = 'goal';
                Composite.remove(engine.world, this.getBodies());
            }
        });
    }

    private aliveUpdate(engine: Engine): void {
        // Check if on ground
        const isOnGround = this.checkGround(engine);
            
        // Only move horizontally if on ground
        if (isOnGround) {
            // Check for wall collision
            const hitWall = this.checkWallCollision(engine);
            if (hitWall) {
                // Change direction when hitting a wall
                this.direction *= -1;
            }
            
            // Move in current direction
            Body.setVelocity(this.body, { 
                x: this.speed * this.direction, 
                y: this.body.velocity.y 
            });
        } else {
            // If falling, stop horizontal movement
            Body.setVelocity(this.body, { 
                x: 0, 
                y: this.body.velocity.y 
            });
        }
    }

    // Check if Melling is on ground using raycast
    private checkGround(engine: Engine): boolean {
        const bodies = Composite.allBodies(engine.world);

        return bodies.some(body => Collision.collides(this.groundSensor, body));
    }

    // Check for wall collision using raycast
    private checkWallCollision(engine: Engine): boolean {
        const rayDistance = this.width/2 + 2;
        const rayStart = Vector.create(this.body.position.x, this.body.position.y);
        const rayEnd = Vector.create(
            this.body.position.x + (rayDistance * this.direction), 
            this.body.position.y
        );
        
        const collisions = Query.ray(Composite.allBodies(engine.world), rayStart, rayEnd);
        
        // Filter out self and other Mellings from results
        return collisions.some(collision => {
            const bodyA = collision.bodyA;
            const bodyB = collision.bodyB;
            
            // Check that it's not self
            if (bodyA === this.body || bodyB === this.body) {
                return false;
            }
            
            // Check that it's not another Melling by checking category
            const otherBody = bodyA === this.body ? bodyB : bodyA;
            return otherBody.collisionFilter.category !== CATEGORIES.MELLING &&
                otherBody.collisionFilter.category !== CATEGORIES.GOAL;
        });
    }
}