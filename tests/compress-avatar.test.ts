import {
  MAX_AVATAR_INPUT_BYTES,
  validateAvatarInputFile,
} from "@/lib/image/compress-avatar";
import { describe, expect, it } from "vitest";

function mockFile(
  overrides: Partial<File> & { size: number; type: string; name?: string },
): File {
  return {
    name: "photo.jpg",
    lastModified: Date.now(),
    ...overrides,
  } as File;
}

describe("validateAvatarInputFile", () => {
  it("akceptuje obraz JPEG", () => {
    expect(
      validateAvatarInputFile(mockFile({ type: "image/jpeg", size: 5_000_000 })),
    ).toBeNull();
  });

  it("odrzuca pliki spoza obrazów", () => {
    expect(
      validateAvatarInputFile(
        mockFile({ type: "application/pdf", size: 1000, name: "doc.pdf" }),
      ),
    ).toMatch(/graficzny/);
  });

  it("odrzuca pliki większe niż limit wejściowy", () => {
    expect(
      validateAvatarInputFile(
        mockFile({ type: "image/jpeg", size: MAX_AVATAR_INPUT_BYTES + 1 }),
      ),
    ).toMatch(/za duży/);
  });
});
