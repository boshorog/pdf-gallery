/**
 * Video Thumbnail Generator
 * Generates thumbnail from video's first frame using canvas
 */

export interface VideoThumbnailResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export class VideoThumbnailGenerator {
  /**
   * Generate a thumbnail from the first frame of a video
   * @param videoUrl - URL to the video file
   * @param seekTime - Time in seconds to capture (default: 0.1 for first frame)
   * @returns Promise with the thumbnail data URL
   */
  static async generateThumbnail(videoUrl: string, seekTime: number = 0.1): Promise<VideoThumbnailResult> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.muted = true;
      
      let timeoutId: number | undefined;
      let resolved = false;
      
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('error', handleError);
        // Cleanup video element
        video.src = '';
        video.load();
      };
      
      const handleError = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve({
          success: false,
          error: 'Failed to load video'
        });
      };
      
      const handleSeeked = () => {
        if (resolved) return;
        resolved = true;
        
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            resolve({
              success: false,
              error: 'Could not get canvas context'
            });
            return;
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          cleanup();
          resolve({
            success: true,
            dataUrl
          });
        } catch (error) {
          cleanup();
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      };
      
      const handleLoadedData = () => {
        // Seek to the specified time to trigger 'seeked' event
        video.currentTime = Math.min(seekTime, video.duration || seekTime);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('error', handleError);
      
      // Timeout after 10 seconds
      timeoutId = window.setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve({
          success: false,
          error: 'Video thumbnail generation timed out'
        });
      }, 10000);
      
      video.src = videoUrl;
      video.load();
    });
  }
  
  /**
   * Check if a file type is a supported video format
   */
  static isVideoType(fileType: string): boolean {
    const videoTypes = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', 'video', 'ogg'];
    const normalized = fileType.toLowerCase().replace('video/', '');
    return videoTypes.includes(normalized);
  }
}
