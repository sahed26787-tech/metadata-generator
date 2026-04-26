type ProcessMessage = {
  type: 'PROCESS';
  id: string;
  file: File;
  targetWidth?: number;
  quality?: number;
  previewMaxDimension?: number;
  previewQuality?: number;
};

type WorkerResponse =
  | {
      type: 'DONE';
      id: string;
      reducedBlob: Blob;
      reducedMimeType: string;
      previewBlob: Blob;
      width: number;
      height: number;
    }
  | {
      type: 'ERROR';
      id: string;
      error: string;
    };

const getScaledSize = (width: number, height: number, maxDimension: number) => {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const createResizedBlob = async (
  bitmap: ImageBitmap,
  width: number,
  height: number,
  quality: number
): Promise<Blob> => {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context in worker');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.convertToBlob({
    type: 'image/jpeg',
    quality,
  });
};

self.onmessage = async (event: MessageEvent<ProcessMessage>) => {
  const data = event.data;
  if (!data || data.type !== 'PROCESS') return;

  const { id, file } = data;
  const targetWidth = data.targetWidth ?? 1024;
  const quality = data.quality ?? 0.8;
  const previewMaxDimension = data.previewMaxDimension ?? 320;
  const previewQuality = data.previewQuality ?? 0.7;

  try {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const passthrough: WorkerResponse = {
        type: 'DONE',
        id,
        reducedBlob: file,
        reducedMimeType: file.type || 'application/octet-stream',
        previewBlob: file,
        width: 0,
        height: 0,
      };
      self.postMessage(passthrough);
      return;
    }

    const bitmap = await createImageBitmap(file);
    const reducedSize = getScaledSize(
      bitmap.width,
      bitmap.height,
      Math.max(512, targetWidth)
    );
    const previewSize = getScaledSize(bitmap.width, bitmap.height, previewMaxDimension);

    const [reducedBlob, previewBlob] = await Promise.all([
      createResizedBlob(bitmap, reducedSize.width, reducedSize.height, quality),
      createResizedBlob(bitmap, previewSize.width, previewSize.height, previewQuality),
    ]);

    bitmap.close();

    const response: WorkerResponse = {
      type: 'DONE',
      id,
      reducedBlob,
      reducedMimeType: reducedBlob.type || 'image/jpeg',
      previewBlob,
      width: reducedSize.width,
      height: reducedSize.height,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'ERROR',
      id,
      error: error instanceof Error ? error.message : 'Unknown worker error',
    };
    self.postMessage(response);
  }
};
