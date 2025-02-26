// Type definitions for ml5.js
declare namespace ml5 {
    interface BodyPose {
      ready: Promise<void>;
      detectStart: (
        input: HTMLVideoElement,
        callback: (results: Array<PoseResult>) => void
      ) => void;
    }
  
    interface Keypoint {
      x: number;
      y: number;
      confidence: number;
    }
  
    interface PoseResult {
      // MoveNet keypoints
      nose?: Keypoint;
      left_eye?: Keypoint;
      right_eye?: Keypoint;
      left_ear?: Keypoint;
      right_ear?: Keypoint;
      left_shoulder?: Keypoint;
      right_shoulder?: Keypoint;
      left_elbow?: Keypoint;
      right_elbow?: Keypoint;
      left_wrist?: Keypoint;
      right_wrist?: Keypoint;
      left_hip?: Keypoint;
      right_hip?: Keypoint;
      left_knee?: Keypoint;
      right_knee?: Keypoint;
      left_ankle?: Keypoint;
      right_ankle?: Keypoint;
    }
  
    interface BodyPoseOptions {
      flipped?: boolean;
      detectionMode?: string;
      modelComplexity?: number;
      minDetectionConfidence?: number;
      minTrackingConfidence?: number;
    }
  
    function bodyPose(
      modelNameOrPath: string,
      options?: BodyPoseOptions
    ): BodyPose;
  }
  
  // Declare ml5 as a global variable
  declare const ml5: typeof ml5;