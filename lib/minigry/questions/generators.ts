import {
  questionTrackForPath,
  spClassLevel,
  type LearningPath,
} from "@/lib/learning-path";
import { generateLogarytmyQuestion } from "@/lib/minigry/generate-logarytmy";
import { generateQuestion } from "@/lib/minigry/generate-question";
import { generateMnozenieQuestion } from "@/lib/minigry/generate-mnozenie";
import { generateUlamkiQuestion } from "@/lib/minigry/generate-ulamki";
import { formatNumericAnswer } from "@/lib/minigry/format-answer";
import {
  buildNumericOptions,
  gcd,
  lcm,
  pickRandom,
  randomInt,
  shuffle,
  spDifficulty,
} from "@/lib/minigry/questions/math-utils";
import type {
  ChoiceQuestion,
  CompareQuestion,
  TrueFalseQuestion,
} from "@/lib/minigry/questions/types";

function latexOp(op: "+" | "−" | "×" | "÷"): string {
  if (op === "−") return "-";
  if (op === "×") return "\\times";
  if (op === "÷") return "\\div";
  return "+";
}

function fractionLatex(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  if (d === 1) return `$${n}$`;
  return `$\\frac{${n}}{${d}}$`;
}

function pickDistinctOptions(
  correct: string,
  candidates: readonly string[],
  count = 4,
): string[] {
  const unique = [...new Set([correct, ...candidates])];
  const others = shuffle(unique.filter((value) => value !== correct)).slice(
    0,
    count - 1,
  );
  return shuffle([correct, ...others]);
}

/** Zaokrąglenie do groszy/2 miejsc - tyle pokazuje formatNumericAnswer. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Opcje dla wyników, które nie muszą być całkowite (procenty, średnia, pole
 * koła). `buildNumericOptions` dokładała pułapki całkowite i gubiła część
 * dziesiętną, przez co uczeń widział np. „5% z 31 = 2” zamiast 1,55.
 */
function distinctNumericOptions(
  correct: number,
  candidates: readonly number[],
  count = 4,
): number[] {
  const target = round2(correct);
  const allowNegative = target < 0;
  const options: number[] = [target];
  const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;

  for (const raw of candidates) {
    if (options.length >= count) break;
    const value = round2(raw);
    if (!Number.isFinite(value)) continue;
    if (!allowNegative && value < 0) continue;
    if (options.some((existing) => same(existing, value))) continue;
    options.push(value);
  }

  for (let offset = 0.5; options.length < count && offset <= count + 20; offset += 0.5) {
    for (const value of [target + offset, target - offset]) {
      if (options.length >= count) break;
      const rounded = round2(value);
      if (!allowNegative && rounded < 0) continue;
      if (options.some((existing) => same(existing, rounded))) continue;
      options.push(rounded);
    }
  }

  return shuffle(options);
}

const TRIG_OPTIONS = [
  "$0$",
  "$\\frac{1}{2}$",
  "$\\frac{\\sqrt{2}}{2}$",
  "$\\frac{\\sqrt{3}}{2}$",
  "$1$",
  "$-\\frac{1}{2}$",
  "$-\\frac{\\sqrt{2}}{2}$",
  "$-\\frac{\\sqrt{3}}{2}$",
  "$-1$",
] as const;

const SIN_CASES = [
  { deg: 0, value: "$0$" },
  { deg: 30, value: "$\\frac{1}{2}$" },
  { deg: 45, value: "$\\frac{\\sqrt{2}}{2}$" },
  { deg: 60, value: "$\\frac{\\sqrt{3}}{2}$" },
  { deg: 90, value: "$1$" },
  { deg: 120, value: "$\\frac{\\sqrt{3}}{2}$" },
  { deg: 135, value: "$\\frac{\\sqrt{2}}{2}$" },
  { deg: 150, value: "$\\frac{1}{2}$" },
  { deg: 180, value: "$0$" },
  { deg: 210, value: "$-\\frac{1}{2}$" },
  { deg: 225, value: "$-\\frac{\\sqrt{2}}{2}$" },
  { deg: 240, value: "$-\\frac{\\sqrt{3}}{2}$" },
  { deg: 270, value: "$-1$" },
  { deg: 300, value: "$-\\frac{\\sqrt{3}}{2}$" },
  { deg: 315, value: "$-\\frac{\\sqrt{2}}{2}$" },
  { deg: 330, value: "$-\\frac{1}{2}$" },
  { deg: 360, value: "$0$" },
] as const;

const COS_CASES = [
  { deg: 0, value: "$1$" },
  { deg: 30, value: "$\\frac{\\sqrt{3}}{2}$" },
  { deg: 45, value: "$\\frac{\\sqrt{2}}{2}$" },
  { deg: 60, value: "$\\frac{1}{2}$" },
  { deg: 90, value: "$0$" },
  { deg: 120, value: "$-\\frac{1}{2}$" },
  { deg: 135, value: "$-\\frac{\\sqrt{2}}{2}$" },
  { deg: 150, value: "$-\\frac{\\sqrt{3}}{2}$" },
  { deg: 180, value: "$-1$" },
  { deg: 210, value: "$-\\frac{\\sqrt{3}}{2}$" },
  { deg: 225, value: "$-\\frac{\\sqrt{2}}{2}$" },
  { deg: 240, value: "$-\\frac{1}{2}$" },
  { deg: 270, value: "$0$" },
  { deg: 300, value: "$\\frac{1}{2}$" },
  { deg: 315, value: "$\\frac{\\sqrt{2}}{2}$" },
  { deg: 330, value: "$\\frac{\\sqrt{3}}{2}$" },
  { deg: 360, value: "$1$" },
] as const;

function trigOptions(correct: string): string[] {
  const others = shuffle(TRIG_OPTIONS.filter((value) => value !== correct)).slice(
    0,
    3,
  );
  return shuffle([correct, ...others]);
}

function arithmetic(
  path: LearningPath,
  op: "+" | "−" | "×" | "÷",
): ChoiceQuestion {
  const { min, max } = spDifficulty(path);
  let a = randomInt(min, max);
  let b = randomInt(min, max);

  if (op === "−" && a < b) [a, b] = [b, a];
  if (op === "÷") {
    b = randomInt(Math.max(2, min), Math.min(12, max));
    const quotient = randomInt(Math.max(2, min), Math.min(12, max));
    a = b * quotient;
  }

  const correct =
    op === "+"
      ? a + b
      : op === "−"
        ? a - b
        : op === "×"
          ? a * b
          : a / b;

  return {
    id: `${op}-${a}-${b}`,
    prompt: "Wynik",
    headline: `$${a} ${latexOp(op)} ${b}$`,
    correct,
    options: buildNumericOptions(correct, 4, op === "×" || op === "÷" ? 18 : 14),
  };
}

export function generateDodawanie(path: LearningPath) {
  return arithmetic(path, "+");
}

export function generateOdejmowanie(path: LearningPath) {
  return arithmetic(path, "−");
}

export function generateMnozenie(path: LearningPath) {
  const q = generateMnozenieQuestion(path);
  return {
    id: q.id,
    prompt: "Wynik",
    headline: q.prompt,
    correct: q.correct,
    options: q.options,
  };
}

export function generateDzielenie(path: LearningPath) {
  return arithmetic(path, "÷");
}

export function generatePorownaj(path: LearningPath): CompareQuestion {
  const { min, max } = spDifficulty(path);
  const left = randomInt(min, max);
  const allowEqual = Math.random() < 0.15;
  let right = allowEqual ? left : randomInt(min, max);
  while (!allowEqual && right === left) right = randomInt(min, max);

  const correct =
    left === right ? "equal" : left > right ? "left" : "right";

  return {
    id: `cmp-${left}-${right}`,
    left: `$${left}$`,
    right: `$${right}$`,
    correct,
  };
}

export function generateProcenty(path: LearningPath): ChoiceQuestion {
  const { min, max } = spDifficulty(path);
  const base = randomInt(Math.max(10, min * 2), Math.max(20, max * 2));
  const pct = pickRandom([5, 10, 15, 20, 25, 50] as const);
  // Dokładny wynik, nie zaokrąglony: 10% z 42 to 4,2, a nie 4.
  const correct = round2((base * pct) / 100);

  return {
    id: `pct-${pct}-${base}`,
    prompt: "Oblicz procent",
    headline: `$${pct}\\%$ z $${base}$`,
    correct,
    options: distinctNumericOptions(correct, [
      correct * 10,
      correct / 10,
      correct + 1,
      correct - 1,
      correct + 0.5,
      correct - 0.5,
    ]),
  };
}

export function generatePotegi(): TrueFalseQuestion {
  const base = randomInt(2, 12);
  const exp = randomInt(2, 6);
  const val = base ** exp;
  const showCorrect = Math.random() < 0.5;
  const trap = val + randomInt(1, 6);

  return {
    id: `pow-${base}-${exp}-${showCorrect ? "t" : "f"}`,
    equation: showCorrect
      ? `$${base}^{${exp}} = ${val}$`
      : `$${base}^{${exp}} = ${trap}$`,
    isCorrect: showCorrect,
  };
}

export function generatePierwiastki(path: LearningPath): ChoiceQuestion {
  const level = spClassLevel(path) ?? 8;
  const maxRoot = level <= 5 ? 16 : level <= 7 ? 28 : 40;
  const root = randomInt(2, maxRoot);
  const correct = root;
  const squared = root * root;

  return {
    id: `sqrt-${squared}`,
    prompt: "Ile wynosi pierwiastek?",
    headline: `$\\sqrt{${squared}}$`,
    correct,
    options: buildNumericOptions(correct, 4, 10),
  };
}

export function generateRownania(path: LearningPath): ChoiceQuestion {
  const hard = spClassLevel(path) === null || (spClassLevel(path) ?? 0) >= 7;
  const x = randomInt(2, hard ? 12 : 9);
  const a = randomInt(2, hard ? 6 : 4);
  const b = randomInt(1, hard ? 15 : 10);
  const c = a * x + b;

  return {
    id: `eq-${a}x+${b}=${c}`,
    prompt: "Znajdź x",
    headline: `$${a}x + ${b} = ${c}$`,
    correct: x,
    options: buildNumericOptions(x, 4, 6),
  };
}

export function generateCiag(path: LearningPath): ChoiceQuestion {
  const level = spClassLevel(path) ?? 6;
  const kind = level <= 4 ? "add" : Math.random() < 0.5 ? "add" : "mul";

  if (kind === "add") {
    const start = randomInt(1, 12);
    const step = randomInt(2, 9);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const correct = start + 4 * step;
    return {
      id: `seq-a-${seq.join("-")}`,
      prompt: "Jaka jest następna liczba?",
      headline: `$${seq.join(", ")},\\ ?$`,
      correct,
      options: buildNumericOptions(correct, 4, 15),
    };
  }

  const start = randomInt(2, 4);
  const ratio = randomInt(2, 3);
  const seq = [
    start,
    start * ratio,
    start * ratio * ratio,
    start * ratio ** 3,
  ];
  const correct = start * ratio ** 4;

  return {
    id: `seq-g-${seq.join("-")}`,
    prompt: "Jaka jest następna liczba?",
    headline: `$${seq.join(", ")},\\ ?$`,
    correct,
    options: buildNumericOptions(correct, 4, 40),
  };
}

export function generateNawiasy(path: LearningPath): ChoiceQuestion {
  const { min, max } = spDifficulty(path);
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  const c = randomInt(1, Math.min(9, max));
  const correct = a + b * c;
  const trapAddFirst = (a + b) * c;

  // Wcześniej `options[0] = trapAddFirst` nadpisywało poprawną odpowiedź, gdy
  // trafiła na indeks 0 - wtedy nie było jej wcale wśród opcji.
  return {
    id: `ops-${a}+${b}*${c}`,
    prompt: "Oblicz zgodnie z kolejnością działań",
    headline: `$${a} + ${b} \\times ${c}$`,
    correct,
    options: distinctNumericOptions(correct, [
      trapAddFirst,
      a * b + c,
      a + b + c,
      correct + 1,
      correct - 1,
    ]),
  };
}

export function generateFunkcje(): ChoiceQuestion {
  const x = randomInt(2, 8);
  const a = randomInt(2, 5);
  const b = randomInt(-5, 8);
  const correct = a * x + b;
  const bPart = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

  return {
    id: `fx-${a}x+${b}@${x}`,
    prompt: "Oblicz f(x)",
    headline: `$f(x) = ${a}x ${bPart}$, $x = ${x}$`,
    correct,
    options: buildNumericOptions(correct, 4, 12),
  };
}

export function generateWzory(): TrueFalseQuestion {
  const bank = [
    { true: "$(a + b)^{2} = a^{2} + 2ab + b^{2}$", false: "$(a + b)^{2} = a^{2} + b^{2}$" },
    { true: "$(a - b)^{2} = a^{2} - 2ab + b^{2}$", false: "$(a - b)^{2} = a^{2} - b^{2}$" },
    { true: "$a^{2} - b^{2} = (a - b)(a + b)$", false: "$a^{2} - b^{2} = (a - b)^{2}$" },
    { true: "$(2x)^{2} = 4x^{2}$", false: "$(2x)^{2} = 2x^{2}$" },
    { true: "$x^{2} \\cdot x^{3} = x^{5}$", false: "$x^{2} \\cdot x^{3} = x^{6}$" },
    { true: "$(x + 3)(x - 3) = x^{2} - 9$", false: "$(x + 3)(x - 3) = x^{2} + 9$" },
    { true: "$a^{3} - b^{3} = (a - b)(a^{2} + ab + b^{2})$", false: "$a^{3} - b^{3} = (a - b)^{3}$" },
    { true: "$(a + b)^{3} = a^{3} + 3a^{2}b + 3ab^{2} + b^{3}$", false: "$(a + b)^{3} = a^{3} + b^{3}$" },
    { true: "$x^{0} = 1$ dla $x \\ne 0$", false: "$x^{0} = 0$ dla $x \\ne 0$" },
    { true: "$a^{m} \\cdot a^{n} = a^{m+n}$", false: "$a^{m} \\cdot a^{n} = a^{m \\cdot n}$" },
    { true: "$\\frac{a^{m}}{a^{n}} = a^{m-n}$", false: "$\\frac{a^{m}}{a^{n}} = a^{m+n}$" },
    { true: "$\\sqrt{a^{2}} = |a|$", false: "$\\sqrt{a^{2}} = a$ dla każdego $a$" },
    { true: "$\\log_{a}(xy) = \\log_{a}x + \\log_{a}y$", false: "$\\log_{a}(xy) = \\log_{a}x \\cdot \\log_{a}y$" },
    { true: "$\\log_{a}(x^{k}) = k\\log_{a}x$", false: "$\\log_{a}(x^{k}) = \\log_{a}(kx)$" },
    { true: "$\\sin^{2}x + \\cos^{2}x = 1$", false: "$\\sin^{2}x + \\cos^{2}x = 0$" },
  ] as const;
  const t = pickRandom(bank);
  const showCorrect = Math.random() < 0.5;
  return {
    id: `${t.true}-${showCorrect ? "t" : "f"}`,
    equation: showCorrect ? t.true : t.false,
    isCorrect: showCorrect,
  };
}

export function generatePrawdaFalsz(path: LearningPath): TrueFalseQuestion {
  const q = generateQuestion(questionTrackForPath(path));
  return { id: q.equation, equation: q.equation, isCorrect: q.isCorrect };
}

export function generateUlamkiCompare(): CompareQuestion {
  const q = generateUlamkiQuestion();
  return {
    id: q.id,
    left: q.left,
    right: q.right,
    correct: q.correct,
  };
}

export function generateLogarytmy(): TrueFalseQuestion {
  const q = generateLogarytmyQuestion();
  return { id: q.equation, equation: q.equation, isCorrect: q.isCorrect };
}

export function generatePole(): ChoiceQuestion {
  const w = randomInt(3, 18);
  const h = randomInt(3, 14);
  const correct = w * h;
  const values = buildNumericOptions(correct, 4, 25);

  return {
    id: `area-${w}x${h}`,
    prompt: "Oblicz pole prostokąta",
    headline: `$a = ${w}\\,\\mathrm{cm}$, $b = ${h}\\,\\mathrm{cm}$`,
    correct: `${correct} cm²`,
    options: values.map((value) => `${value} cm²`),
  };
}

export function generateObwod(): ChoiceQuestion {
  const w = randomInt(3, 18);
  const h = randomInt(3, 14);
  const correct = 2 * (w + h);
  const values = buildNumericOptions(correct, 4, 25);

  return {
    id: `perim-${w}x${h}`,
    prompt: "Oblicz obwód prostokąta",
    headline: `$a = ${w}\\,\\mathrm{cm}$, $b = ${h}\\,\\mathrm{cm}$`,
    correct: `${correct} cm`,
    options: values.map((value) => `${value} cm`),
  };
}

export function generateNwd(): ChoiceQuestion {
  const a = randomInt(12, 48);
  const b = randomInt(12, 48);
  const correct = gcd(a, b);
  return {
    id: `gcd-${a}-${b}`,
    prompt: "Oblicz NWD",
    headline: `$\\mathrm{NWD}(${a}, ${b})$`,
    correct,
    options: buildNumericOptions(correct, 4, 8),
  };
}

export function generateZaokraglenie(): ChoiceQuestion {
  const val = randomInt(11, 99) + randomInt(1, 9) / 10;
  const rounded = Math.round(val);
  const display = val.toFixed(1).replace(".", "{,}");
  return {
    id: `rnd-${val.toFixed(1).replace(".", ",")}`,
    prompt: "Zaokrąglij do liczby całkowitej",
    headline: `$${display}$`,
    correct: rounded,
    options: buildNumericOptions(rounded, 4, 5),
  };
}

export function generateLiczbaPrzeciwna(): ChoiceQuestion {
  const n = randomInt(-50, 50) || 7;
  const correct = -n;

  return {
    id: `opp-${n}`,
    prompt: "Jaka jest liczba przeciwna?",
    headline: `$${n}$`,
    correct,
    options: buildNumericOptions(correct, 4, 12),
  };
}

export function generatePotegaDziesiatki(): TrueFalseQuestion {
  const exp = randomInt(1, 12);
  const correct = 10 ** exp;
  const showCorrect = Math.random() < 0.5;
  const trap = correct * 10;

  return {
    id: `10^${exp}-${showCorrect ? "t" : "f"}`,
    equation: showCorrect
      ? `$10^{${exp}} = ${correct}$`
      : `$10^{${exp}} = ${trap}$`,
    isCorrect: showCorrect,
  };
}

export function generateTrojkat(): TrueFalseQuestion {
  const a = randomInt(30, 80);
  const b = randomInt(30, 80);
  const showCorrect = Math.random() < 0.5;
  // Fałszywa wersja musi naprawdę być fałszywa: wcześniej trap = suma + 20
  // mógł wynieść 180°, czyli zdanie „a + b + trzeci = trap” stawało się prawdziwe.
  let trap = 180 + (Math.random() < 0.5 ? -1 : 1) * randomInt(10, 30);
  if (trap === 180) trap += 1;

  return {
    id: `tri-${a}-${b}-${showCorrect ? "t" : "f"}`,
    equation: showCorrect
      ? `$${a}^{\\circ} + ${b}^{\\circ} + \\text{trzeci kąt} = 180^{\\circ}$`
      : `$${a}^{\\circ} + ${b}^{\\circ} + \\text{trzeci kąt} = ${trap}^{\\circ}$`,
    isCorrect: showCorrect,
  };
}

export function generateUlamkiDodaj(): ChoiceQuestion {
  const d = pickRandom([2, 3, 4, 5, 6, 8] as const);
  const n1 = randomInt(1, d - 1);
  const n2 = randomInt(1, d - 1);
  const sum = n1 + n2;
  const correct = fractionLatex(sum, d);

  const candidates = [
    fractionLatex(sum, d * 2),
    fractionLatex(n1 * n2, d),
    `$${sum}$`,
    fractionLatex(sum + 1, d),
    fractionLatex(Math.max(1, sum - 1), d),
  ];

  return {
    id: `frac+${n1}-${n2}-${d}`,
    prompt: "Ile wynosi suma ułamków?",
    headline: `$\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}}$`,
    correct,
    options: pickDistinctOptions(correct, candidates),
  };
}

export function generateSinCos(): ChoiceQuestion {
  const { deg, value } = pickRandom(SIN_CASES);
  const correct = value;

  return {
    id: `sin-${deg}`,
    prompt: `Oblicz sin(${deg}°)`,
    headline: `$\\sin(${deg}^{\\circ}) = ?$`,
    correct,
    options: trigOptions(correct),
  };
}

export function generateCos(): ChoiceQuestion {
  const { deg, value } = pickRandom(COS_CASES);
  const correct = value;

  return {
    id: `cos-${deg}`,
    prompt: `Oblicz cos(${deg}°)`,
    headline: `$\\cos(${deg}^{\\circ}) = ?$`,
    correct,
    options: trigOptions(correct),
  };
}

export function generateNww(): ChoiceQuestion {
  const a = randomInt(4, 24);
  const b = randomInt(4, 24);
  const correct = lcm(a, b);
  return {
    id: `nww-${a}-${b}`,
    prompt: "Najmniejsza wspólna wielokrotność",
    headline: `$\\mathrm{NWW}(${a}, ${b}) = ?$`,
    correct,
    options: buildNumericOptions(correct, 4, 18),
  };
}

export function generateKwadrat(): ChoiceQuestion {
  const n = randomInt(2, 30);
  const correct = n * n;

  return {
    id: `sq-${n}`,
    prompt: "Podnieś do kwadratu",
    headline: `$${n}^{2} = ?$`,
    correct,
    options: buildNumericOptions(correct, 4, 25),
  };
}

export function generateModulo(): ChoiceQuestion {
  const b = randomInt(3, 9);
  const quotient = randomInt(3, 12);
  const a = b * quotient + randomInt(0, b - 1);
  const correct = a % b;
  return {
    id: `mod-${a}-${b}`,
    prompt: "Reszta z dzielenia",
    headline: `$${a} \\bmod ${b} = ?$`,
    correct,
    options: buildNumericOptions(correct, 4, 6),
  };
}

export function generateWartoscBezwzgledna(): ChoiceQuestion {
  const n = randomInt(-20, 20);
  if (n === 0) return generateWartoscBezwzgledna();
  const correct = Math.abs(n);
  return {
    id: `abs-${n}`,
    prompt: "Wartość bezwzględna",
    headline: `$|${n}| = ?$`,
    correct,
    options: buildNumericOptions(correct, 4, 8),
  };
}

export function generateUlamkiOdejmij(): ChoiceQuestion {
  const d = pickRandom([2, 3, 4, 5, 6, 8, 10, 12] as const);
  const n1 = randomInt(2, d * 2);
  const n2 = randomInt(1, n1 - 1);
  const diff = n1 - n2;
  const correct = fractionLatex(diff, d);

  const candidates = [
    fractionLatex(diff, d * 2),
    fractionLatex(n1 + n2, d),
    `$${diff}$`,
    fractionLatex(diff + 1, d),
    fractionLatex(Math.max(1, diff - 1), d),
  ];

  return {
    id: `frac-sub-${n1}-${n2}-${d}`,
    prompt: "Ile wynosi różnica ułamków?",
    headline: `$\\frac{${n1}}{${d}} - \\frac{${n2}}{${d}}$`,
    correct,
    options: pickDistinctOptions(correct, candidates),
  };
}

export function generatePoleKola(): ChoiceQuestion {
  const r = randomInt(1, 20);
  // π ≈ 3,14 jest podane w treści, więc wynik ma być dokładny do 2 miejsc,
  // a nie zaokrąglony do dziesiątych (12,56 ≠ 12,6).
  const correct = round2(3.14 * r * r);
  const values = distinctNumericOptions(correct, [
    correct * 10,
    correct / 10,
    2 * 3.14 * r,
    correct + 1,
    correct - 1,
  ]);

  return {
    id: `circle-${r}`,
    prompt: "Pole koła (π ≈ 3,14)",
    headline: `$r = ${r}\\,\\mathrm{cm}$`,
    correct: `${formatNumericAnswer(correct)} cm²`,
    options: values.map((value) => `${formatNumericAnswer(value)} cm²`),
  };
}

export function generateSrednia(): ChoiceQuestion {
  const nums = Array.from({ length: 4 }, () => randomInt(2, 20));
  const sum = nums.reduce((a, b) => a + b, 0);
  // Suma czterech liczb daje ćwiartki (np. 5,75). Wcześniejsze zaokrąglenie do
  // jednego miejsca po przecinku pokazywało 5,8 jako poprawną odpowiedź.
  const correct = round2(sum / 4);
  return {
    id: `avg-${nums.join("-")}`,
    prompt: "Średnia arytmetyczna",
    headline: `$\\frac{${nums.join(" + ")}}{${nums.length}}$`,
    correct,
    options: distinctNumericOptions(correct, [
      correct + 0.5,
      correct - 0.5,
      correct + 1,
      correct - 1,
      round2(sum / 3),
      round2(sum / 5),
    ]),
  };
}

export function generateProcentOdwrotny(): ChoiceQuestion {
  // Całość i procent dobrane tak, żeby część była liczbą całkowitą, a wynik
  // dokładny - wcześniej 62 z 104 dawało 59,6%, a opcje mówiły 60%.
  const total = randomInt(2, 10) * 20;
  const pct = pickRandom([5, 10, 15, 20, 25, 50, 75] as const);
  const part = (total * pct) / 100;
  const correct = pct;

  return {
    id: `pct-rev-${part}-${total}`,
    prompt: "Jaki to procent?",
    headline: `$${part}$ z $${total}$ to $?\\%$`,
    correct,
    options: buildNumericOptions(correct, 4, 15),
  };
}
