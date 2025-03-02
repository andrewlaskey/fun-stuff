
import { getRandomInt } from '../../utils/getRandomInt';
import { lerp } from '../../utils/lerp';
import { draw, group } from 'radash';
import { Engine, Bodies, Composite, Body, Render, Common, Vector, Events } from 'matter-js';

import { COLORS, CATEGORIES } from './constants';
import { Melling } from './Melling';
import { Level } from './Level';

type AppState = "loading" | "running";

// Define point interface
interface Point {
  x: number;
  y: number;
}

// Optional confidence property for keypoints
interface Keypoint extends Point {
  confidence: number;
}

class App {
    public state: AppState = 'loading';
    public bodyPose: ml5.BodyPose;
    public document: Document;
    public canvas: HTMLCanvasElement;
    public video: HTMLVideoElement;
    public ctx: CanvasRenderingContext2D | null;
    public engine: Engine;

    private poses: ml5.PoseResult[] = [];
    private leftHandPose: Keypoint | undefined;
    private rightHandPose: Keypoint | undefined;
    private leftBridge: Body;
    private rightBridge: Body;
    private platformWidth = 200;
    private platformVerticalOffset = 60;
    private balls: Body[] = [];

    private lastFrameTime: number = performance.now();
    // private leftHandHistory: Array<{x: number, y: number}> = Array(5).fill({x: 0, y: 0});
    // private rightHandHistory: Array<{x: number, y: number}> = Array(5).fill({x: 0, y: 0});
    // private maxMovement: number = 30; // maximum allowed movement per frame in pixels
    
    private george: Melling;

    private mellings: Melling[] = [];
    private totalMellings = 100;

    private gameWidth = 640;
    private gameHeight = 480;

    private level: Level;

    private gameState: 'playing' | 'win' | 'lose' = 'playing';

    constructor(document: Document, canvasSelector: string) {
        this.document = document;
        this.bodyPose = ml5.bodyPose("MoveNet", { flipped: true });

        this.canvas = this.document.querySelector<HTMLCanvasElement>(canvasSelector)!;
        this.ctx = this.canvas.getContext('2d');
        this.video = this.document.createElement('video');
        // this.canvas.insertAdjacentElement('beforebegin', this.video);

        this.engine = Engine.create();
        this.leftBridge = Bodies.rectangle(0, 0, this.platformWidth, 12, { isStatic: true, restitution: 0.8 });
        this.rightBridge = Bodies.rectangle(0, 0, this.platformWidth, 12, { isStatic: true, restitution: 0.8 });

        this.george = new Melling(320, 100);

        // const colors = ['#F7F7FF', '#3F826D', '#3772FF', '#A9F0D1', '#EAFDCF', '#B1F8F2',
        //     '#7EA3CC', '#F7EDF0', '#7FD1B9', '#3C91E6', '#F7CACD', '#9FC2CC', '#A9CEF4',
        //     '#F2F5EA', '#9AD2CB', '#F3F3F3', '#437C90', '#E5A4CB', '#20A39E', '#009FFD',
        //     '#3E92CC', '#899E8B', '#BEEF9E', '#DB3069'
        // ];
        // for (let index = 0; index < this.totalMellings; index++) {
        //     const x = Common.random(this.startLocation.x, this.startLocation.x + 100);
        //     this.mellings.push(new Melling(x, this.startLocation.y, draw(colors) ?? '#DB3069'));
        // }

        this.level = new Level(Vector.create(40, 100), Vector.create(500, 360));

        this.setupPhysics();
    }

    setState = (value: AppState): void => {
        console.log('setState', value);
        this.state = value;
        this.document.documentElement.classList.remove('loading', 'running');
        this.document.documentElement.classList.add(this.state);
    };

    async preload(): Promise<void> {
        this.setState('loading');
        requestAnimationFrame(() => {
            this.loop()
        });
        await this.bodyPose.ready;
        console.log('model ready');
        this.setup();
    };

    async setup(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: this.gameWidth,
                height: this.gameHeight
            }
        });
          
        this.video.srcObject = stream;
        this.video.play();

        this.canvas.width = this.video.width = this.gameWidth;
        this.canvas.height = this.video.height = this.gameHeight;

        // Start detecting poses
        this.bodyPose.detectStart(this.video, (results: ml5.PoseResult[]) => {
            // Store the result in a global
            this.poses = results;

            if (this.poses.length > 0) {
                if (this.poses[0].left_wrist) {
                    this.leftHandPose = this.poses[0].left_wrist;
                }

                if (this.poses[0].right_wrist) {
                    this.rightHandPose = this.poses[0].right_wrist;
                }
            }
        });

        this.setState('running');

        setTimeout(() => {
            this.addMellings();
        }, 3 * 1000);
    }

    setupPhysics(): void {
        const numDemoBalls = 10;
        this.engine.gravity.scale = 0.0005;

        for (let index = 0; index < numDemoBalls; index++) {
            const x = getRandomInt(0, this.gameWidth);
            const y = getRandomInt(0, this.gameHeight);
            const radius = getRandomInt(5, 40);
            
            this.balls.push(Bodies.circle(x, y, radius, {
                restitution: 0.8
            }));
        }
        const topWall = Bodies.rectangle(320, -30, 1000, 60, { isStatic: true, restitution: 0.8 });
        const bottomWall = Bodies.rectangle(320, this.gameHeight + 30, 1000, 60, {
            isStatic: true,
            restitution: 1,
            collisionFilter: {
                category: CATEGORIES.LAVA,
                mask: CATEGORIES.DEFAULT | CATEGORIES.MELLING
            }
        });
        const leftWall = Bodies.rectangle(-30, 240, 60, 1000, {
            isStatic: true,
            restitution: 0.8,
            collisionFilter: {
                category: CATEGORIES.WALL
            }
        });
        const rightWall = Bodies.rectangle(670, 240, 60, 1000, {
            isStatic: true,
            restitution: 0.8,
            collisionFilter: {
                category: CATEGORIES.WALL
            }
        });

        Composite.add(this.engine.world, [
            topWall,
            bottomWall,
            leftWall,
            rightWall,
            this.leftBridge,
            this.rightBridge,
            // ...this.balls,
            ...this.george.getBodies()
        ]);
        // const render = Render.create({
        //     element: this.document.body,
        //     engine: this.engine,
        //     options: {
        //         width: this.gameWidth,
        //         height: this.gameHeight
        //     }
        // });

        Events.on(this.engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                
                // Check if one body is a Melling and the other is lava
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                
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
        });

        this.level.setupPhysics(this.engine, this.mellings);
        // Render.run(render);
    };

    addMellings(): void {
        let count = 0;

        setInterval(() => {
            if (count < this.totalMellings) {
                const colors = ['#F7F7FF', '#3F826D', '#3772FF', '#A9F0D1', '#EAFDCF', '#B1F8F2',
                    '#7EA3CC', '#F7EDF0', '#7FD1B9', '#3C91E6', '#F7CACD', '#9FC2CC', '#A9CEF4',
                    '#F2F5EA', '#9AD2CB', '#F3F3F3', '#437C90', '#E5A4CB', '#20A39E', '#009FFD',
                    '#3E92CC', '#899E8B', '#BEEF9E', '#DB3069'
                ];
                const x = Common.random(this.level.startLocation.x, this.level.startLocation.x + this.level.startWidth);
                const melling = new Melling(x, this.level.startLocation.y, draw(colors) ?? '#DB3069');
                this.mellings.push(melling);
                Composite.add(this.engine.world, melling.getBodies());
                count++;
            }
        }, 250);
    }

    loop(): void {
        const smooth = 0.1;

        if (this.state === 'running') {
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastFrameTime) / 1000; // in seconds
            this.lastFrameTime = currentTime;

            // Adjust smooth factor based on deltaTime
            const smoothFactor = Math.min(1.0, smooth * deltaTime * 60);
            
            if (this.leftHandPose && this.leftHandPose.confidence > 0.1) {
                Body.setPosition(this.leftBridge, {
                    x: lerp(this.leftBridge.position.x, this.leftHandPose.x, smoothFactor),
                    y: lerp(this.leftBridge.position.y, this.leftHandPose.y - this.platformVerticalOffset, smoothFactor)
                });
            }

            if (this.rightHandPose && this.rightHandPose.confidence > 0.1) {
                Body.setPosition(this.rightBridge, {
                    x: lerp(this.rightBridge.position.x, this.rightHandPose.x, smoothFactor),
                    y: lerp(this.rightBridge.position.y, this.rightHandPose.y - this.platformVerticalOffset, smoothFactor)
                });
            }

            this.checkEndCondition();
            
            this.draw();

            Engine.update(this.engine, 1000 / 60);
        }

        requestAnimationFrame(() => {
            this.loop()
        });
    };

    draw(): void {
        if (this.ctx) {
            this.ctx.save();
            this.ctx.filter = 'grayscale(100%) sepia(40%) blur(3px)';
            this.ctx.translate(this.canvas.width, 0); // Move the origin to the right edge
            this.ctx.scale(-1, 1); // Flip horizontally
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            // this.ctx.fillStyle = COLORS['Raisin black'];
            // this.ctx.beginPath();
            // this.ctx.rect(0, this.gameHeight - 30, this.gameWidth, 60);
            // this.ctx.fill();

            this.level.draw(this.ctx);

            this.ctx.fillStyle = COLORS['Hunyadi yellow'];
            this.ctx.beginPath();
            this.ctx.rect(this.leftBridge.position.x - (this.platformWidth / 2), this.leftBridge.position.y, this.platformWidth, 5);
            this.ctx.fill();

            this.ctx.fillStyle = COLORS['Flame'];
            this.ctx.beginPath();
            this.ctx.rect(this.rightBridge.position.x - (this.platformWidth / 2), this.rightBridge.position.y, this.platformWidth, 5);
            this.ctx.fill();

            // for(const ball of this.balls) {
            // this.ctx.fillStyle = COLORS['English Violet'];
            // this.ctx.beginPath();
            // this.ctx.arc(ball.position.x, ball.position.y, ball.circleRadius ?? 10, 0, 2 * Math.PI);
            // this.ctx.fill();
            // };

            this.george.update(this.engine);
            this.george.draw(this.ctx);

            for (const melling of this.mellings) {
                melling.update(this.engine);
                melling.draw(this.ctx);
            }

            this.ctx.fillStyle = COLORS['Raisin black'];
            this.ctx.font = 'bold 60px Arial';
            this.ctx.fillText(`${this.mellings.filter(melling => melling.state !== 'dead').length}`, 20, 60);

            this.ctx.fillStyle = COLORS['Flame'];
            this.ctx.font = 'bold 60px Arial';
            this.ctx.fillText(`${this.mellings.filter(melling => melling.state === 'goal').length}`, this.gameWidth - 100, 60);
        }
    }

    checkEndCondition(): void {
        const mellingStates = group(this.mellings, m => m.state);

        if (!mellingStates.alive) {
            if (mellingStates.goal) {
                this.gameState = 'win'
            } else {
                this.gameState = 'lose'
            }
        }
    }
}

const app = new App(document, '#canvas');

app.preload().then(() => {
    console.log('preload complete');
}).catch((e) => {
    console.error('failed to start app', e);
});