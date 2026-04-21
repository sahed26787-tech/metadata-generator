/**
 * Utility for processing video files and extracting thumbnail frames
 * This is necessary because Gemini API requires an image to analyze content
 */

/**
 * Extracts a thumbnail frame from a video file
 * @param videoFile - The video file to process
 * @param frameTime - The time in seconds to extract the frame (default: 1)
 * @returns A Promise that resolves to a PNG File object of the extracted frame
 */
export async function extractVideoThumbnail(
  videoFile: File,
  frameTime: number = 1
): Promise<File> {
  // No initial log message
  
  try {
    // First attempt: HTML5 video and canvas method
    return await extractThumbnailUsingVideoElement(videoFile, frameTime);
  } catch (error) {
    // Minimal logging for fallback
    console.debug('Using fallback for video thumbnail');
    try {
      // Second attempt: Alternative blob approach
      return await extractThumbnailUsingBlob(videoFile);
    } catch (secondError) {
      console.error('Failed to process video');
      throw new Error('Failed to extract video thumbnail: ' + 
        (secondError instanceof Error ? secondError.message : 'Unknown error'));
    }
  }
}

/**
 * Extract thumbnail using HTML5 video element
 */
async function extractThumbnailUsingVideoElement(
  videoFile: File, 
  frameTime: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      // Create video element to load the video
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      // Set up event handlers
      video.onloadedmetadata = () => {
        // Seek to the specified time
        const seekTime = Math.min(frameTime, video.duration / 2);
        video.currentTime = seekTime;
      };
      
      video.onseeked = () => {
        // Create a canvas to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;  // Default to 640 if width is 0
        canvas.height = video.videoHeight || 360; // Default to 360 if height is 0
        
        // Draw the current frame to the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const error = 'Could not get canvas context';
          reject(new Error(error));
          return;
        }
        
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert the canvas to a Blob
          canvas.toBlob((blob) => {
            if (!blob) {
              const error = 'Failed to extract video thumbnail - no blob created';
              reject(new Error(error));
              return;
            }
            
            // Create a new File from the Blob
            const thumbnailFile = new File([blob], `${videoFile.name.replace(/\.[^/.]+$/, '')}_thumbnail.png`, {
              type: 'image/png',
              lastModified: Date.now(),
            });
            
            resolve(thumbnailFile);
          }, 'image/png');
        } catch (drawError) {
          reject(new Error(`Error drawing video frame: ${drawError.message}`));
        }
      };
      
      video.onerror = (e) => {
        const errorMessage = `Failed to load video: ${video.error?.message || 'Unknown error'}`;
        reject(new Error(errorMessage));
      };
      
      // Ensure we catch cases where the video doesn't load
      setTimeout(() => {
        if (video.readyState === 0) {
          const timeoutError = 'Video loading timed out after 10 seconds';
          reject(new Error(timeoutError));
        }
      }, 10000);
      
      // Set the source of the video
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;
      
      // Add cleanup for the object URL
      video.onloadeddata = () => {
        // No log needed
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Alternative thumbnail extraction method using direct blob manipulation
 * This is a fallback in case the HTML5 video element approach fails
 */
async function extractThumbnailUsingBlob(videoFile: File): Promise<File> {
  // Create a placeholder thumbnail with default dimensions
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 640;
  const height = 360;
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw a gray background with a video icon
  canvas.width = width;
  canvas.height = height;
  
  // Fill with dark gray
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, width, height);
  
  // Draw "Video" text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Video: ' + videoFile.name, width/2, height/2);
  
  // Draw film icon-like shapes
  ctx.fillStyle = '#555555';
  for (let i = 0; i < 10; i++) {
    // Left film strip
    ctx.fillRect(50, 50 + i * 30, 30, 20);
    // Right film strip
    ctx.fillRect(width - 80, 50 + i * 30, 30, 20);
  }
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create fallback thumbnail'));
        return;
      }
      
      const thumbnailFile = new File([blob], `${videoFile.name.replace(/\.[^/.]+$/, '')}_thumbnail.png`, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      
      resolve(thumbnailFile);
    }, 'image/png');
  });
}

/**
 * Extracts multiple frames from a video and combines them into a single grid image
 * This gives Gemini temporal context of the video without sending a large file
 * @param videoFile - The video file to process
 * @param frameCount - How many frames to extract (default: 5)
 * @returns A Promise that resolves to a PNG File object of the grid
 */
export async function extractVideoFrameGrid(
  videoFile: File,
  frameCount: number = 5
): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration;
          const frames: HTMLCanvasElement[] = [];
          
          // Calculate frame times (spaced out evenly)
          // Avoid the very beginning (0s) and very end (duration)
          const interval = duration / (frameCount + 1);
          const frameTimes = Array.from({ length: frameCount }, (_, i) => (i + 1) * interval);
          
          // Extract each frame
          for (const time of frameTimes) {
            const frameCanvas = await captureFrameAtTime(video, time);
            frames.push(frameCanvas);
          }
          
          // Combine frames into a grid (e.g., if 5 frames, 1x5 or 2x3)
          const gridCanvas = createFrameGrid(frames);
          
          // Convert to blob
          gridCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create video frame grid blob'));
              return;
            }
            
            const gridFile = new File([blob], `${videoFile.name.replace(/\.[^/.]+$/, '')}_grid.png`, {
              type: 'image/png',
              lastModified: Date.now(),
            });
            
            resolve(gridFile);
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video for grid extraction'));
      
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;
      
      // Cleanup
      setTimeout(() => {
        if (video.readyState === 0) {
          reject(new Error('Video loading timed out for grid extraction'));
        }
      }, 15000);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Helper to capture a frame at a specific time
 */
async function captureFrameAtTime(video: HTMLVideoElement, time: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        video.removeEventListener('seeked', onSeeked);
        resolve(canvas);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

/**
 * Helper to create a grid from multiple frame canvases
 */
function createFrameGrid(frames: HTMLCanvasElement[]): HTMLCanvasElement {
  const frameWidth = frames[0].width;
  const frameHeight = frames[0].height;
  const count = frames.length;
  
  // For 5 frames, we can do 1 row of 5, or 2 rows (3 and 2)
  // Let's do a vertical stack or horizontal strip for simplicity, 
  // or a more compact grid. Let's do a 2-column grid for better visibility.
  const cols = Math.min(count, 2);
  const rows = Math.ceil(count / cols);
  
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = frameWidth * cols;
  gridCanvas.height = frameHeight * rows;
  
  const ctx = gridCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get grid canvas context');
  
  // Fill background with black to avoid gaps
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
  
  frames.forEach((frame, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    ctx.drawImage(frame, col * frameWidth, row * frameHeight);
  });
  
  return gridCanvas;
}

/**
 * Checks if a file is a video
 */
export function isVideoFile(file: File): boolean {
  const isVideoType = file.type.startsWith('video/');
  const hasVideoExtension = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'].some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  // No logging of file check
  
  return isVideoType || hasVideoExtension;
} 