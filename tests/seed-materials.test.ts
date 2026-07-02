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

  it("has full lessons for all seed topics", () => {
    for (const material of SEED_MATERIALS) {
      expect(
        classifyTheoryContent(material.content),
        `${material.exam_type}/${material.category}/${material.topic}`,
      ).toBe("full");
    }
  });
});
