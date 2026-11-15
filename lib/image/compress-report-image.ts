import { BUG_REPORT_LIMITS } from "@/lib/bug-report/report";
import {
  compressImageToJpeg,
  isImageFile,
} from "@/lib/image/compress-image";

export const MAX_REPORT_IMAGE_INPUT_BYTES = 15 * 1024 * 1024;

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export function validateReportImage(file: File): string | null {
  if (!isImageFile(file)) {
    return "Załącznik musi być obrazem (PNG, JPG, WEBP lub GIF).";
  }
  if (file.size > MAX_REPORT_IMAGE_INPUT_BYTES) {
    return "Obraz jest za duży (maks. 15 MB).";
  }
  return null;
}

/**
 * Zmniejsza zrzut ekranu przed wysłaniem, żeby zmieścić się w limicie
 * załącznika i limicie żądania na Vercelu.
 */
export async function compressReportImage(file: File): Promise<File> {
  const validationError = validateReportImage(file);
  if (validationError) throw new Error(validationError);

  const compressed = await compressImageToJpeg(file, {
    maxDimension: MAX_DIMENSION,
    quality: JPEG_QUALITY,
    fileName: "zgloszenie",
  });

  if (compressed.size > BUG_REPORT_LIMITS.attachmentMaxBytes) {
    throw new Error("Obraz jest za duży nawet po kompresji (maks. 3 MB).");
  }

  return compressed;
}
