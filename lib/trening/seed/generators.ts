import type { ExamType } from "@/types/database";
import { generateParametricTask } from "@/lib/trening/seed/parametric";
import { answersEquivalent } from "@/lib/math/answer-equiv";
import {
  fmtNum,
  gcd,
  mulberry32,
  pick,
  randInt,
  shuffle,
  type Rng,
} from "@/lib/trening/seed/rng";
import type { SeedTopicSlot } from "@/lib/trening/seed/topics";

export type TaskDraft = {
  exam_type: ExamType;
  category: string;
  topic: string;
  content: string;
  correct_answer: string;
  options: string[];
  difficulty: 1 | 2 | 3;
  xp_reward: number;
  explanation?: string;
};

function buildMc(
  rng: Rng,
  slot: Pick<SeedTopicSlot, "exam_type" | "category" | "topic">,
  content: string,
  correct: string,
  wrongs: string[],
  difficulty: 1 | 2 | 3,
): TaskDraft {
  const pool: string[] = [correct.trim()];
  for (const candidate of wrongs) {
    const value = candidate.trim();
    if (
      value &&
      !pool.some((existing) => answersEquivalent(existing, value))
    ) {
      pool.push(value);
    }
  }
  while (pool.length < 4) {
    const fallback = fallbackAnswer(correct, pool.length);
    if (!pool.some((existing) => answersEquivalent(existing, fallback))) {
      pool.push(fallback);
    } else {
      pool.push(`Odpowiedź ${pool.length + 1}`);
    }
  }
  const options = shuffle(rng, pool.slice(0, 4)).map((s) => s.trim());
  const xp =
    difficulty === 1
      ? randInt(rng, 10, 14)
      : difficulty === 2
        ? randInt(rng, 14, 20)
        : randInt(rng, 18, 25);

  return {
    exam_type: slot.exam_type,
    category: slot.category,
    topic: slot.topic,
    content,
    correct_answer: correct,
    options,
    difficulty,
    xp_reward: xp,
  };
}

function wrongNumeric(rng: Rng, correct: number, spread: number): string[] {
  const deltas = [-spread, -1, 1, 2, spread, spread + 1, -2];
  const out: string[] = [];
  for (const d of shuffle(rng, deltas)) {
    const v = correct + d;
    const s = fmtNum(v);
    if (s !== fmtNum(correct) && !out.includes(s)) out.push(s);
    if (out.length >= 3) break;
  }
  while (out.length < 3) {
    out.push(fmtNum(correct + randInt(rng, 3, 9)));
  }
  return out.slice(0, 3);
}

type GenFn = (rng: Rng, slot: SeedTopicSlot, variant: number) => TaskDraft;

function fallbackAnswer(correct: string, offset: number): string {
  const fraction = correct.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (fraction) {
    try {
      return `${BigInt(fraction[1]) + BigInt(offset)}/${fraction[2]}`;
    } catch {
      // Fall through to the numeric representation below.
    }
  }

  if (/^-?\d+$/.test(correct.trim())) {
    try {
      return (BigInt(correct.trim()) + BigInt(offset)).toString();
    } catch {
      // Fall through to the numeric representation below.
    }
  }

  const numeric = Number(correct);
  return Number.isFinite(numeric)
    ? fmtNum(numeric + offset)
    : `Odpowiedź ${offset + 1}`;
}

// --- Potęgi / pierwiastki ---
const genPotegi: GenFn[] = [
  (rng, slot, v) => {
    const a = randInt(rng, 2, 9);
    const m = randInt(rng, 2, 5);
    const n = randInt(rng, 2, 4);
    const correct = Math.pow(a, m) * Math.pow(a, n);
    return buildMc(
      rng,
      slot,
      `Oblicz: $${a}^{${m}} \\cdot ${a}^{${n}}$`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 5),
      v % 3 === 0 ? 3 : 2,
    );
  },
  (rng, slot, variant) => {
    void variant;
    const a = randInt(rng, 2, 12);
    const m = randInt(rng, 2, 6);
    const n = randInt(rng, 2, 5);
    const correct = Math.pow(a, m) / Math.pow(a, n);
    return buildMc(
      rng,
      slot,
      `Oblicz: $\\dfrac{${a}^{${m}}}{${a}^{${n}}}$`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 4),
      2,
    );
  },
  (rng, slot, v) => {
    const n = pick(rng, [2, 3, 4]);
    const base = randInt(rng, 2, 6);
    const inner = Math.pow(base, n);
    const correct = Math.pow(inner, 2);
    return buildMc(
      rng,
      slot,
      `Oblicz: $(${base}^{${n}})^2$`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 10),
      v % 2 ? 2 : 1,
    );
  },
];

// --- Logarytmy ---
const genLogarytmy: GenFn[] = [
  (rng, slot) => {
    const a = pick(rng, [2, 3, 5, 10]);
    const x = Math.pow(a, randInt(rng, 2, 5));
    return buildMc(
      rng,
      slot,
      `Oblicz: $\\log_{${a}} ${x}$`,
      fmtNum(Math.log(x) / Math.log(a)),
      wrongNumeric(rng, Math.log(x) / Math.log(a), 2),
      2,
    );
  },
  (rng, slot) => {
    const correct = randInt(rng, 2, 5);
    const base = 2;
    const x = Math.pow(base, correct);
    return buildMc(
      rng,
      slot,
      `Jeśli $\\log_2 ${x} = k$, to $k$ równa się:`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 1),
      1,
    );
  },
];

// --- Procenty ---
const genProcenty: GenFn[] = [
  (rng, slot, v) => {
    const p = pick(rng, [10, 15, 20, 25, 30, 40, 50]);
    const n = randInt(rng, 40, 400);
    const correct = (n * p) / 100;
    const hard = slot.exam_type === "matura_podstawowa" && v % 4 === 0;
    const answer = hard ? n * (1 + p / 100) : correct;
    return buildMc(
      rng,
      slot,
      hard
        ? `Cena ${n} zł podwyższona o ${p}% wynosi (zł):`
        : `Ile wynosi ${p}% z liczby ${n}?`,
      fmtNum(answer),
      wrongNumeric(rng, answer, Math.max(2, Math.round(n * 0.05))),
      hard ? 3 : 2,
    );
  },
  (rng, slot) => {
    const start = randInt(rng, 80, 500);
    const p = pick(rng, [10, 20, 25]);
    const correct = start * (1 - p / 100);
    return buildMc(
      rng,
      slot,
      `Po obniżce o ${p}% cena ${start} zł wynosi (zł):`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 15),
      2,
    );
  },
];

// --- Wyrażenia algebraiczne ---
const genWyrazenia: GenFn[] = [
  (rng, slot) => {
    const a = randInt(rng, 1, 5);
    const b = randInt(rng, 1, 6);
    const correct = 2 * a + 3 * b;
    return buildMc(
      rng,
      slot,
      `Oblicz wartość wyrażenia $2a+3b$ dla $a=${a}$, $b=${b}$.`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 3),
      1,
    );
  },
  (rng, slot) => {
    const x = randInt(rng, 2, 7);
    const correct = x * x - 4;
    return buildMc(
      rng,
      slot,
      `Oblicz $x^2-4$ dla $x=${x}$.`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 5),
      2,
    );
  },
  (rng, slot) => {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 2, 9);
    const correct = `${a + b}x`;
    return buildMc(
      rng,
      slot,
      `Uprość: $${a}x+${b}x$`,
      correct,
      [`${a}x`, `${b}x`, `${a + b + 1}x`],
      1,
    );
  },
];

// --- Równania liniowe ---
const genRownaniaLiniowe: GenFn[] = [
  (rng, slot) => {
    const x = randInt(rng, 2, 12);
    const a = randInt(rng, 2, 7);
    const b = randInt(rng, 1, 15);
    const c = a * x + b;
    return buildMc(
      rng,
      slot,
      `Rozwiąż równanie: $${a}x+${b}=${c}$`,
      fmtNum(x),
      wrongNumeric(rng, x, 2),
      2,
    );
  },
  (rng, slot) => {
    const x = randInt(rng, -6, 9);
    const k = randInt(rng, 2, 5);
    const c = k * x;
    return buildMc(
      rng,
      slot,
      `Rozwiąż: $${k}x=${c}$`,
      fmtNum(x),
      wrongNumeric(rng, x, 3),
      1,
    );
  },
];

// --- Układy równań ---
const genUklady: GenFn[] = [
  (rng, slot) => {
    const x = randInt(rng, 1, 6);
    const y = randInt(rng, 1, 6);
    return buildMc(
      rng,
      slot,
      `Układ $\\begin{cases}x+y=${x + y}\\\\ x-y=${x - y}\\end{cases}$. Wartość $x$ to:`,
      fmtNum(x),
      wrongNumeric(rng, x, 2),
      3,
    );
  },
];

// --- Funkcja liniowa ---
const genFunkcjaLiniowa: GenFn[] = [
  (rng, slot) => {
    const m = randInt(rng, -4, 5) || 2;
    const b = randInt(rng, -5, 8);
    const x = randInt(rng, 1, 6);
    const correct = m * x + b;
    return buildMc(
      rng,
      slot,
      `Dla $f(x)=${m}x+${b}$ oblicz $f(${x})$.`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 4),
      2,
    );
  },
  (rng, slot) => {
    const m = randInt(rng, -5, 5) || 1;
    const b = randInt(rng, -8, 8);
    return buildMc(
      rng,
      slot,
      `Wskaż współczynnik kierunkowy prostej $y=${m}x${b >= 0 ? "+" : ""}${b}$.`,
      fmtNum(m),
      wrongNumeric(rng, m, 2),
      1,
    );
  },
];

// --- Funkcja kwadratowa ---
const genFunkcjaKwadratowa: GenFn[] = [
  (rng, slot) => {
    const x = randInt(rng, -4, 5);
    const correct = x * x - 2 * x + 1;
    return buildMc(
      rng,
      slot,
      `Oblicz $f(${x})$ dla $f(x)=x^2-2x+1$.`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 6),
      2,
    );
  },
  (rng, slot) => {
    const p = randInt(rng, 1, 4);
    const q = randInt(rng, -3, 3);
    const sum = -p - q;
    return buildMc(
      rng,
      slot,
      `Suma pierwiastków równania $x^2-${sum}x+${p * q}=0$ (wzór Viete'a) wynosi:`,
      fmtNum(sum),
      wrongNumeric(rng, sum, 2),
      3,
    );
  },
];

// --- Planimetria ---
const genPlanimetria: GenFn[] = [
  (rng, slot) => {
    const a = randInt(rng, 3, 12);
    const b = randInt(rng, 3, 12);
    const correct = (a * b) / 2;
    return buildMc(
      rng,
      slot,
      `Pole trójkąta o podstawie ${a} i wysokości ${b} (do tej podstawy) wynosi:`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 4),
      2,
    );
  },
  (rng, slot) => {
    const a = randInt(rng, 5, 13);
    const b = randInt(rng, 5, 13);
    const c = Math.sqrt(a * a + b * b);
    return buildMc(
      rng,
      slot,
      `Trójkąt prostokątny ma przyprostokątne ${a} i ${b}. Długość przeciwprostokątnej to (w przybliżeniu do 1 miejsca po przecinku):`,
      fmtNum(Math.round(c * 10) / 10),
      wrongNumeric(rng, c, 3),
      2,
    );
  },
];

// --- Stereometria ---
const genStereometria: GenFn[] = [
  (rng, slot, v) => {
    const a = 2 + (v % 40);
    const correct = 6 * a * a;
    return buildMc(
      rng,
      slot,
      `Pole całkowitej powierzchni sześcianu o krawędzi ${a} wynosi:`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 12),
      2,
    );
  },
  (rng, slot, v) => {
    const r = 2 + (v % 30);
    const correct = (4 / 3) * 3.14 * r * r * r;
    return buildMc(
      rng,
      slot,
      `Objętość kuli o promieniu ${r} (użyj $\\pi \\approx 3{,}14$) wynosi (zaokrąglij do całości):`,
      fmtNum(Math.round(correct)),
      wrongNumeric(rng, Math.round(correct), 20),
      3,
    );
  },
];

// --- Geometria analityczna ---
const genGeoAnalityczna: GenFn[] = [
  (rng, slot) => {
    const x1 = randInt(rng, -5, 5);
    const y1 = randInt(rng, -5, 5);
    const x2 = randInt(rng, -5, 5);
    const y2 = randInt(rng, -5, 5);
    const correct = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return buildMc(
      rng,
      slot,
      `Odległość punktów $A(${x1},${y1})$ i $B(${x2},${y2})$ wynosi (w przybliżeniu do 1 miejsca po przecinku):`,
      fmtNum(Math.round(correct * 10) / 10),
      wrongNumeric(rng, Math.round(correct * 10) / 10, 0.8),
      3,
    );
  },
];

// --- Prawdopodobieństwo ---
const genPrawdopodobienstwo: GenFn[] = [
  (rng, slot) => {
    const favorable = randInt(rng, 1, 3);
    const total = randInt(rng, favorable + 2, 10);
    const g = gcd(favorable, total);
    const correct = `${favorable / g}/${total / g}`;
    return buildMc(
      rng,
      slot,
      `Losujemy kulę z ${total} kul, z czego ${favorable} są czerwone. Prawdopodobieństwo czerwonej to:`,
      correct,
      [`${favorable}/${total + 1}`, `${favorable + 1}/${total}`, `${total - favorable}/${total}`],
      2,
    );
  },
  (rng, slot, v) => {
    const sides = 6 + 2 * (v % 10);
    return buildMc(
      rng,
      slot,
      `Rzut symetryczną kostką ${sides}-ścienną. Prawdopodobieństwo uzyskania liczby parzystej to:`,
      "1/2",
      ["1/3", "2/3", "1/6"],
      1,
    );
  },
];

// --- Statystyka ---
const genStatystyka: GenFn[] = [
  (rng, slot) => {
    const nums = Array.from({ length: 5 }, () => randInt(rng, 2, 12));
    const correct = nums.reduce((s, n) => s + n, 0) / nums.length;
    return buildMc(
      rng,
      slot,
      `Średnia arytmetyczna liczb ${nums.join(", ")} wynosi (w przybliżeniu do 1 miejsca po przecinku):`,
      fmtNum(Math.round(correct * 10) / 10),
      wrongNumeric(rng, Math.round(correct * 10) / 10, 2),
      2,
    );
  },
  (rng, slot) => {
    const sorted = Array.from({ length: 5 }, () => randInt(rng, 2, 12)).sort(
      (a, b) => a - b,
    );
    const correct = sorted[2]!;
    return buildMc(
      rng,
      slot,
      `Mediana zbioru ${sorted.join(", ")} to:`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 2),
      1,
    );
  },
];

// --- Ułamki (8 klasa) ---
const genUlamki: GenFn[] = [
  (rng, slot) => {
    const n1 = randInt(rng, 1, 5);
    const d1 = randInt(rng, n1 + 1, 9);
    const n2 = randInt(rng, 1, 4);
    const d2 = randInt(rng, n2 + 1, 8);
    const correct = n1 / d1 + n2 / d2;
    return buildMc(
      rng,
      slot,
      `Oblicz: $\\dfrac{${n1}}{${d1}}+\\dfrac{${n2}}{${d2}}$ (wynik jako ułamek dziesiętny):`,
      fmtNum(Math.round(correct * 100) / 100),
      wrongNumeric(rng, Math.round(correct * 100) / 100, 0.25),
      2,
    );
  },
];

// --- Pola figur ---
const genPolaFigur: GenFn[] = [
  (rng, slot) => {
    const a = randInt(rng, 3, 11);
    const correct = a * a;
    return buildMc(
      rng,
      slot,
      `Pole kwadratu o boku ${a} wynosi:`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 6),
      1,
    );
  },
  (rng, slot) => {
    const a = randInt(rng, 4, 10);
    const b = randInt(rng, 3, 9);
    return buildMc(
      rng,
      slot,
      `Pole prostokąta o bokach ${a} i ${b} wynosi:`,
      fmtNum(a * b),
      wrongNumeric(rng, a * b, 5),
      1,
    );
  },
];

// --- Obwody / kąty ---
const genObwody: GenFn[] = [
  (rng, slot, v) => {
    const a = 3 + (v % 30);
    return buildMc(
      rng,
      slot,
      `Obwód kwadratu o boku ${a} wynosi:`,
      fmtNum(4 * a),
      wrongNumeric(rng, 4 * a, 4),
      1,
    );
  },
];

const genKaty: GenFn[] = [
  (rng, slot) => {
    const alpha = randInt(rng, 30, 70);
    const correct = 180 - alpha - 90;
    return buildMc(
      rng,
      slot,
      `W trójkącie prostokątnym jeden ostry kąt ma ${alpha}°. Drugi ostry kąt ma:`,
      `${correct}°`,
      [`${correct + 10}°`, `${correct - 10}°`, `90°`],
      2,
    );
  },
];

// --- Wykresy / tabele ---
const genWykresy: GenFn[] = [
  (rng, slot) => {
    const m = 2;
    const x = randInt(rng, 0, 24);
    const correct = m * x;
    return buildMc(
      rng,
      slot,
      `Funkcja liniowa na wykresie przechodzi przez $(0,0)$ i $(3,6)$. Dla $x=${x}$ wartość $y$ to:`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 3),
      2,
    );
  },
];

// --- Średnia / diagramy (8) ---
const genSrednia: GenFn[] = [
  (rng, slot) => {
    const a = randInt(rng, 4, 20);
    const b = randInt(rng, 4, 20);
    const c = randInt(rng, 4, 20);
    const correct = (a + b + c) / 3;
    return buildMc(
      rng,
      slot,
      `Średnia ocen ${a}, ${b} i ${c} wynosi (w przybliżeniu do 1 miejsca po przecinku):`,
      fmtNum(Math.round(correct * 10) / 10),
      wrongNumeric(rng, correct, 1),
      1,
    );
  },
];

const genDiagramy: GenFn[] = [
  (rng, slot) => {
    const total = 100 * randInt(rng, 1, 5);
    const p = pick(rng, [10, 20, 25, 30, 40, 50, 60, 75]);
    return buildMc(
      rng,
      slot,
      `W diagramie kołowym ${p}% uczniów wybrało matematykę. Ile to uczniów przy ${total} uczniach?`,
      fmtNum((total * p) / 100),
      wrongNumeric(rng, (total * p) / 100, 10),
      2,
    );
  },
];

// --- Równania (8 klasa) ---
const genRownania8: GenFn[] = [
  (rng, slot) => {
    const x = randInt(rng, 2, 15);
    const b = randInt(rng, 1, 20);
    const c = x + b;
    return buildMc(
      rng,
      slot,
      `Rozwiąż: $x+${b}=${c}$`,
      fmtNum(x),
      wrongNumeric(rng, x, 3),
      1,
    );
  },
];

export const GENERATORS: Record<string, GenFn[]> = {
  potegi: genPotegi,
  logarytmy: genLogarytmy,
  procenty: genProcenty,
  wyrazenia_algebraiczne: genWyrazenia,
  rownania_liniowe: genRownaniaLiniowe,
  uklady_rownan: genUklady,
  funkcja_liniowa: genFunkcjaLiniowa,
  funkcja_kwadratowa: genFunkcjaKwadratowa,
  planimetria: genPlanimetria,
  stereometria: genStereometria,
  geometria_analityczna: genGeoAnalityczna,
  prawdopodobienstwo: genPrawdopodobienstwo,
  statystyka: genStatystyka,
  ulamki: genUlamki,
  pola_figur: genPolaFigur,
  obwody: genObwody,
  katy: genKaty,
  wykresy: genWykresy,
  srednia: genSrednia,
  diagramy: genDiagramy,
  rownania: genRownania8,
};

export const FALLBACK: GenFn[] = [
  (rng, slot, v) => {
    const a = randInt(rng, 10, 99);
    const b = randInt(rng, 2, 9);
    const correct = a + b;
    return buildMc(
      rng,
      slot,
      `Oblicz: ${a} + ${b}`,
      fmtNum(correct),
      wrongNumeric(rng, correct, 5),
      v % 3 === 0 ? 2 : 1,
    );
  },
];

export function generateTaskDraft(
  slot: SeedTopicSlot,
  variantIndex: number,
): TaskDraft {
  const list = GENERATORS[slot.topic];
  if (list && list.length > 0) {
    let h = 0;
    for (const c of `${slot.exam_type}/${slot.category}/${slot.topic}`) {
      h = (h * 31 + c.charCodeAt(0)) >>> 0;
    }
    const rng = mulberry32((variantIndex + 1) * 1_000_003 + h);
    const gen = list[variantIndex % list.length]!;
    return gen(rng, slot, variantIndex);
  }
  return generateParametricTask(slot, variantIndex);
}
