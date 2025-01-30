// Thanks https://github.com/devinekask/creative-code-3-f24/tree/main/ml5
const $canvas = document.querySelector('#canvas');
let video, ctx;
let allPoses = [];
let leftHandPose, rightHandPose;
let leftBridge = { x: 0, y: 0};
let rightBridge = { x: 0, y: 0};

const STATE_LOADING = "loading";
const STATE_RUNNING = "running";
const ALL_STATES = [STATE_LOADING, STATE_RUNNING];
let state = STATE_LOADING;

const setState = (value) => {
    console.log('setState', value);
    state = value;
    document.documentElement.classList.remove(...ALL_STATES);
    document.documentElement.classList.add(state);
};

const preload = async () => {
    setState(STATE_LOADING);
    requestAnimationFrame(draw);
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
    await bodyPose.ready;
    console.log('model ready');
    setup();
}

const setup = async () => {
    console.log('setup');

    ctx = $canvas.getContext('2d');

    // create a video stream - specify a fixed size
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 640,
            height: 480
        }
    });
    video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // set canvas & video size
    $canvas.width = video.width = 640;
    $canvas.height = video.height = 480;

    // start detecting poses
    bodyPose.detectStart(video, (results) => {
        // store the result in a global
        poses = results;

        if (poses.length > 0) {
            if (Object(poses[0]).hasOwnProperty('left_wrist')) {
                leftHandPose = poses[0].left_wrist;
            }

            if (Object(poses[0]).hasOwnProperty('right_wrist')) {
                rightHandPose = poses[0].right_wrist;
            }
        }
    });

    // start the app
    setState(STATE_RUNNING);
}

const draw = () => {
    if (state === STATE_RUNNING) {
        ctx.save();
        ctx.translate(canvas.width, 0); // Move the origin to the right edge
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(video, 0, 0, $canvas.width, $canvas.height);
        ctx.restore();


        if (leftHandPose && leftHandPose.confidence > 0.1) {
            leftBridge.x = lerp(leftBridge.x, leftHandPose.x, 0.3);
            leftBridge.y = lerp(leftBridge.y, leftHandPose.y, 0.3);
            
        }

        if (rightHandPose && rightHandPose.confidence > 0.1) {
            rightBridge.x = lerp(rightBridge.x, rightHandPose.x, 0.3);
            rightBridge.y = lerp(rightBridge.y, rightHandPose.y, 0.3);
        }

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(leftBridge.x, leftBridge.y, 10, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(rightBridge.x,rightBridge.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

preload();