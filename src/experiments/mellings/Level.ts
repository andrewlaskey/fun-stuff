import { Body, Vector, Bodies, Composite, Engine, Events } from "matter-js";
import gsap from "gsap";

import { COLORS } from "./constants";
import { Melling } from "./Melling";
import { CATEGORIES } from "./constants";
import { Platform, PlatformMove } from "./Platform";


export class Level {
    public startLocation: Vector;
    public goal: Body;
    public platforms: Platform[] = [];

    public readonly startWidth: number = 60;
    
    private goalWidth: number = 60;
    private goalHeight: number = 60;

    constructor(start: Vector, goal: Vector) {
        this.startLocation = start;
        this.goal = Bodies.rectangle(goal.x, goal.y, this.goalWidth, this.goalHeight, {
            isSensor: true,
            isStatic: true,
            collisionFilter: {
                category: CATEGORIES.GOAL
            }
        });

        const startingPlatform = new Platform(start.x, start.y + 80, 230, 15);
        this.platforms.push(startingPlatform);

        const move: PlatformMove = {
            deltaX: 0,
            deltaY: -150,
            duration: 3
        };
        const movingPlatform = new Platform(300, 270, 15, 230, move);
        this.platforms.push(movingPlatform);
    }

    setupPhysics(engine: Engine, mellings: Melling[]): void {
        Composite.add(engine.world, [this.goal]);

        for (const platform of this.platforms) {
            platform.setupPhysics(engine);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = COLORS['English Violet'];
        ctx.beginPath();
        ctx.rect(
            this.startLocation.x,
            this.startLocation.y,
            this.startWidth,
            5
        );
        ctx.fill();

        ctx.fillStyle = COLORS['English Violet'];
        ctx.beginPath();
        ctx.rect(
            this.goal.position.x - (this.goalWidth / 2),
            this.goal.position.y - (this.goalHeight / 2),
            this.goalWidth,
            this.goalHeight
        );
        ctx.fill();

        for (const platform of this.platforms) {
            platform.draw(ctx);
        }
    }
}