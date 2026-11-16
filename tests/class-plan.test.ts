import { describe, expect, it } from "vitest";
import {
  allMappedTopicIds,
  getClassPlan,
  getClassPlanOptions,
} from "@/lib/trening/class-plan";
import { TRAINING_CURRICULUM } from "@/lib/trening/curriculum";

const ALL_TOPIC_IDS = new Set(
  Object.values(TRAINING_CURRICULUM).flatMap((exam) =>
    exam.categories.flatMap((category) =>
      category.topics.map((topic) => topic.id),
    ),
  ),
);

describe("mapa planu klas", () => {
  it("używa tylko topiców, które istnieją w drzewie CKE", () => {
    for (const id of allMappedTopicIds()) {
      expect(ALL_TOPIC_IDS.has(id), `nieznany topic: ${id}`).toBe(true);
    }
  });

  it("klasa 7 ma plan z potęgami, a klasa 1 jest pusta", () => {
    const klasa7 = getClassPlan("klasa-7");
    const klasa1 = getClassPlan("klasa-1");

    expect(klasa7.topicCount).toBeGreaterThan(0);
    expect(
      klasa7.categories.some((category) =>
        category.topics.some((topic) => topic.id === "potegi"),
      ),
    ).toBe(true);
    expect(klasa1.categories).toHaveLength(0);
  });

  it("liceum 4 obejmuje cały plan matury podstawowej", () => {
    const plan = getClassPlan("liceum-4");
    const expected = TRAINING_CURRICULUM.matura_podstawowa.categories.reduce(
      (sum, category) => sum + category.topics.length,
      0,
    );
    expect(plan.topicCount).toBe(expected);
  });

  it("technikum 1 korzysta z planu liceum 1", () => {
    expect(getClassPlan("technikum-1").topicCount).toBe(
      getClassPlan("liceum-1").topicCount,
    );
  });

  it("lista klas zawiera wszystkie roczniki", () => {
    expect(getClassPlanOptions()).toHaveLength(22);
  });
});
