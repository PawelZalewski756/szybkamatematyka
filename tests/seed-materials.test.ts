import { describe, expect, it } from "vitest";
import { SEED_MATERIALS } from "@/lib/trening/seed/materials";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import { classifyTheoryContent } from "@/lib/trening/theory-content";

describe("SEED_MATERIALS coverage", () => {
  it("covers every CKE topic for matura and 8 klasa", () => {
    for (const examType of ["matura_podstawowa", "8_klasa"] as const) {
      const expected = listCkeTopicsForExam(examType);
      for (const topic of expected) {
        const found = SEED_MATERIALS.find(
          (m) =>
            m.exam_type === examType &&
            m.category === topic.category &&
            m.topic === topic.topic,
        );
        expect(found, `${examType}/${topic.category}/${topic.topic}`).toBeDefined();
      }
    }
  });

  it("has full or comprehensive lessons for all seed topics", () => {
    for (const material of SEED_MATERIALS) {
      const tier = classifyTheoryContent(material.content);
      expect(
        tier === "full" || tier === "comprehensive",
        `${material.exam_type}/${material.category}/${material.topic} → ${tier}`,
      ).toBe(true);
    }
  });

  it("does not expose generation or correction commentary in lessons", () => {
    const metaCommentary =
      /Problem polega na tym|Korekta zadania|Dla celów treningowych|załóżmy, że zadanie jest poprawne/i;

    for (const material of SEED_MATERIALS) {
      expect(
        material.content,
        `${material.exam_type}/${material.category}/${material.topic}`,
      ).not.toMatch(metaCommentary);
    }
  });
});
