import { describe, expect, it } from "vitest";
import {
  formatCkeMathText,
  hasCkeHtmlGarbage,
} from "@/lib/baza-zadan/cke/format-cke-math";
import { EXAM_ARCHIVE_TASKS } from "@/lib/baza-zadan/exams";

describe("formatCkeMathText", () => {
  it("usuwa urwany <ul class=\"", () => {
    const out = formatCkeMathText('Zapisz obliczenia. <ul class="');
    expect(out).toBe("Zapisz obliczenia.");
    expect(out).not.toContain("<ul");
  });

  it("zamienia litery matematyczne Unicode na ASCII w LaTeXu", () => {
    const out = formatCkeMathText(
      "Niech 𝑃(𝑥) oznacza funkcję. Oblicz długość 𝒙 krawędzi 𝑨𝑩.",
    );
    expect(out).toContain("$");
    expect(out).toMatch(/P\(x\)/);
    expect(out).not.toMatch(/[\u{1D400}-\u{1D7FF}]/u);
  });

  it("składa f( x ) i potęgi x 2", () => {
    const out = formatCkeMathText(
      "Funkcja f( x ) = x 2 + x + c . Jeżeli f(3) = 4, to",
    );
    expect(out).toContain("$f(x)");
    expect(out).toContain("x^{2}");
  });

  it("składa ciągi ( a n ) i a 4", () => {
    const out = formatCkeMathText(
      "W ciągu ( a n ) warunek a 4 = 3 a 1 . Iloraz q",
    );
    expect(out).toContain("a_{n}");
    expect(out).toContain("a_{4}");
    expect(out).toContain("a_{1}");
  });

  it("owija nierówności i zachowuje obrazki markdown", () => {
    const out = formatCkeMathText(
      "Rozwiąż nierówność 2 x 2 − 4 x > ( x + 3)( x − 2) . ![Rysunek](/cke-matura/x.png)",
    );
    expect(out).toContain("$");
    expect(out).toContain("![Rysunek](/cke-matura/x.png)");
    expect(out).toContain("x^{2}");
  });

  it("nie dubluje istniejących delimiterów $", () => {
    const out = formatCkeMathText("Policz $x^{2} + 1$ dokładnie.");
    expect(out.match(/\$/g)?.length).toBe(2);
  });

  it("nie wyciąga litery z polskiego słowa do matematyki", () => {
    const out = formatCkeMathText(
      "ma dokładnie jedno rozwiązanie: x = 1",
    );
    expect(out).toContain("rozwiązanie:");
    expect(out).not.toContain("rozwiązani$");
    expect(out).toMatch(/\$x\s*=\s*1\$/);
  });

  it("owija funkcję P i długość x w kontekście", () => {
    const out = formatCkeMathText(
      "Wyznacz wzór i dziedzinę funkcji P. Oblicz długość x krawędzi AB.",
    );
    expect(out).toContain("funkcji $P$");
    expect(out).toContain("długość $x$");
  });

  it("naprawia sklejony OCR przy nierówności i kątach", () => {
    const out = formatCkeMathText(
      "Zbiorem rozwiązań nierówności ax + 4 ≥ 0z niewiadomą x jest przedział.",
    );
    expect(out).toMatch(/\\ge\s*0/);
    expect(out).not.toContain("0z");
    expect(out).toContain("niewiadomą $x$");

    const ang = formatCkeMathText("|∡ACB| = 90°");
    expect(ang).toContain("$");
    expect(ang).toMatch(/\\angle/);
    expect(ang).toMatch(/\\circ/);
    expect(ang.endsWith("°")).toBe(false);
  });

  it("dekoduje encje i ułamki", () => {
    const out = formatCkeMathText("otrzymamy 4 &frasl; 7 oraz &fnof;(x)");
    expect(out).not.toContain("&frasl;");
    expect(out).not.toContain("&fnof;");
    expect(out).toContain("\\frac{4}{7}");
  });
});

describe("hasCkeHtmlGarbage", () => {
  it("wykrywa śmieci", () => {
    expect(hasCkeHtmlGarbage('tekst <ul class="')).toBe(true);
    expect(hasCkeHtmlGarbage("f &fnof; x")).toBe(true);
    expect(hasCkeHtmlGarbage("czysty tekst z 0 < x")).toBe(false);
  });
});

describe("regresja archiwum CKE", () => {
  it("po formatowaniu żadna treść nie ma śmieci HTML", () => {
    for (const task of EXAM_ARCHIVE_TASKS) {
      const formatted = formatCkeMathText(task.prompt);
      expect(hasCkeHtmlGarbage(formatted), task.id).toBe(false);
    }
  });

  it("formatuje znane zadanie m25-maj-z31 bez <ul i z LaTeXem", () => {
    const task = EXAM_ARCHIVE_TASKS.find((t) => t.id === "cke-m25-maj-z31");
    expect(task).toBeTruthy();
    const out = formatCkeMathText(task!.prompt);
    expect(out).not.toContain("<ul");
    expect(out).toContain("$");
    expect(out).toMatch(/P\s*\(\s*x\s*\)|\$P/);
    expect(out).toContain("![Rysunek do zadania]");
  });
});
