/** Maks. rozmiar pliku wejściowego (iPhone może wysłać duże zdjęcie). */
export const MAX_AVATAR_INPUT_BYTES = 20 * 1024 * 1024;

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

const IMAGE_EXT = /\.(jpe?g|png|heic|heif|webp)$/i;

export function validateAvatarInputFile(file: File): string | null {
  const isImage =
    file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
  if (!isImage) {
    return "Wybierz plik graficzny (zdjęcie).";
  }
  if (file.size > MAX_AVATAR_INPUT_BYTES) {
    return "Plik jest za duży (maks. 20 MB).";
  }
  return null;
}

/** Zmniejsza i kompresuje zdjęcie do JPEG (~kilka–kilkaset KB). */
export async function compressAvatarFile(file: File): Promise<File> {
  const validationError = validateAvatarInputFile(file);
  if (validationError) throw new Error(validationError);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Nie można odczytać zdjęcia. Spróbuj zapisać je jako JPEG w galerii.",
    );
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
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
        JPEG_QUALITY,
      );
    });

    return new File([blob], "avatar.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
