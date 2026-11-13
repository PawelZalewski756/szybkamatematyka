import { describe, expect, it } from "vitest";
import { getTaskTopic } from "@/lib/baza-zadan/topics";

describe("getTaskTopic", () => {
  it("grupuje warianty proceduralne pod wspólną nazwą", () => {
    expect(getTaskTopic("Mnożenie #12")).toBe("Mnożenie");
    expect(getTaskTopic("Ułamki - odejmowanie #7")).toBe(
      "Ułamki - odejmowanie",
    );
    expect(getTaskTopic("Pole prostokąta #3")).toBe("Pole prostokąta");
  });

  it("zostawia zwykłe tytuły bez zmian", () => {
    expect(getTaskTopic("Kolejność działań")).toBe("Kolejność działań");
    expect(getTaskTopic("  Procenty  ")).toBe("Procenty");
  });
});
