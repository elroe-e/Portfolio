/**
 * Shrinks a photo in the browser before it is uploaded: at most 2400px on the
 * long edge, saved as JPEG. Camera files of 10–20 MB become roughly 0.5–1.5 MB,
 * which keeps uploads fast and the repository small. The site then makes its
 * own smaller copies for each screen size.
 */

const LONG_EDGE = 2400;
const MAX_BYTES = 3.5 * 1024 * 1024;

export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  }).catch(() => {
    throw new Error(
      `"${file.name}" isn't an image this browser can open. Try a JPEG or PNG.`,
    );
  });

  const scale = Math.min(1, LONG_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("This browser can't prepare images for upload.");
  context.imageSmoothingQuality = "high";
  // Transparent PNGs get a white background instead of black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (let quality = 0.86; quality >= 0.5; quality -= 0.08) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) break;
    if (blob.size <= MAX_BYTES) return blob;
  }
  throw new Error(
    `"${file.name}" is too detailed to upload. Try exporting a smaller copy.`,
  );
}
