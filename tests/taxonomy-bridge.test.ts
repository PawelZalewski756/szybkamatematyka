import { describe, expect, it } from "vitest";
import { bazaCategoryForCmsDzial, trainingCategoryForBazaCategory } from "@/lib/trening/taxonomy-bridge";

describe("taxonomy-bridge", () => {
  it("mapuje kategorie bazy na slug treningu", () => {
    expect(trainingCategoryForBazaCategory("rownania")).toBe("algebra");
    expect(trainingCategoryForBazaCategory("geometria")).toBe("geometria");
    expect(trainingCategoryForBazaCategory("egzamin-8", "8_klasa")).toBe("liczby");
  });

  it("mapuje dział CMS na kategorię katalogu", () => {
    expect(bazaCategoryForCmsDzial("Równania")).toBe("rownania");
    expect(bazaCategoryForCmsDzial("Geometria")).toBe("geometria");
    expect(bazaCategoryForCmsDzial("Nieznany")).toBe("matura");
  });
});
