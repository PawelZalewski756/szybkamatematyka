import { describe, expect, it } from "vitest";
import { stripExaminerTable } from "@/lib/baza-zadan/cke/matura-task-content";

describe("stripExaminerTable", () => {
  it("usuwa tabele Wypełnia egzaminator i zostawia resztę", () => {
    const src =
      "Niech $a$.\n\n| Wypełnia egzaminator | Nr zadania | 5. | 6. |\n|---|---|---|---|\n| | Maks. liczba pkt | 2 | 3 |\n| | Uzyskana liczba pkt | | |\n\nKoniec.";
    const out = stripExaminerTable(src);
    expect(out).not.toMatch(/egzaminator/i);
    expect(out).toContain("Niech $a$.");
    expect(out).toContain("Koniec.");
  });

  it("nie zmienia zwykłej treści", () => {
    expect(stripExaminerTable("| a | b |\n|---|---|\n| 1 | 2 |")).toContain("| 1 | 2 |");
  });
});
