import { describe, expect, it } from "vitest";
import { cleanMaturaTaskText } from "@/lib/baza-zadan/cke/parse-matura-page";

describe("cleanMaturaTaskText", () => {
  it("strips scraper junk and incomplete HTML tags", () => {
    const out = cleanMaturaTaskText(
      'Oblicz wartość wyrażenia. <ul class="\npwz: 42% Poziom wykonania zadania: średni',
    );
    expect(out).not.toMatch(/<[a-zA-Z]/);
    expect(out).not.toMatch(/pwz:/i);
    expect(out).toContain("Oblicz wartość wyrażenia.");
  });

  it("normalizes HTML entities and wraps math as LaTeX", () => {
    const out = cleanMaturaTaskText(
      "Wyznacz &fnof;(x) = x&sup2; + 1 oraz &radic;4 &ge; 0.",
    );
    expect(out).not.toMatch(/&fnof;|&radic;|&ge;/);
    expect(out).toMatch(/\$/);
  });

  it("keeps markdown images intact while formatting nearby math", () => {
    const out = cleanMaturaTaskText(
      "Oblicz pole ![figura](/img/a.png) trójkąta o boku a = 3.",
    );
    expect(out).toContain("![figura](/img/a.png)");
    expect(out).toMatch(/\$a\s*=\s*3\$/);
  });

  it("is safe to run twice (seed + display)", () => {
    const once = cleanMaturaTaskText("Rozwiąż x^2 + 1 = 0.");
    const twice = cleanMaturaTaskText(once);
    expect(twice).toBe(once);
  });
});
