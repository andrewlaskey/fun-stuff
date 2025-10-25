import { ref, onUnmounted, computed } from 'vue';

export interface Point {
  x: number;
  y: number;
}

export interface Keypoint extends Point {
  confidence: number;
}

export interface HandTrackingOptions {
  flipped?: boolean;
  modelType?: 'MoveNet' | 'BlazePose';
  confidenceThreshold?: number;
}

export interface HandPositions {
  leftHand: Keypoint | null;
  rightHand: Keypoint | null;
  bothHands: {
    left: Keypoint | null;
    right: Keypoint | null;
  };
}

export function useHandTracking(options: HandTrackingOptions = {}) {
  // Reactive state
  const isInitialized = ref(false);
  const isTracking = ref(false);
  const error = ref<string | null>(null);
  const poses = ref<ml5.PoseResult[]>([]);
  
  // Hand positions
  const leftHandPose = ref<Keypoint | null>(null);
  const rightHandPose = ref<Keypoint | null>(null);
  
  // Internal state
  let bodyPose: ml5.BodyPose | null = null;
  let currentVideo: HTMLVideoElement | null = null;
  
  // Configuration
  const config = {
    flipped: options.flipped ?? true,
    modelType: options.modelType ?? 'MoveNet',
    confidenceThreshold: options.confidenceThreshold ?? 0.25,
  };

  // Computed properties
  const handPositions = computed((): HandPositions => ({
    leftHand: leftHandPose.value,
    rightHand: rightHandPose.value,
    bothHands: {
      left: leftHandPose.value,
      right: rightHandPose.value,
    },
  }));

  const hasValidHands = computed(() => {
    const left = leftHandPose.value;
    const right = rightHandPose.value;
    
    return {
      left: left !== null && left.confidence >= config.confidenceThreshold,
      right: right !== null && right.confidence >= config.confidenceThreshold,
      either: (left !== null && left.confidence >= config.confidenceThreshold) || 
              (right !== null && right.confidence >= config.confidenceThreshold),
      both: (left !== null && left.confidence >= config.confidenceThreshold) && 
            (right !== null && right.confidence >= config.confidenceThreshold),
    };
  });

  // Initialize the pose detection model
  const initialize = async (): Promise<void> => {
    try {
      error.value = null;
      
      // Check if ml5 is available
      if (typeof ml5 === 'undefined') {
        throw new Error('ml5.js is not loaded. Please include ml5.js in your project.');
      }

      // Try different initialization approach for better compatibility
      bodyPose = await new Promise((resolve, reject) => {
        let resolved = false;
        
        const model = ml5.bodyPose(config.modelType, { 
          flipped: config.flipped,
        }, () => {
          // Model is ready
          if (!resolved) {
            resolved = true;
            resolve(model);
          }
        });
        
        // Alternative: listen for model ready event if callback doesn't work
        if (model && typeof model.ready !== 'undefined') {
          model.ready.then(() => {
            if (!resolved) {
              resolved = true;
              resolve(model);
            }
          }).catch(reject);
        }
        
        // Set a timeout in case the ready callback never fires
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // Try to use the model anyway, sometimes it works without the callback
            resolve(model);
          }
        }, 15000); // 15 second timeout
      });
      
      isInitialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize hand tracking';
      console.error('Hand tracking initialization error:', err);
      throw err;
    }
  };

  // Start tracking on a video element
  const startTracking = async (video: HTMLVideoElement): Promise<void> => {
    try {
      // Always initialize first if not already done
      if (!isInitialized.value || !bodyPose) {
        await initialize();
      }

      // Double check that we have a valid model
      if (!bodyPose) {
        throw new Error('Body pose model failed to initialize');
      }

      // Ensure video is ready and actually playing
      if (video.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          const onLoadedData = () => {
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('error', onError);
            resolve();
          };

          const onError = (e: Event) => {
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('error', onError);
            reject(new Error('Video failed to load'));
          };

          video.addEventListener('loadeddata', onLoadedData);
          video.addEventListener('error', onError);
        });
      }

      // Wait a bit more to ensure video is actually playing with frames
      if (video.paused) {
        await video.play();
      }

      // Give the video a moment to start producing frames
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify video dimensions are reasonable
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error(`Video has invalid dimensions: ${video.videoWidth}x${video.videoHeight}`);
      }

      currentVideo = video;
      isTracking.value = true;
      error.value = null;

      bodyPose.detectStart(video, (results: ml5.PoseResult[]) => {
        poses.value = results;
        updateHandPositions(results);
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start tracking';
      isTracking.value = false;
      currentVideo = null;
      console.error('Hand tracking start error:', err);
      throw err;
    }
  };

  // Stop tracking
  const stopTracking = (): void => {
    if (bodyPose && isTracking.value) {
      bodyPose.detectStop();
      isTracking.value = false;
      currentVideo = null;
      
      // Clear hand positions
      leftHandPose.value = null;
      rightHandPose.value = null;
      poses.value = [];
    }
  };

  // Update hand positions from pose results
  const updateHandPositions = (results: ml5.PoseResult[]): void => {
    if (results.length > 0) {
      const pose = results[0];
      
      // Update left hand
      if (pose.left_wrist && pose.left_wrist.confidence >= config.confidenceThreshold) {
        leftHandPose.value = {
          x: pose.left_wrist.x,
          y: pose.left_wrist.y,
          confidence: pose.left_wrist.confidence,
        };
      } else {
        leftHandPose.value = null;
      }

      // Update right hand
      if (pose.right_wrist && pose.right_wrist.confidence >= config.confidenceThreshold) {
        rightHandPose.value = {
          x: pose.right_wrist.x,
          y: pose.right_wrist.y,
          confidence: pose.right_wrist.confidence,
        };
      } else {
        rightHandPose.value = null;
      }
    } else {
      leftHandPose.value = null;
      rightHandPose.value = null;
    }
  };

  // Utility functions
  const getDistance = (point1: Point, point2: Point): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getHandsDistance = (): number | null => {
    if (leftHandPose.value && rightHandPose.value) {
      return getDistance(leftHandPose.value, rightHandPose.value);
    }
    return null;
  };

  const isHandInRegion = (
    hand: 'left' | 'right', 
    region: { x: number; y: number; width: number; height: number }
  ): boolean => {
    const handPos = hand === 'left' ? leftHandPose.value : rightHandPose.value;
    
    if (!handPos) return false;
    
    return (
      handPos.x >= region.x &&
      handPos.x <= region.x + region.width &&
      handPos.y >= region.y &&
      handPos.y <= region.y + region.height
    );
  };

  // Check if model is ready for detection
  const isModelReady = (): boolean => {
    return isInitialized.value && bodyPose !== null;
  };

  // Get model status for debugging
  const getModelStatus = () => {
    return {
      isInitialized: isInitialized.value,
      hasBodyPose: bodyPose !== null,
      isTracking: isTracking.value,
      currentVideo: currentVideo !== null,
      error: error.value,
    };
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopTracking();
  });

  return {
    // State
    isInitialized,
    isTracking,
    error,
    poses,
    
    // Hand positions
    leftHand: leftHandPose,
    rightHand: rightHandPose,
    handPositions,
    hasValidHands,
    
    // Methods
    initialize,
    startTracking,
    stopTracking,
    isModelReady,
    getModelStatus,
    
    // Utilities
    getDistance,
    getHandsDistance,
    isHandInRegion,
    
    // Configuration
    config,
  };
}