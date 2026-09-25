const MAX_DIMENSION = 1600;
// Matches the server's limit.
const MAX_BYTES = 2 * 1024 * 1024;

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const encode = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

// Downscales and re-encodes photos so uploads stay small. Small GIFs are kept as-is to keep their animation.
export const prepareImage = async (file) => {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
  if (file.type === "image/gif" && file.size <= MAX_BYTES)
    return readAsDataUrl(file);

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That image couldn't be opened");
  });
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Browsers that can't encode WebP hand back a PNG instead.
  let blob = await encode(canvas, "image/webp", 0.82);
  if (blob?.type !== "image/webp")
    blob = await encode(canvas, "image/jpeg", 0.85);
  if (!blob || blob.size > MAX_BYTES)
    throw new Error("That image is too large");
  return readAsDataUrl(blob);
};
