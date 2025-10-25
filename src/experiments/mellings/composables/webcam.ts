import { ref, onUnmounted } from 'vue';

export function useWebcam() {
  const video = ref<HTMLVideoElement | null>(null);
  let mediaStream: MediaStream | null = null;

  const startWebcam = async (constraints: MediaStreamConstraints = { video: true }) => {
    if (!video.value) {
      throw new Error('Video element not available');
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.value.srcObject = mediaStream;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!video.value) {
          reject(new Error('Video element not available'));
          return;
        }

        const onLoadedData = () => {
          video.value?.removeEventListener('loadeddata', onLoadedData);
          video.value?.removeEventListener('error', onError);
          resolve();
        };

        const onError = (e: Event) => {
          video.value?.removeEventListener('loadeddata', onLoadedData);
          video.value?.removeEventListener('error', onError);
          reject(e);
        };

        video.value.addEventListener('loadeddata', onLoadedData);
        video.value.addEventListener('error', onError);
      });

      await video.value.play();
      return video.value;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      throw error;
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (video.value) {
      video.value.srcObject = null;
    }
  };

  onUnmounted(() => {
    stopWebcam();
  });

  return {
    video,
    startWebcam,
    stopWebcam,
    isActive: () => !!mediaStream,
  };
}