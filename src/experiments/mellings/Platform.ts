import gsap from "gsap";
import { Bodies, Body, Composite, Engine } from "matter-js";

import { CATEGORIES, COLORS } from "./constants";

export interface PlatformMove {
    deltaX: number;
    deltaY: number;
    duration: number;
}

export class Platform {
    public body: Body;
    
    private move: PlatformMove | undefined | null;

    constructor(public x: number, public y: number, public width: number, public height: number, move?: PlatformMove) {
       this.body = Bodies.rectangle(x, y, width, height, {
            isStatic: true
        });

        if (move) {
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
                ease: 'elastic.inOut',
                onUpdate: () => {
                    Body.setPosition(this.body, {
                        x: this.x,
                        y: this.y
                    });
                }
            })
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = COLORS['Flame'];
        ctx.beginPath();
        ctx.rect(
            this.x - (this.width / 2),
            this.y - (this.height / 2),
            this.width,
            this.height
        );
        ctx.fill();
    }


}