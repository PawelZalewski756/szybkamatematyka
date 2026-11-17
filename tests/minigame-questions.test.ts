import { describe, expect, it } from "vitest";
import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";
import { generateQuestion } from "@/lib/minigry/generate-question";
import type { LearningPath } from "@/lib/learning-path";

const PATHS: LearningPath[] = ["sp", "srednia"];
const SAMPLES = 60;

type Choice = {
  headline: string;
  correct: number | string;
  options: Array<number | string>;
  prompt: string;
  id: string;
};

function generate(slug: string, path: LearningPath, times = SAMPLES): unknown[] {
  const def = MINIGAME_REGISTRY.find((entry) => entry.slug === slug);
  if (!def) throw new Error(`Brak minigry ${slug}`);
  return Array.from({ length: times }, () => def.generate(path));
}

function numberOfAnswer(value: number | string): number {
  return Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
}

describe("minigry: wspólne niezmienniki", () => {
  for (const def of MINIGAME_REGISTRY) {
    it(`${def.slug} (${def.mode}) generuje spójne pytania`, () => {
      for (const path of PATHS) {
        for (let i = 0; i < SAMPLES; i += 1) {
          const q = def.generate(path) as Record<string, unknown>;
          const text = JSON.stringify(q);

          expect(text, `${def.slug}: tekst pytania`).not.toMatch(
            /NaN|undefined|Infinity/,
          );
          expect(text, `${def.slug}: artefakt float`).not.toMatch(
            /\d+\.\d{3,}/,
          );

          if (def.mode === "choice") {
            const options = q.options as Array<number | string>;
            const correct = q.correct as number | string;

            expect(options, `${def.slug}: liczba opcji`).toHaveLength(4);
            expect(
              new Set(options.map((option) => String(option))).size,
              `${def.slug}: duplikaty opcji`,
            ).toBe(options.length);
            expect(
              options.filter((option) => option === correct),
              `${def.slug}: poprawna odpowiedź w opcjach (${JSON.stringify(q)})`,
            ).toHaveLength(1);

            for (const option of options) {
              if (typeof option === "number") {
                expect(
                  Number.isFinite(option),
                  `${def.slug}: opcja ${option}`,
                ).toBe(true);
              }
            }
          }

          if (def.mode === "true-false") {
            expect(String(q.equation), `${def.slug}: równanie`).toContain("=");
            expect(typeof q.isCorrect, `${def.slug}: isCorrect`).toBe("boolean");
          }

          if (def.mode === "compare") {
            expect(String(q.left).length, `${def.slug}: lewa`).toBeGreaterThan(0);
            expect(String(q.right).length, `${def.slug}: prawa`).toBeGreaterThan(0);
          }
        }
      }
    });
  }
});

describe("minigry: poprawność matematyczna", () => {
  it("procenty: wynik = procent × liczba / 100, także z częścią dziesiętną", () => {
    for (const path of PATHS) {
      for (const raw of generate("procenty", path, 200)) {
        const q = raw as Choice;
        const match = q.headline.match(/\$(\d+)\\%\$\s*z\s*\$(\d+)\$/);
        expect(match, `nieznany nagłówek: ${q.headline}`).not.toBeNull();
        const pct = Number(match![1]);
        const base = Number(match![2]);
        const expected = (pct * base) / 100;

        expect(
          Math.abs(Number(q.correct) - expected),
          `${pct}% z ${base}: oczekiwano ${expected}, jest ${q.correct}`,
        ).toBeLessThan(1e-9);
        expect(q.options.map(String)).toContain(String(q.correct));
      }
    }
  });

  it("procenty: pokazuje część dziesiętną zamiast zaokrąglenia do całości", () => {
    // 10% z 42 = 4,2 - dokładnie ten przypadek zgłaszali uczniowie.
    let decimals = 0;
    for (const raw of generate("procenty", "sp", 200)) {
      const q = raw as Choice;
      if (Number(q.correct) % 1 !== 0) decimals += 1;
    }
    expect(decimals).toBeGreaterThan(0);
  });

  it("procent-odwrotny: część z całości daje dokładny procent", () => {
    for (const path of PATHS) {
      for (const raw of generate("procent-odwrotny", path, 200)) {
        const q = raw as Choice;
        const match = q.headline.match(/\$(\d+)\$\s*z\s*\$(\d+)\$/);
        expect(match, `nieznany nagłówek: ${q.headline}`).not.toBeNull();
        const part = Number(match![1]);
        const total = Number(match![2]);
        const expected = (part / total) * 100;

        expect(
          Math.abs(Number(q.correct) - expected),
          `${part} z ${total}: oczekiwano ${expected}%, jest ${q.correct}`,
        ).toBeLessThan(1e-9);
      }
    }
  });

  it("średnia: poprawna średnia bez zaokrąglania do dziesiątych", () => {
    for (const raw of generate("srednia", "sp", 200)) {
      const q = raw as Choice;
      const match = q.headline.match(/\\frac\{([\d\s+]+)\}\{(\d+)\}/);
      expect(match, `nieznany nagłówek: ${q.headline}`).not.toBeNull();
      const nums = match![1].split("+").map((value) => Number(value.trim()));
      const expected = nums.reduce((a, b) => a + b, 0) / Number(match![2]);

      expect(
        Math.abs(Number(q.correct) - expected),
        `${nums.join("+")}/${match![2]}: oczekiwano ${expected}, jest ${q.correct}`,
      ).toBeLessThan(1e-9);
    }
  });

  it("pole koła: dokładne pole dla π ≈ 3,14", () => {
    for (const raw of generate("pole-kola", "sp", 200)) {
      const q = raw as Choice;
      const match = q.headline.match(/r\s*=\s*(\d+)/);
      expect(match, `nieznany nagłówek: ${q.headline}`).not.toBeNull();
      const expected = 3.14 * Number(match![1]) ** 2;

      expect(
        Math.abs(numberOfAnswer(q.correct) - expected),
        `r=${match![1]}: oczekiwano ${expected}, jest ${q.correct}`,
      ).toBeLessThan(1e-9);
    }
  });

  it("nawiasy: poprawna odpowiedź zawsze jest w opcjach", () => {
    for (const path of PATHS) {
      for (const raw of generate("nawiasy", path, 200)) {
        const q = raw as Choice;
        const match = q.headline.match(
          /\$(\d+)\s*\+\s*(\d+)\s*\\times\s*(\d+)\$/,
        );
        expect(match, `nieznany nagłówek: ${q.headline}`).not.toBeNull();
        const [a, b, c] = match!.slice(1).map(Number);
        const expected = a + b * c;

        expect(
          q.options.map(Number),
          `kolejność działań ${a}+${b}×${c}: oczekiwano ${expected}`,
        ).toContain(expected);
        expect(Number(q.correct)).toBe(expected);
      }
    }
  });

  it("prawda-fałsz: brak artefaktów float i poprawna arytmetyka procentów", () => {
    const tracks = ["podstawowa", "egzamin-8-klasisty", "matura"] as const;
    for (const track of tracks) {
      for (let i = 0; i < 300; i += 1) {
        const q = generateQuestion(track);
        expect(q.equation).not.toMatch(/\d+\.\d{3,}/);

        const percent = q.equation.match(
          /\$(\d+)\\%\$\s*z\s*\$(\d+)\s*=\s*([\d,{}.]+)\$/,
        );
        if (percent) {
          const expected = (Number(percent[1]) * Number(percent[2])) / 100;
          const actual = Number(
            percent[3].replace("{,}", ".").replace(",", "."),
          );
          const difference = Math.abs(actual - expected);
          if (q.isCorrect) {
            expect(
              difference,
              `${percent[1]}% z ${percent[2]} = ${percent[3]} ma być prawdą`,
            ).toBeLessThan(1e-9);
          } else {
            expect(
              difference,
              `${percent[1]}% z ${percent[2]} = ${percent[3]} ma być fałszem`,
            ).toBeGreaterThan(1e-9);
          }
        }
      }
    }
  });

  it("prawda-fałsz: proste działania w bankach mówią prawdę", () => {
    const tracks = ["podstawowa", "egzamin-8-klasisty", "matura"] as const;
    const checks: Array<{
      pattern: RegExp;
      evaluate: (match: RegExpMatchArray) => number | null;
      value: (match: RegExpMatchArray) => number;
    }> = [
      {
        pattern: /^\$(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)\$$/,
        evaluate: (m) => Number(m[1]) + Number(m[2]),
        value: (m) => Number(m[3]),
      },
      {
        pattern: /^\$(\d+)\s*-\s*(\d+)\s*=\s*(\d+)\$$/,
        evaluate: (m) => Number(m[1]) - Number(m[2]),
        value: (m) => Number(m[3]),
      },
      {
        pattern: /^\$(\d+)\s*\\times\s*(\d+)\s*=\s*(\d+)\$$/,
        evaluate: (m) => Number(m[1]) * Number(m[2]),
        value: (m) => Number(m[3]),
      },
      {
        pattern: /^\$(\d+)\^\{(\d+)\}\s*=\s*(\d+)\$$/,
        evaluate: (m) => Number(m[1]) ** Number(m[2]),
        value: (m) => Number(m[3]),
      },
      {
        pattern: /^\$\\sqrt\{(\d+)\}\s*=\s*(\d+)\$$/,
        evaluate: (m) => Math.sqrt(Number(m[1])),
        value: (m) => Number(m[2]),
      },
    ];

    let checked = 0;
    for (const track of tracks) {
      for (let i = 0; i < 500; i += 1) {
        const q = generateQuestion(track);
        for (const check of checks) {
          const match = q.equation.match(check.pattern);
          if (!match) continue;
          checked += 1;
          const expected = check.evaluate(match);
          const actual = check.value(match);
          if (q.isCorrect) {
            expect(
              actual,
              `${q.equation} ma być prawdą (oczekiwano ${expected})`,
            ).toBe(expected);
          } else {
            expect(
              actual,
              `${q.equation} ma być fałszem (oczekiwano ${expected})`,
            ).not.toBe(expected);
          }
          break;
        }
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("trójkąt: fałszywe zdanie nigdy nie sumuje się do 180°", () => {
    for (let i = 0; i < 400; i += 1) {
      const q = MINIGAME_REGISTRY.find((entry) => entry.slug === "trojkat")!
        .generate("sp") as { equation: string; isCorrect: boolean };
      const match = q.equation.match(/=\s*(\d+)\^\{\\circ\}\$/);
      expect(match, `nieznane równanie: ${q.equation}`).not.toBeNull();
      const total = Number(match![1]);
      if (q.isCorrect) {
        expect(total, q.equation).toBe(180);
      } else {
        expect(total, q.equation).not.toBe(180);
      }
    }
  });
});
