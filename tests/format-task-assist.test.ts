import { describe, expect, it } from "vitest";
import {
  normalizeHintText,
  parseTaskGradeResponse,
} from "@/lib/gemini/format-task-assist";

describe("parseTaskGradeResponse", () => {
  it("parses valid grade JSON", () => {
    const result = parseTaskGradeResponse(
      '{"verdict":"correct","feedback":"Dobrze!","acceptAsCorrect":true}',
    );
    expect(result).toEqual({
      verdict: "correct",
      feedback: "Dobrze!",
      acceptAsCorrect: true,
      awardedPoints: undefined,
    });
  });

  it("rejects partial as acceptAsCorrect when flag false", () => {
    const result = parseTaskGradeResponse(
      '{"verdict":"partial","feedback":"Blisko","acceptAsCorrect":false}',
    );
    expect(result?.verdict).toBe("partial");
    expect(result?.acceptAsCorrect).toBe(false);
  });

  it("returns null for invalid verdict", () => {
    expect(parseTaskGradeResponse('{"verdict":"maybe","feedback":"x"}')).toBeNull();
  });

  it("odczytuje awardedPoints", () => {
    const result = parseTaskGradeResponse(
      '{"verdict":"partial","feedback":"Jeden podpunkt","acceptAsCorrect":false,"awardedPoints":1}',
    );
    expect(result?.awardedPoints).toBe(1);
  });
});

describe("normalizeHintText", () => {
  it("trims whitespace", () => {
    expect(normalizeHintText("  hint  ")).toBe("hint");
  });
});
