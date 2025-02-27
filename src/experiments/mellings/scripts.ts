
import { getRandomInt } from '../../utils/getRandomInt';
import { lerp } from '../../utils/lerp';
import { Engine, Bodies, Composite, Body, Render } from 'matter-js';

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
    private balls: Body[] = []

    constructor(document: Document, canvasSelector: string) {
        this.document = document;
        this.bodyPose = ml5.bodyPose("MoveNet", { flipped: true });

        this.canvas = this.document.querySelector<HTMLCanvasElement>(canvasSelector)!;
        this.ctx = this.canvas.getContext('2d');
        console.log(this.ctx);
        this.video = this.document.createElement('video');
        // this.canvas.insertAdjacentElement('beforebegin', this.video);

        this.engine = Engine.create();
        this.leftBridge = Bodies.circle(0, 0, 10, { isStatic: true });
        this.rightBridge = Bodies.circle(0, 0, 10, { isStatic: true });
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
            this.draw()
        });
        await this.bodyPose.ready;
        console.log('model ready');
        this.setup();
    };

    async setup(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480
            }
        });
          
        this.video.srcObject = stream;
        this.video.play();

        this.canvas.width = this.video.width = 640;
        this.canvas.height = this.video.height = 480;

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
    }

    setupPhysics(): void {
        this.engine.gravity.scale = 0;

        for (let index = 0; index < 50; index++) {
            const x = getRandomInt(0, 640);
            const y = getRandomInt(0, 480);
            const radius = getRandomInt(5, 40);
            this.balls.push(Bodies.circle(x, y, radius));
        }
        const topWall = Bodies.rectangle(320, 0, 1000, 60, { isStatic: true });
        const bottomWall = Bodies.rectangle(320, 480, 1000, 60, { isStatic: true });
        const leftWall = Bodies.rectangle(0, 240, 60, 1000, { isStatic: true });
        const rightWall = Bodies.rectangle(640, 240, 60, 1000, { isStatic: true });
        Composite.add(this.engine.world, [
            topWall,
            bottomWall,
            leftWall,
            rightWall,
            this.leftBridge,
            this.rightBridge,
            ...this.balls
        ]);
        const render = Render.create({
            element: this.document.body,
            engine: this.engine,
            options: {
                width: 640,
                height: 480
            }
        });
        Render.run(render);
    }

    draw(): void {
        if (this.state === 'running' && this.ctx) {
          this.ctx.save();
          this.ctx.translate(this.canvas.width, 0); // Move the origin to the right edge
          this.ctx.scale(-1, 1); // Flip horizontally
          this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
          this.ctx.restore();
      
          if (this.leftHandPose && this.leftHandPose.confidence > 0.1) {
            Body.setPosition(this.leftBridge, {
                x: lerp(this.leftBridge.position.x, this.leftHandPose.x, 0.3),
                y: lerp(this.leftBridge.position.y, this.leftHandPose.y, 0.3)
            });
          }
      
          if (this.rightHandPose && this.rightHandPose.confidence > 0.1) {
            Body.setPosition(this.rightBridge, {
                x: lerp(this.rightBridge.position.x, this.rightHandPose.x, 0.3),
                y: lerp(this.rightBridge.position.y, this.rightHandPose.y, 0.3)
            });
          }
      
          this.ctx.fillStyle = 'red';
          this.ctx.beginPath();
          this.ctx.arc(this.leftBridge.position.x, this.leftBridge.position.y, 10, 0, 2 * Math.PI);
          this.ctx.fill();
      
          this.ctx.fillStyle = 'green';
          this.ctx.beginPath();
          this.ctx.arc(this.rightBridge.position.x, this.rightBridge.position.y, 10, 0, 2 * Math.PI);
          this.ctx.fill();

          for(const ball of this.balls) {
            this.ctx.fillStyle = 'purple';
            this.ctx.beginPath();
            this.ctx.arc(ball.position.x, ball.position.y, ball.circleRadius ?? 10, 0, 2 * Math.PI);
            this.ctx.fill();
          };

          Engine.update(this.engine, 1000 / 60);
        }
      
        requestAnimationFrame(() => {
            this.draw()
        });
      };
}

const app = new App(document, '#canvas');

app.preload().then(() => {
    console.log('preload complete');
}).catch((e) => {
    console.error('failed to start app', e);
});