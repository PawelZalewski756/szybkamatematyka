import { describe, expect, it } from "vitest";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import { getTopicSummary, TOPIC_SUMMARIES } from "@/lib/trening/summaries";
import { SEED_MATERIALS } from "@/lib/trening/seed/materials";

describe("topic summaries", () => {
  it("covers every CKE topic for matura and 8 klasa", () => {
    for (const examType of ["matura_podstawowa", "8_klasa"] as const) {
      for (const topic of listCkeTopicsForExam(examType)) {
        const material = SEED_MATERIALS.find(
          (entry) =>
            entry.exam_type === examType &&
            entry.category === topic.category &&
            entry.topic === topic.topic,
        );
        const summary = getTopicSummary(
          examType,
          topic.category,
          topic.topic,
          material?.content,
        );
        expect(
          summary,
          `${examType}/${topic.category}/${topic.topic}`,
        ).not.toBeNull();
      }
    }
  });

  it("keeps summary keys unique and non-empty", () => {
    const keys = Object.keys(TOPIC_SUMMARIES);
    expect(new Set(keys).size).toBe(keys.length);
    for (const summary of Object.values(TOPIC_SUMMARIES)) {
      expect(summary.title.trim().length).toBeGreaterThan(0);
      expect(summary.eyebrow.trim().length).toBeGreaterThan(0);
    }
  });
});
