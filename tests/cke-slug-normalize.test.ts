import { describe, expect, it } from "vitest";
import {
  normalizeCkeMaterialKey,
  normalizeCkeTopicSlug,
  normalizeExamType,
} from "@/lib/trening/cke-slug-normalize";

describe("normalizeExamType", () => {
  it("maps legacy 8-klasa exam type", () => {
    expect(normalizeExamType("egzamin_8_klasisty")).toBe("8_klasa");
  });
});

describe("normalizeCkeTopicSlug", () => {
  it("maps algebra/potegi to liczby_rzeczywiste/potegi", () => {
    expect(
      normalizeCkeTopicSlug("matura_podstawowa", "algebra", "potegi"),
    ).toEqual({ category: "liczby_rzeczywiste", topic: "potegi" });
  });

  it("maps legacy funkcje/liniowa to funkcja_liniowa", () => {
    expect(
      normalizeCkeTopicSlug("matura_podstawowa", "funkcje", "liniowa"),
    ).toEqual({ category: "funkcje", topic: "funkcja_liniowa" });
  });

  it("leaves canonical slugs unchanged", () => {
    expect(
      normalizeCkeTopicSlug("matura_podstawowa", "algebra", "rownania_liniowe"),
    ).toEqual({ category: "algebra", topic: "rownania_liniowe" });
  });
});

describe("normalizeCkeMaterialKey", () => {
  it("normalizes legacy material row", () => {
    expect(
      normalizeCkeMaterialKey("egzamin_8_klasisty", "arytmetyka", "ulamki"),
    ).toEqual({
      examType: "8_klasa",
      category: "liczby",
      topic: "ulamki",
    });
  });
});
