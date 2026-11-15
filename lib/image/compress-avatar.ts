import {
  compressImageToJpeg,
  isImageFile,
} from "@/lib/image/compress-image";

/** Maks. rozmiar pliku wejściowego (iPhone może wysłać duże zdjęcie). */
export const MAX_AVATAR_INPUT_BYTES = 20 * 1024 * 1024;

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

export function validateAvatarInputFile(file: File): string | null {
  if (!isImageFile(file)) {
    return "Wybierz plik graficzny (zdjęcie).";
  }
  if (file.size > MAX_AVATAR_INPUT_BYTES) {
    return "Plik jest za duży (maks. 20 MB).";
  }
  return null;
}

/** Zmniejsza i kompresuje zdjęcie do JPEG (~kilka-kilkaset KB). */
export async function compressAvatarFile(file: File): Promise<File> {
  const validationError = validateAvatarInputFile(file);
  if (validationError) throw new Error(validationError);

  return compressImageToJpeg(file, {
    maxDimension: MAX_DIMENSION,
    quality: JPEG_QUALITY,
    fileName: "avatar",
  });
}
