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

  it("grupuje zadania z arkuszy po sesji, a nie po numerze zadania", () => {
    expect(
      getTaskTopic("Egzamin ósmoklasisty - maj 2019 - zad. 10"),
    ).toBe("Egzamin ósmoklasisty - maj 2019");
    expect(
      getTaskTopic("Matura - czerwiec 2020 - poziom podstawowy - zad. 22"),
    ).toBe("Matura - czerwiec 2020 - poziom podstawowy");
    expect(
      getTaskTopic("Matura - maj 2025 - poziom podstawowy - zad. 12.1"),
    ).toBe("Matura - maj 2025 - poziom podstawowy");
  });
});
