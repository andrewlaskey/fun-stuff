import { Body, Vector, Bodies, Composite, Engine, Events } from "matter-js";

import { COLORS } from "./constants";
import { Melling } from "./Melling";
import { CATEGORIES } from "./constants";

export interface Platform {
    width: number;
    height: number;
    body: Body
}

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

        const platform: Platform = {
            body: Bodies.rectangle(start.x, start.y + 80, 230, 15, {
                isStatic: true
            }),
            width: 230,
            height: 15
        };
        this.platforms.push(platform);
    }

    setupPhysics(engine: Engine, mellings: Melling[]): void {
        Composite.add(engine.world, [
            this.goal,
            ...this.platforms.map(platform => platform.body)
        ]);

        Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                
                // Check if one body is a Melling and the other is lava
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                
                const isMellingA = bodyA.collisionFilter.category === CATEGORIES.MELLING;
                const isGoalB = bodyB === this.goal;
                
                const isMellingB = bodyB.collisionFilter.category === CATEGORIES.MELLING;
                const isGoalA = bodyA === this.goal;
                
                if ((isMellingA && isGoalB) || (isMellingB && isGoalA)) {
                    const mellingBody = isMellingA ? bodyA : bodyB
                    
                    // Handle lava collision
                    const melling = mellings.find(m => m.body === mellingBody);

                    if (melling) {
                        melling.goal(engine);
                    }
                }
            }
        });
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
            ctx.fillStyle = COLORS['Raisin black'];
            ctx.beginPath();
            ctx.rect(
                platform.body.position.x - (platform.width / 2),
                platform.body.position.y - (platform.height / 2),
                platform.width,
                platform.height
            );
            ctx.fill();
        }
    }
}