export interface Point {
    x: number;
    y: number;
  }
  
// Optional confidence property for keypoints
export interface Keypoint extends Point {
    confidence: number;
}

export class PoseManager {
    public bodyPose: ml5.BodyPose;
    
    private poses: ml5.PoseResult[] = [];
    private leftHandPose: Keypoint | undefined;
    private rightHandPose: Keypoint | undefined;

    constructor() {
        this.bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
    }

    start(video: HTMLVideoElement): void {
        this.bodyPose.detectStart(video, (results: ml5.PoseResult[]) => {
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
    }

    getLeftHand(): Keypoint | undefined {
        return this.leftHandPose;
    }

    getRightHand(): Keypoint | undefined {
        return this.rightHandPose;
    }
}