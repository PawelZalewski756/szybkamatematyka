import { describe, expect, it } from "vitest";
import { mergeTheorySummaries, THEORY_INDEX } from "@/lib/trening/seed/theory-index";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";

describe("THEORY_INDEX", () => {
  it("has one entry per CKE topic", () => {
    expect(THEORY_INDEX).toHaveLength(134);
    for (const examType of ["matura_podstawowa", "8_klasa"] as const) {
      expect(
        THEORY_INDEX.filter((e) => e.exam_type === examType).length,
      ).toBe(listCkeTopicsForExam(examType).length);
    }
  });

  it("mergeTheorySummaries fills gaps when DB is empty", () => {
    const merged = mergeTheorySummaries("matura_podstawowa", []);
    expect(merged).toHaveLength(76);
    expect(
      merged.find(
        (m) =>
          m.category === "liczby_rzeczywiste" &&
          m.topic === "notacja_wykladnicza",
      )?.tier,
    ).toBe("comprehensive");
  });
});
