import { describe, expect, it } from "vitest";

import { TRAINING_CURRICULUM } from "@/lib/trening/curriculum";
import { getNextTopic } from "@/lib/trening/next-topic";

describe("getNextTopic", () => {
  const cats = TRAINING_CURRICULUM["8_klasa"].categories;

  it("zwraca kolejny temat w tym samym dziale", () => {
    const [a, b] = cats[0].topics;
    expect(getNextTopic("8_klasa", cats[0].id, a.id)?.name).toBe(b.name);
  });

  it("przechodzi do pierwszego tematu kolejnego działu", () => {
    const last = cats[0].topics.at(-1)!;
    expect(getNextTopic("8_klasa", cats[0].id, last.id)?.name).toBe(
      cats[1].topics[0].name,
    );
  });

  it("zwraca null dla ostatniego tematu i nieznanych danych", () => {
    const lastCat = cats.at(-1)!;
    expect(getNextTopic("8_klasa", lastCat.id, lastCat.topics.at(-1)!.id)).toBeNull();
    expect(getNextTopic("8_klasa", "x", "y")).toBeNull();
    expect(getNextTopic("matura_rozszerzona", "x", "y")).toBeNull();
  });
});
