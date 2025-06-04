import { levels } from '../data/Levels';
import { GameManager } from './GameManager';

type AppState = "loading" | "running";
export class App {
    public state: AppState = 'loading';

    public document: Document;
    public canvas: HTMLCanvasElement;
    public video: HTMLVideoElement;
    public ctx: CanvasRenderingContext2D | null;
    public manager: GameManager;

    constructor(document: Document, canvasSelector: string) {
        this.document = document;

        this.canvas = this.document.querySelector<HTMLCanvasElement>(canvasSelector)!;
        this.ctx = this.canvas.getContext('2d');
        this.video = this.document.createElement('video');
        // this.canvas.insertAdjacentElement('beforebegin', this.video);

        const gameWidth = 720;
        const gameHeight = gameWidth * .75;

        this.manager = new GameManager(
            gameWidth,
            gameHeight,
            100,
            this.video,
            this.ctx,
            levels
        );
    }

    setState = (value: AppState): void => {
        console.log('setState', value);
        this.state = value;
        this.document.documentElement.classList.remove('loading', 'running');
        this.document.documentElement.classList.add(this.state);
    };

    async preload(): Promise<void> {
        this.setState('loading');
        await this.manager.poseManager.bodyPose.ready;
        console.log('model ready');
        await this.setup();
    };

    async setup(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: this.manager.width,
                height: this.manager.height
            }
        });
          
        this.video.srcObject = stream;
        this.video.play();

        this.canvas.width = this.video.width = this.manager.width;
        this.canvas.height = this.video.height = this.manager.height;

        this.manager.setup();

        this.setState('running');
    }
}