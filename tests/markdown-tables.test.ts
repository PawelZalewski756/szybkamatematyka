import { describe, expect, it } from "vitest";
import { fixMarkdownTables } from "@/lib/format/markdown-tables";

describe("fixMarkdownTables", () => {
  it("dopełnia pusty nagłówek do liczby kolumn separatora", () => {
    const markdown = [
      "| |",
      "|:---|:---:|:---:|",
      "| Współczynnik $a$ jest dodatni. | P | F |",
      "| Współczynnik $b$ jest dodatni. | P | F |",
    ].join("\n");

    expect(fixMarkdownTables(markdown)).toBe(
      [
        "|  |  |  |",
        "|:---|:---:|:---:|",
        "| Współczynnik $a$ jest dodatni. | P | F |",
        "| Współczynnik $b$ jest dodatni. | P | F |",
      ].join("\n"),
    );
  });

  it("dopełnia nagłówek z jedną komórką nad dwiema kolumnami", () => {
    const markdown = ["| CENNIK BILETÓW |", "|---|---|", "| 75 min | 4 zł |"].join(
      "\n",
    );

    expect(fixMarkdownTables(markdown)).toBe(
      ["| CENNIK BILETÓW |  |", "|---|---|", "| 75 min | 4 zł |"].join("\n"),
    );
  });

  it("nie rusza poprawnych tabel", () => {
    const markdown = ["| Pojęcie | Wartość |", "|---|---|", "| $x$ | 1 |"].join(
      "\n",
    );
    expect(fixMarkdownTables(markdown)).toBe(markdown);
  });

  it("liczy komórki z kreską wartości bezwzględnej w matematyce", () => {
    const markdown = ["| $|x|$ | Wartość |", "|---|---|", "| 1 | 2 |"].join(
      "\n",
    );
    expect(fixMarkdownTables(markdown)).toBe(markdown);
  });

  it("nie rusza zwykłego tekstu z pionowymi kreskami", () => {
    const text = "Wybór: A | B\n\nTo nie jest tabela.";
    expect(fixMarkdownTables(text)).toBe(text);
  });

  it("nie rusza tabel w bloku kodu", () => {
    const markdown = [
      "```markdown",
      "| |",
      "|:---|:---:|:---:|",
      "| a | P | F |",
      "```",
    ].join("\n");
    expect(fixMarkdownTables(markdown)).toBe(markdown);
  });
});
