import { Bodies, Body, Common, Composite, Engine, Events, Vector } from "matter-js";
import { Level } from "../entities/Level";
import { Melling, MellingState } from "../entities/Melling";
import { Paddle } from "../entities/Paddle";
import { CATEGORIES, COLORS } from "../utils/constants";
import { PoseManager } from "./PoseManager";
import { draw, group } from "radash";
import { LevelConfig } from "../types/LevelConfig";

export class GameManager {
    public state: 'playing' | 'win' | 'lose' = 'playing';

    public levels: Level[] = [];
    public mellings: Melling[] = [];
    public engine: Engine;

    public currentLevel: number = 0;

    public poseManager: PoseManager;
    public leftPaddle: Paddle;
    public rightPaddle: Paddle;

    private lastFrameTime: number = performance.now();

    private addMellingIntervalMs: number = 200;

    private gravityScale: number = 0.0005;

    constructor(
        public width: number,
        public height: number,
        public totalMellings: number,
        private video: HTMLVideoElement,
        private ctx: CanvasRenderingContext2D | null,
        levelData: LevelConfig[]
    ) {
        this.engine = Engine.create();

        this.poseManager = new PoseManager();

        const platformWidth = 200;
        const platformHeight = 12;

        this.leftPaddle = new Paddle(platformWidth, platformHeight, COLORS['Hunyadi yellow']);
        this.rightPaddle = new Paddle(platformWidth, platformHeight, COLORS['Flame']);

        for (const levelConfig of levelData) {
            this.levels.push(new Level(levelConfig))
        }
       
    }

    start(): void {
        setTimeout(() => {
            this.addMellings();
        }, 3 * 1000);

        requestAnimationFrame(() => {
            this.loop()
        });
    }

    setup(): void {
        this.poseManager.start(this.video);
        this.setupPhysics();
    }

    loop(): void {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // in seconds
        this.lastFrameTime = currentTime;

        this.leftPaddle.update(deltaTime, this.poseManager.getLeftHand());
        this.rightPaddle.update(deltaTime, this.poseManager.getRightHand());

        for (const melling of this.mellings) {
            melling.update(this.engine);
        }

        Engine.update(this.engine, 1000 / 60);

        this.checkEndCondition();

        this.draw();

        requestAnimationFrame(() => {
            this.loop()
        });
    }

    draw(): void {
        if (this.ctx) {
            this.drawVideo();
            this.levels[this.currentLevel].draw(this.ctx);
            this.leftPaddle.draw(this.ctx);
            this.rightPaddle.draw(this.ctx);

            for (const melling of this.mellings) {
                melling.draw(this.ctx);
            }
        }
    }

    getAliveMellingsCount(): number {
        return this.mellings.filter(melling => melling.state !== 'dead').length;
    }

    getSavedMellingsCount(): number {
        return this.mellings.filter(melling => melling.state === 'goal').length;
    }

    private drawVideo(): void {
        if (this.ctx) {
            this.ctx.save();
            this.ctx.filter = 'grayscale(100%) sepia(40%) blur(3px)'; // brightness(150%)
            this.ctx.translate(this.width, 0); // Move the origin to the right edge
            this.ctx.scale(-1, 1); // Flip horizontally
            this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    private setupPhysics(): void {
        this.engine.gravity.scale = this.gravityScale;

        this.addWorldBounds();

        this.levels[this.currentLevel].setupPhysics(this.engine, this.mellings);
        this.leftPaddle.setupPhysics(this.engine);
        this.rightPaddle.setupPhysics(this.engine);

        this.setupCollisions();
    };

    private addWorldBounds(): void {
        const topWall = Bodies.rectangle(this.width / 2, -30, 1000, 60, { isStatic: true, restitution: 0.8 });
        const floorIsLava = Bodies.rectangle(this.width / 2, this.height + 30, 1000, 60, {
            isStatic: true,
            restitution: 1,
            collisionFilter: {
                category: CATEGORIES.LAVA
            }
        });
        const leftWall = Bodies.rectangle(-30, this.height / 2, 60, 1000, {
            isStatic: true,
            restitution: 0.8,
        });
        const rightWall = Bodies.rectangle(670, this.height / 2, 60, 1000, {
            isStatic: true,
            restitution: 0.8,
        });

        Composite.add(this.engine.world, [
            topWall,
            floorIsLava,
            leftWall,
            rightWall,
        ]);
    }

    setupCollisions(): void {
        Events.on(this.engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                
                // Check if one body is a Melling and the other is lava
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                
                this.checkLavaCollision(bodyA, bodyB);
                this.checkGoalCollision(bodyA, bodyB);
                // this.checkMellingsGround(bodyA, bodyB, true);
            }
        });

        // Events.on(this.engine, 'collisionEnd', (event) => {
        //     const pairs = event.pairs;
            
        //     for (let i = 0; i < pairs.length; i++) {
        //         const pair = pairs[i];
                
        //         // Check if one body is a Melling and the other is lava
        //         const bodyA = pair.bodyA;
        //         const bodyB = pair.bodyB;
                
        //         this.checkMellingsGround(bodyA, bodyB, false);      
        //     }
        // });
    }

    checkLavaCollision(bodyA: Body, bodyB: Body): void {
        const isMellingA = bodyA.collisionFilter.category === CATEGORIES.MELLING;
        const isLavaB = bodyB.collisionFilter.category === CATEGORIES.LAVA;
        
        const isMellingB = bodyB.collisionFilter.category === CATEGORIES.MELLING;
        const isLavaA = bodyA.collisionFilter.category === CATEGORIES.LAVA;
        
        if ((isMellingA && isLavaB) || (isMellingB && isLavaA)) {
            const mellingBody = isMellingA ? bodyA : bodyB
            
            // Handle lava collision
            const melling = this.mellings.find(m => m.body === mellingBody);

            if (melling) {
                melling.kill(this.engine);
            }
        }
    }

    checkGoalCollision(bodyA: Body, bodyB: Body): void {
        const isMellingA = bodyA.collisionFilter.category === CATEGORIES.MELLING;
        const isGoalB = bodyB === this.levels[this.currentLevel].goal;
        
        const isMellingB = bodyB.collisionFilter.category === CATEGORIES.MELLING;
        const isGoalA = bodyA === this.levels[this.currentLevel].goal;
        
        if ((isMellingA && isGoalB) || (isMellingB && isGoalA)) {
            const mellingBody = isMellingA ? bodyA : bodyB
            
            // Handle lava collision
            const melling = this.mellings.find(m => m.body === mellingBody);

            if (melling) {
                melling.goal(this.engine);
            }
        }
    }

    checkMellingsGround(bodyA: Body, bodyB: Body, newValue: boolean): void {
        for (const melling of this.mellings) {
            if (bodyA === melling.groundSensor || bodyB === melling.groundSensor) {
                const otherBody = bodyA === melling.groundSensor ? bodyB : bodyA;
                
                // Check if the other body is ground/platform
                if (otherBody.collisionFilter.category && otherBody.collisionFilter.category !== CATEGORIES.MELLING) {
                    melling.isOnGround = newValue;
                }
            }
        }
    }

    private addMellings(): void {
        let count = 0;

        setInterval(() => {
            if (count < this.totalMellings) {
                const colors = ['#F7F7FF', '#3F826D', '#3772FF', '#A9F0D1', '#EAFDCF', '#B1F8F2',
                    '#7EA3CC', '#F7EDF0', '#7FD1B9', '#3C91E6', '#F7CACD', '#9FC2CC', '#A9CEF4',
                    '#F2F5EA', '#9AD2CB', '#F3F3F3', '#437C90', '#E5A4CB', '#20A39E', '#009FFD',
                    '#3E92CC', '#899E8B', '#BEEF9E', '#DB3069'
                ];
                const level = this.levels[this.currentLevel];

                const x = Common.random(level.startLocation.x, level.startLocation.x + level.startWidth);
                const melling = new Melling(x, level.startLocation.y, draw(colors) ?? '#DB3069');
                this.mellings.push(melling);
                Composite.add(this.engine.world, melling.getBodies());
                count++;
            }
        }, this.addMellingIntervalMs);
    }

    private checkEndCondition(): void {
        const mellingStates = group(this.mellings, m => m.state);

        if (!mellingStates.alive) {
            if (mellingStates.goal) {
                this.state = 'win'
            } else {
                this.state = 'lose'
            }
        }
    }
}