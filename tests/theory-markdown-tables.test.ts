import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import { normalizeAbcdLayout } from "@/lib/baza-zadan/cke/format-abcd-layout";
import {
  splitTaskContent,
  stripExaminerTable,
} from "@/lib/baza-zadan/cke/matura-task-content";

function render(content: string): string {
  return renderToStaticMarkup(createElement(TheoryMarkdown, { content }));
}

/** Realna treść zadania 13 z matury 2026 (poziom podstawowy). */
const TASK_13_TABLE = [
  "Oceń prawdziwość poniższych stwierdzeń. Wybierz P, jeśli stwierdzenie jest prawdziwe, albo F - jeśli jest fałszywe.",
  "",
  "| |",
  "|:---|:---:|:---:|",
  "| Współczynnik $a$ we wzorze funkcji $f$ jest liczbą dodatnią. | P | F |",
  "| Współczynnik $b$ we wzorze funkcji $f$ jest liczbą dodatnią. | P | F |",
].join("\n");

describe("TheoryMarkdown - tabele CKE", () => {
  it("renderuje tabelę z pustym nagłówkiem jako <table>", () => {
    const html = render(TASK_13_TABLE);
    expect(html).toContain("<table");
    expect(html).toContain("<td");
    expect(html).not.toContain(":---");
    expect(html).toContain("Współczynnik");
  });

  it("renderuje tabelę z nagłówkiem krótszym niż separator", () => {
    const html = render(
      ["| CENNIK BILETÓW |", "|---|---|", "| 75 min | 4 zł |"].join("\n"),
    );
    expect(html).toContain("<table");
    expect(html).toContain("CENNIK BILETÓW");
    expect(html).not.toContain("|---|");
  });

  it("nie psuje zwykłej teorii bez tabel", () => {
    const html = render("## Wzór\n\n$$a^2 + b^2 = c^2$$");
    expect(html).toContain("Wzór");
    expect(html).not.toContain("<table");
  });

  it("przechodzi cały pipeline TaskTresc dla zadania 13", () => {
    const processed = splitTaskContent(
      normalizeAbcdLayout(formatCkeMathText(stripExaminerTable(TASK_13_TABLE))),
    );
    const html = processed
      .map((part) => (part.type === "text" ? render(part.content) : ""))
      .join("");
    expect(html).toContain("<table");
    expect(html).toContain("Współczynnik");
    expect(html).not.toContain(":---");
  });
});
