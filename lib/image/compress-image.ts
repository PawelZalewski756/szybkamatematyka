/** Wspólna kompresja obrazów w przeglądarce (awatar, załącznik zgłoszenia). */
const IMAGE_EXT = /\.(jpe?g|png|heic|heif|webp|gif)$/i;

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

export type CompressImageOptions = {
  /** Dłuższy bok wynikowego obrazu. */
  maxDimension: number;
  /** Jakość JPEG w zakresie 0-1. */
  quality: number;
  /** Nazwa pliku wynikowego (bez rozszerzenia). */
  fileName: string;
};

export async function compressImageToJpeg(
  file: File,
  { maxDimension, quality, fileName }: CompressImageOptions,
): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Nie można odczytać obrazu. Spróbuj zapisać go jako PNG lub JPG.",
    );
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > maxDimension ? maxDimension / longest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Kompresja niedostępna w tej przeglądarce.");
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error("Kompresja nie powiodła się.")),
        "image/jpeg",
        quality,
      );
    });

    return new File([blob], `${fileName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
