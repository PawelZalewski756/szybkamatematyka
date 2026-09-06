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

  it("wyciąga JSON z komentarza modelu i ogranicza punkty do maxPoints", () => {
    const result = parseTaskGradeResponse(
      'Oto ocena:\n```json\n{"verdict":"partial","feedback":"Częściowo poprawnie.","awardedPoints":9}\n```',
      2,
    );
    expect(result?.awardedPoints).toBe(2);
  });

  it("nie pozwala na zbyt długi feedback", () => {
    const feedback = "x".repeat(1_201);
    expect(
      parseTaskGradeResponse(
        JSON.stringify({ verdict: "wrong", feedback }),
      ),
    ).toBeNull();
  });
});

describe("normalizeHintText", () => {
  it("trims whitespace", () => {
    expect(normalizeHintText("  hint  ")).toBe("hint");
  });
});
