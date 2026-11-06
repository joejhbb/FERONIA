/**
 * Crops and frames an image onto a Canvas based on preview frame dimensions, pan offset, and zoom scale.
 * Eliminates letterbox empty space by scaling with cover fit, then applying user pan & zoom.
 * Returns a Promise resolving to a high-resolution base64 data URL matching what the user sees in the frame.
 */
export async function getCroppedImg(
  imageSrc: string,
  pan: { x: number; y: number } = { x: 0, y: 0 },
  imageZoom: number = 100,
  frameWidth: number = 400,
  frameHeight: number = 320,
  _padding: number = 0
): Promise<string> {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || 600;
        const naturalHeight = img.naturalHeight || 600;

        // Output Canvas dimensions (high resolution for crisp display)
        const targetWidth = Math.max(800, Math.round(frameWidth * 2));
        const targetHeight = Math.round(targetWidth * (frameHeight / frameWidth));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Base cover scale: image fills the frame completely without empty bars
        const scaleCover = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight);
        const baseWidth = naturalWidth * scaleCover;
        const baseHeight = naturalHeight * scaleCover;

        // User zoom factor
        const zoomFactor = Math.max(0.5, (imageZoom || 100) / 100);
        const renderedWidth = baseWidth * zoomFactor;
        const renderedHeight = baseHeight * zoomFactor;

        // Center of the frame + user pan offset
        const frameCenterX = frameWidth / 2 + (pan.x || 0);
        const frameCenterY = frameHeight / 2 + (pan.y || 0);

        // Top-left in frame coordinates
        const imgFrameX = frameCenterX - renderedWidth / 2;
        const imgFrameY = frameCenterY - renderedHeight / 2;

        // Map to canvas coordinate system
        const canvasScale = targetWidth / frameWidth;
        const drawX = imgFrameX * canvasScale;
        const drawY = imgFrameY * canvasScale;
        const drawW = renderedWidth * canvasScale;
        const drawH = renderedHeight * canvasScale;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas export error:', err);
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
