import {
  closedFromTopic,
  closedNumber,
  closedText,
  int,
  lin,
  num,
  open,
  pick,
  randInt,
  shuffle,
  trueFalse,
  zl,
} from "@/lib/sprawdziany/draft";
import type { Rng, SheetChapter } from "@/lib/sprawdziany/types";

const deg = (n: number) => `${n}°`;
const signed = (n: number) => (n < 0 ? `(${n})` : String(n));
const TF_PROMPT =
  "Oceń, czy podane zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe, albo F, jeśli jest fałszywe.";

/* ---------- Równania (klasa 7) ---------- */

const checkSolution = (rng: Rng) => {
  const statements = [0, 1].map(() => {
    const k = randInt(rng, -5, 5, [0]);
    const a = int(rng, 2, 6);
    const b = randInt(rng, -8, 8, [0]);
    const exact = a * k + b;
    const rhs = rng() < 0.5 ? exact : exact + pick(rng, [-2, -1, 1, 2]);
    const truth = exact === rhs;
    return {
      text: `Liczba ${k} jest rozwiązaniem równania ${lin(a, b)} = ${rhs}.`,
      truth,
      step: `L = ${a} · ${signed(k)} ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${exact}, P = ${rhs}; ${truth ? "L = P, więc prawda" : "L ≠ P, więc fałsz"}`,
    };
  });
  return trueFalse({
    prompt: TF_PROMPT,
    statements: statements.map(({ text, truth }) => ({ text, truth })),
    solution: statements.map((s) => s.step),
  });
};

const solveSimple = (rng: Rng) => {
  const xa = randInt(rng, -6, 9, [0]);
  const a1 = int(rng, 2, 9);
  const b1 = randInt(rng, -9, 9, [0]);
  const r1 = a1 * xa + b1;

  const xb = randInt(rng, -6, 8, [0]);
  const q = int(rng, 2, 6);
  const p = int(rng, 2, 9);
  const r2 = p - q * xb;

  const xc = randInt(rng, -5, 8, [0]);
  const a3 = int(rng, 4, 9);
  const c3 = int(rng, 1, a3 - 2);
  const b3 = randInt(rng, -8, 8, [0]);
  const d3 = (a3 - c3) * xc + b3;

  return open({
    points: 3,
    prompt: "Rozwiąż równania.",
    parts: [
      `a) ${lin(a1, b1)} = ${r1}`,
      `b) ${p} - ${q}x = ${r2}`,
      `c) ${lin(a3, b3)} = ${lin(c3, d3)}`,
    ],
    key: `a) x = ${xa}, b) x = ${xb}, c) x = ${xc}`,
    scheme: [
      { points: 1, text: `a) x = ${xa}.` },
      { points: 1, text: `b) x = ${xb}.` },
      { points: 1, text: `c) x = ${xc}.` },
    ],
    solution: [
      `a) ${a1}x = ${r1 - b1}, x = ${xa}`,
      `b) -${q}x = ${r2 - p}, x = ${xb}`,
      `c) ${a3 - c3}x = ${d3 - b3}, x = ${xc}`,
    ],
  });
};

function lcm(a: number, b: number) {
  const g = (function gcd(x: number, y: number): number {
    return y === 0 ? x : gcd(y, x % y);
  })(a, b);
  return (a * b) / g;
}

const solveBrackets = (rng: Rng) => {
  const xa = randInt(rng, -6, 6, [0]);
  const k = int(rng, 2, 4);
  const m = int(rng, 1, 5);
  const na = (k - 1) * xa + k * m;

  const xb = randInt(rng, -4, 6, [0]);
  const q = int(rng, 1, 4);
  const s = int(rng, 1, 4);
  const r = int(rng, 1, 5);
  const p = int(rng, 2, 9);
  const tb = p + r - (q + s) * xb;

  let m3 = 2;
  let l3 = 4;
  let n3 = 1;
  for (let i = 0; i < 100; i++) {
    [m3, l3] = pick(rng, [
      [2, 4],
      [3, 6],
      [3, 4],
      [2, 5],
      [4, 6],
    ] as const);
    n3 = int(rng, 1, 8);
    if ((n3 * m3 * l3) % (l3 - m3) === 0) break;
  }
  const xc = (n3 * m3 * l3) / (l3 - m3);
  const big = lcm(m3, l3);

  return open({
    points: 3,
    prompt: "Rozwiąż równania.",
    parts: [
      `a) ${k}(x + ${m}) = ${lin(1, na)}`,
      `b) ${p} - (${lin(q, -r)}) = ${lin(s, tb)}`,
      `c) x/${m3} - ${n3} = x/${l3}`,
    ],
    key: `a) x = ${xa}, b) x = ${xb}, c) x = ${xc}`,
    scheme: [
      { points: 1, text: `a) Poprawne opuszczenie nawiasu i wynik x = ${xa}.` },
      { points: 1, text: `b) Poprawna zmiana znaków po minusie przed nawiasem i wynik x = ${xb}.` },
      { points: 1, text: `c) Pomnożenie obu stron przez ${big} i wynik x = ${xc}.` },
    ],
    solution: [
      `a) ${k}x + ${k * m} = x + ${na}, ${k - 1}x = ${na - k * m}, x = ${xa}`,
      `b) ${p} - ${q}x + ${r} = ${s}x + ${tb}, ${p + r - tb} = ${q + s}x, x = ${xb}`,
      `c) mnożymy przez ${big}: ${big / m3}x - ${n3 * big} = ${big / l3}x, ${big / m3 - big / l3}x = ${n3 * big}, x = ${xc}`,
    ],
  });
};

const identityOrContradiction = (rng: Rng) => {
  const k = int(rng, 2, 5);
  const m = int(rng, 1, 6);
  const n = randInt(rng, 1, 7, [m]);
  const identity =
    rng() < 0.5
      ? `${k}(x + ${m}) = ${k}x + ${k * m}`
      : `${k}x - ${k * m} = ${k}(x - ${m})`;
  return closedText(rng, {
    prompt: "Które z podanych równań ma nieskończenie wiele rozwiązań?",
    correct: identity,
    wrongs: [
      `${k}x + ${m} = ${k}x + ${n}`,
      `${k}x + ${m} = x + ${n}`,
      `${k + 1}x - ${m} = ${k}x + ${n}`,
    ],
    solution: [
      "Równanie tożsamościowe po uproszczeniu daje prawdziwą równość bez niewiadomej.",
      `W pozostałych równaniach po uproszczeniu otrzymujemy jedno rozwiązanie albo sprzeczność.`,
    ],
  });
};

const proportions = (rng: Rng) => {
  const c = pick(rng, [2, 3, 4, 5]);
  const m1 = int(rng, 2, 5);
  const a = c * m1;
  const b = int(rng, 2, 7);
  const x1 = m1 * b;

  const e = pick(rng, [2, 3, 4, 5]);
  const m2 = int(rng, 2, 5);
  const d = e * m2;
  const f = int(rng, 2, 7);
  const x2 = m2 * f;
  return open({
    points: 2,
    prompt: "Rozwiąż proporcje.",
    parts: [`a) x/${a} = ${b}/${c}`, `b) ${d}/x = ${e}/${f}`],
    key: `a) x = ${x1}, b) x = ${x2}`,
    scheme: [
      { points: 1, text: `a) Mnożenie na krzyż: ${c}x = ${a * b}, x = ${x1}.` },
      { points: 1, text: `b) Mnożenie na krzyż: ${e}x = ${d * f}, x = ${x2}.` },
    ],
    solution: [
      `a) ${c} · x = ${a} · ${b}, x = ${x1}`,
      `b) ${e} · x = ${d} · ${f}, x = ${x2}`,
    ],
  });
};

const FORMULAS = [
  { task: "s = v · t, wyznacz v", key: "v = s/t", step: "dzielimy obie strony przez t" },
  { task: "P = 2a + 2b, wyznacz a", key: "a = (P - 2b)/2", step: "odejmujemy 2b, dzielimy przez 2" },
  { task: "v = v₀ + a · t, wyznacz t", key: "t = (v - v₀)/a", step: "odejmujemy v₀, dzielimy przez a" },
  { task: "P = a · h / 2, wyznacz h", key: "h = 2P/a", step: "mnożymy przez 2, dzielimy przez a" },
  { task: "U = R · I, wyznacz R", key: "R = U/I", step: "dzielimy obie strony przez I" },
  { task: "Pc = 2ab + 2ac + 2bc, wyznacz c", key: "c = (Pc - 2ab)/(2a + 2b)", step: "przenosimy 2ab, wyłączamy c" },
];

const rearrangeFormula = (rng: Rng) => {
  const [f1, f2] = shuffle(rng, FORMULAS);
  return open({
    points: 2,
    prompt: "Wyznacz wskazaną wielkość ze wzoru.",
    parts: [`a) ${f1.task}`, `b) ${f2.task}`],
    key: `a) ${f1.key}, b) ${f2.key}`,
    scheme: [
      { points: 1, text: `a) ${f1.key}.` },
      { points: 1, text: `b) ${f2.key}.` },
    ],
    solution: [`a) ${f1.step}: ${f1.key}`, `b) ${f2.step}: ${f2.key}`],
  });
};

const CONTEXTS = [
  { a: "zeszyt", b: "długopis", pa: "zeszyty", pb: "długopisy", ga: "zeszytu" },
  { a: "bułka", b: "sok", pa: "bułki", pb: "soki", ga: "bułki" },
  { a: "ciastko", b: "sok", pa: "ciastka", pb: "soki", ga: "ciastka" },
];

const wordProblemPrices = (rng: Rng) => {
  const ctx = pick(rng, CONTEXTS);
  const x = int(rng, 2, 6);
  const d = int(rng, 1, 4);
  const n1 = int(rng, 2, 4);
  const n2 = int(rng, 2, 4);
  const total = n1 * x + n2 * (x + d);
  return open({
    points: 3,
    prompt: `Za ${n1} ${ctx.pa} i ${n2} ${ctx.pb} zapłacono ${zl(total)}. ${ctx.b[0].toUpperCase()}${ctx.b.slice(1)} jest o ${zl(d)} droższy od ${ctx.ga}. Ułóż równanie i oblicz, ile kosztuje ${ctx.a}, a ile ${ctx.b}.`,
    key: `${ctx.a[0].toUpperCase()}${ctx.a.slice(1)} kosztuje ${zl(x)}, ${ctx.b} ${zl(x + d)}.`,
    scheme: [
      { points: 1, text: `Oznaczenie ceny: x - cena (${ctx.a}), x + ${d} - cena (${ctx.b}).` },
      { points: 1, text: `Ułożenie równania ${n1}x + ${n2}(x + ${d}) = ${total} i jego rozwiązanie x = ${x}.` },
      { points: 1, text: `Podanie obu cen z jednostką.` },
    ],
    solution: [
      `x - cena (${ctx.a}), x + ${d} - cena (${ctx.b})`,
      `${n1}x + ${n2}(x + ${d}) = ${total}`,
      `${n1 + n2}x + ${n2 * d} = ${total}, ${n1 + n2}x = ${total - n2 * d}, x = ${x}`,
      `${ctx.a}: ${zl(x)}, ${ctx.b}: ${zl(x + d)}`,
    ],
  });
};

const triangleEquation = (rng: Rng) => {
  const k = int(rng, 2, 3);
  let x = int(rng, 20, 40);
  while (180 - (1 + k) * x < 30) x -= 1;
  const c = 180 - (1 + k) * x;
  return open({
    points: 3,
    prompt:
      "Miary kątów trójkąta przedstawiono na rysunku. Ułóż równanie, oblicz x i podaj miary wszystkich kątów tego trójkąta.",
    figure: { kind: "triangle", angles: ["x", `${k}x`, deg(c)] },
    key: `x = ${x}°, kąty: ${deg(x)}, ${deg(k * x)}, ${deg(c)}`,
    scheme: [
      { points: 1, text: `Ułożenie równania x + ${k}x + ${c}° = 180°.` },
      { points: 1, text: `Rozwiązanie równania: x = ${x}°.` },
      { points: 1, text: `Podanie miar wszystkich kątów.` },
    ],
    solution: [
      `x + ${k}x + ${c}° = 180°`,
      `${k + 1}x = ${180 - c}°, x = ${x}°`,
      `Kąty: ${deg(x)}, ${deg(k * x)}, ${deg(c)}`,
    ],
  });
};

const numberProblem = (rng: Rng) => {
  const m = pick(rng, [2, 3]);
  let p = int(rng, 2, 9);
  const q = int(rng, 2, 9);
  if (m === 3 && (p + q) % 2 !== 0) p += 1;
  const x = (m * (p + q)) / (m - 1);
  const word = m === 2 ? "Połowa" : "Trzecia część";
  return open({
    points: 2,
    prompt: `${word} pewnej liczby powiększona o ${p} jest równa tej liczbie zmniejszonej o ${q}. Ułóż równanie i znajdź tę liczbę.`,
    key: `Szukana liczba: ${x}`,
    scheme: [
      { points: 1, text: `Ułożenie równania x/${m} + ${p} = x - ${q}.` },
      { points: 1, text: `Rozwiązanie: x = ${x}.` },
    ],
    solution: [
      `x/${m} + ${p} = x - ${q}`,
      `mnożymy przez ${m}: x + ${m * p} = ${m}x - ${m * q}`,
      `${m - 1}x = ${m * (p + q)}, x = ${x}`,
    ],
  });
};

const priceProportion = (rng: Rng) => {
  const kg = pick(rng, [2, 4, 5]);
  const price = pick(rng, [3, 4, 5, 6, 7, 8, 3.5, 4.5]);
  const total = kg * price;
  const want = pick(rng, [3, 6, 7, 8, 10].filter((v) => v !== kg));
  const item = pick(rng, ["jabłek", "gruszek", "ziemniaków", "mąki"]);
  return open({
    points: 2,
    prompt: `${kg} kg ${item} kosztuje ${zl(total)}. Za pomocą proporcji oblicz, ile kosztuje ${want} kg ${item}.`,
    key: zl(price * want),
    scheme: [
      { points: 1, text: `Zapisanie proporcji ${kg}/${num(total)} = ${want}/x lub równoważnej.` },
      { points: 1, text: `Obliczenie x = ${num(price * want)} zł.` },
    ],
    solution: [
      `${kg} kg - ${zl(total)}, ${want} kg - x`,
      `${kg} · x = ${want} · ${num(total)}, x = ${num(price * want)} zł`,
    ],
  });
};

export const ROWNANIA_CHAPTER: SheetChapter = {
  id: "rownania",
  schoolClass: 7,
  title: "Równania",
  description:
    "Sprawdzanie rozwiązań, równania z niewiadomą po obu stronach, z nawiasami i ułamkami, proporcje, przekształcanie wzorów, zadania tekstowe.",
  durationMin: 45,
  slots: [
    checkSolution,
    solveSimple,
    solveBrackets,
    identityOrContradiction,
    proportions,
    rearrangeFormula,
    wordProblemPrices,
    triangleEquation,
    numberProblem,
    priceProportion,
  ],
};

/* ---------- Kąty i trójkąty (klasa 7) ---------- */

const thirdAngle = (rng: Rng) => {
  const a = int(rng, 30, 80);
  const b = int(rng, 30, 80);
  return closedNumber(rng, {
    prompt: "Ile wynosi miara kąta x w trójkącie przedstawionym na rysunku?",
    figure: { kind: "triangle", angles: [deg(a), deg(b), "x"] },
    correct: 180 - a - b,
    wrongs: [360 - a - b, 180 - a, 90 - a - b + 90],
    format: deg,
    solution: [`x = 180° - ${a}° - ${b}° = ${180 - a - b}°`],
  });
};

const baseAngle = (rng: Rng) => {
  const apex = pick(rng, [30, 40, 50, 70, 80, 100, 110]);
  return closedNumber(rng, {
    prompt:
      "Trójkąt na rysunku jest równoramienny. Ile wynosi miara kąta x przy podstawie?",
    figure: {
      kind: "isosceles",
      base: "",
      arm: "",
      apexAngle: deg(apex),
      baseAngle: "x",
    },
    correct: (180 - apex) / 2,
    wrongs: [180 - apex, apex / 2, 90 - apex],
    format: deg,
    solution: [`x = (180° - ${apex}°) : 2 = ${(180 - apex) / 2}°`],
  });
};

const triangleFacts = (rng: Rng) => {
  const [p, q, r] = pick(rng, [
    [90, 45, 45],
    [50, 60, 70],
    [100, 40, 40],
    [110, 30, 40],
    [90, 30, 60],
    [60, 60, 60],
  ] as const);
  const kind = (a: number, b: number, c: number) => {
    const max = Math.max(a, b, c);
    return max > 90 ? "rozwartokątny" : max === 90 ? "prostokątny" : "ostrokątny";
  };
  const claimed = pick(rng, ["ostrokątny", "prostokątny", "rozwartokątny"]);
  const a = int(rng, 3, 8);
  const b = int(rng, 3, 8);
  const c = rng() < 0.5 ? a + b + int(rng, 1, 3) : int(rng, Math.abs(a - b) + 1, a + b - 1);
  const apex = pick(rng, [40, 50, 70, 80, 100]);
  const base = (180 - apex) / 2;
  const claimedBase = rng() < 0.5 ? base : base + pick(rng, [-10, -5, 5, 10]);
  const valid = a + b > c && a + c > b && b + c > a;
  const statements = shuffle(rng, [
    {
      text: `Trójkąt o kątach ${deg(p)}, ${deg(q)} i ${deg(r)} jest ${claimed}.`,
      truth: kind(p, q, r) === claimed,
      step: `Największy kąt ma ${Math.max(p, q, r)}°, więc trójkąt jest ${kind(p, q, r)}`,
    },
    {
      text: `Z odcinków o długościach ${a} cm, ${b} cm i ${c} cm można zbudować trójkąt.`,
      truth: valid,
      step: valid
        ? "Suma długości każdych dwóch odcinków jest większa od długości trzeciego"
        : "Suma dwóch krótszych odcinków nie jest większa od najdłuższego, więc trójkąta nie da się zbudować",
    },
    {
      text: `W trójkącie równoramiennym kąt między ramionami ma miarę ${deg(apex)}, więc każdy z kątów przy podstawie ma miarę ${deg(claimedBase)}.`,
      truth: claimedBase === base,
      step: `(180° - ${apex}°) : 2 = ${base}°`,
    },
  ]);
  return trueFalse({
    prompt: TF_PROMPT,
    statements: statements.map(({ text, truth }) => ({ text, truth })),
    solution: statements.map((s) => s.step),
  });
};

const exteriorAngle = (rng: Rng) => {
  const a = int(rng, 35, 75);
  const c = int(rng, 35, 75);
  return open({
    points: 2,
    prompt:
      "Na rysunku przedstawiono trójkąt ABC i kąt zewnętrzny x przy wierzchołku B. Oblicz miarę kąta x oraz miarę kąta wewnętrznego przy wierzchołku B.",
    figure: { kind: "triangle", angles: [deg(a), "", deg(c)], exterior: "x" },
    key: `kąt B = ${deg(180 - a - c)}, x = ${deg(a + c)}`,
    scheme: [
      { points: 1, text: `Obliczenie kąta B: 180° - ${a}° - ${c}° = ${180 - a - c}°.` },
      { points: 1, text: `Obliczenie x = 180° - ${180 - a - c}° = ${a + c}°.` },
    ],
    solution: [
      `∠B = 180° - ${a}° - ${c}° = ${180 - a - c}°`,
      `x = 180° - ${180 - a - c}° = ${a + c}° (kąt przyległy do kąta B)`,
    ],
  });
};

const isoscelesPerimeter = (rng: Rng) => {
  const b = int(rng, 4, 12);
  const d = int(rng, 2, 5);
  const perimeter = 3 * b + 2 * d;
  return open({
    points: 3,
    prompt: `Obwód trójkąta równoramiennego wynosi ${perimeter} cm. Ramię tego trójkąta jest o ${d} cm dłuższe od podstawy. Oblicz długości boków tego trójkąta.`,
    figure: { kind: "isosceles", base: "x", arm: `x + ${d} cm` },
    key: `podstawa ${b} cm, ramiona po ${b + d} cm`,
    scheme: [
      { points: 1, text: `Ułożenie równania x + 2(x + ${d}) = ${perimeter}.` },
      { points: 1, text: `Rozwiązanie równania: x = ${b}.` },
      { points: 1, text: `Podanie długości wszystkich boków.` },
    ],
    solution: [
      `x + 2(x + ${d}) = ${perimeter}`,
      `3x + ${2 * d} = ${perimeter}, x = ${b}`,
      `Podstawa ${b} cm, ramiona ${b + d} cm`,
    ],
  });
};

const angleRatio = (rng: Rng) => {
  const [r1, r2, r3] = pick(rng, [
    [1, 2, 3],
    [2, 3, 4],
    [2, 3, 5],
    [3, 4, 5],
    [1, 3, 5],
    [1, 1, 2],
  ] as const);
  const unit = 180 / (r1 + r2 + r3);
  return open({
    points: 3,
    prompt: `Miary kątów trójkąta pozostają w stosunku ${r1} : ${r2} : ${r3}. Oblicz miary tych kątów i określ, jakim trójkątem jest ten trójkąt (ostrokątnym, prostokątnym czy rozwartokątnym).`,
    key: `${deg(r1 * unit)}, ${deg(r2 * unit)}, ${deg(r3 * unit)}`,
    scheme: [
      { points: 1, text: `Ułożenie równania ${r1}x + ${r2}x + ${r3}x = 180°.` },
      { points: 1, text: `Obliczenie x = ${unit}° i miar kątów.` },
      { points: 1, text: `Określenie rodzaju trójkąta.` },
    ],
    solution: [
      `${r1}x + ${r2}x + ${r3}x = 180°, ${r1 + r2 + r3}x = 180°, x = ${unit}°`,
      `Kąty: ${deg(r1 * unit)}, ${deg(r2 * unit)}, ${deg(r3 * unit)}`,
    ],
  });
};

const parallelogramAngles = (rng: Rng) => {
  const alpha = pick(rng, [50, 55, 60, 65, 70, 110, 120, 125]);
  return open({
    points: 2,
    prompt: `W równoległoboku ABCD kąt przy wierzchołku A ma miarę ${deg(alpha)}. Oblicz miary pozostałych kątów tego równoległoboku.`,
    figure: { kind: "parallelogram", angle: deg(alpha) },
    key: `∠B = ${deg(180 - alpha)}, ∠C = ${deg(alpha)}, ∠D = ${deg(180 - alpha)}`,
    scheme: [
      { points: 1, text: `Kąty sąsiednie dają razem 180°: ${deg(180 - alpha)}.` },
      { points: 1, text: `Kąty przeciwległe są równe: ∠C = ${deg(alpha)}.` },
    ],
    solution: [
      `∠B = 180° - ${alpha}° = ${180 - alpha}°`,
      `∠C = ∠A = ${alpha}°, ∠D = ∠B = ${180 - alpha}°`,
    ],
  });
};

const rightTriangleAcute = (rng: Rng) => {
  const d = pick(rng, [10, 20, 30, 40, 50, 60]);
  const x = (90 - d) / 2;
  return open({
    points: 3,
    prompt: `W trójkącie prostokątnym jeden z kątów ostrych jest o ${d}° większy od drugiego. Oblicz miary kątów ostrych tego trójkąta.`,
    key: `${deg(x)} i ${deg(x + d)}`,
    scheme: [
      { points: 1, text: `Oznaczenie kątów x i x + ${d}° oraz ułożenie równania x + x + ${d}° + 90° = 180°.` },
      { points: 1, text: `Rozwiązanie równania: x = ${x}°.` },
      { points: 1, text: `Podanie obu kątów: ${deg(x)} i ${deg(x + d)}.` },
    ],
    solution: [
      `x + (x + ${d}°) + 90° = 180°`,
      `2x = ${90 - d}°, x = ${x}°`,
      `Kąty ostre: ${deg(x)} i ${deg(x + d)}`,
    ],
  });
};

export const KATY_CHAPTER: SheetChapter = {
  id: "katy-i-trojkaty",
  schoolClass: 7,
  title: "Kąty i trójkąty",
  description:
    "Suma kątów w trójkącie, trójkąt równoramienny, kąt zewnętrzny, nierówność trójkąta, kąty w równoległoboku, zadania z równaniami.",
  durationMin: 45,
  slots: [
    thirdAngle,
    baseAngle,
    triangleFacts,
    exteriorAngle,
    parallelogramAngles,
    isoscelesPerimeter,
    angleRatio,
    rightTriangleAcute,
  ],
};

/* ---------- Procenty (klasa 7) ---------- */

const percentFacts = (rng: Rng) => {
  const p1 = pick(rng, [5, 10, 20, 25, 40, 50]);
  const n1 = pick(rng, [40, 60, 80, 120, 200, 240]);
  const exact1 = (p1 * n1) / 100;
  const claim1 = rng() < 0.5 ? exact1 : exact1 + pick(rng, [-2, 2, 5]);
  const p2 = pick(rng, [10, 20, 25, 30, 40]);
  const claim2 = rng() < 0.5 ? 100 - p2 : p2;
  const statements = shuffle(rng, [
    {
      text: `${p1}% liczby ${n1} jest równe ${num(claim1)}.`,
      truth: claim1 === exact1,
      step: `${p1}% · ${n1} = ${num(exact1)}`,
    },
    {
      text: `Po obniżce ceny o ${p2}% nowa cena stanowi ${claim2}% ceny początkowej.`,
      truth: claim2 === 100 - p2,
      step: `100% - ${p2}% = ${100 - p2}%`,
    },
  ]);
  return trueFalse({
    prompt: TF_PROMPT,
    statements: statements.map(({ text, truth }) => ({ text, truth })),
    solution: statements.map((s) => s.step),
  });
};

const discount = (rng: Rng) => {
  const price = pick(rng, [40, 60, 80, 120, 150, 200, 240]);
  const p = pick(rng, [10, 20, 25, 30, 40]);
  const cut = (price * p) / 100;
  return open({
    points: 2,
    prompt: `Kurtka kosztowała ${zl(price)}. W czasie wyprzedaży jej cenę obniżono o ${p}%. Ile kosztuje teraz ta kurtka?`,
    key: zl(price - cut),
    scheme: [
      { points: 1, text: `Obliczenie obniżki: ${p}% · ${price} = ${num(cut)} zł (lub ${100 - p}% ceny).` },
      { points: 1, text: `Obliczenie nowej ceny: ${num(price - cut)} zł.` },
    ],
    solution: [
      `${p}% · ${price} zł = ${num(cut)} zł`,
      `${price} zł - ${num(cut)} zł = ${num(price - cut)} zł`,
    ],
  });
};

const originalPrice = (rng: Rng) => {
  const before = pick(rng, [40, 60, 80, 100, 120, 200]);
  const p = pick(rng, [10, 20, 25, 50]);
  const after = (before * (100 + p)) / 100;
  return open({
    points: 3,
    prompt: `Po podwyżce o ${p}% bilet kosztuje ${zl(after)}. Ile kosztował bilet przed podwyżką?`,
    key: zl(before),
    scheme: [
      { points: 1, text: `Zauważenie, że ${zl(after)} to ${100 + p}% ceny przed podwyżką.` },
      { points: 1, text: `Obliczenie 1%: ${num(after / (100 + p))} zł lub ułożenie równania ${num((100 + p) / 100)}x = ${num(after)}.` },
      { points: 1, text: `Wynik: ${zl(before)}.` },
    ],
    solution: [
      `${100 + p}% ceny = ${num(after)} zł`,
      `1% ceny = ${num(after)} zł : ${100 + p} = ${num(after / (100 + p))} zł`,
      `Cena przed podwyżką: 100 · ${num(after / (100 + p))} zł = ${num(before)} zł`,
    ],
  });
};

const twoChanges = (rng: Rng) => {
  const price = pick(rng, [50, 100, 200, 250]);
  const up = pick(rng, [10, 20, 25, 50]);
  const down = pick(rng, [10, 20, 25, 50].filter((v) => v !== up));
  const mid = (price * (100 + up)) / 100;
  const end = (mid * (100 - down)) / 100;
  return open({
    points: 3,
    prompt: `Cena towaru wynosiła ${zl(price)}. Najpierw podniesiono ją o ${up}%, a po miesiącu obniżono nową cenę o ${down}%. Oblicz cenę końcową i sprawdź, czy jest ona taka sama jak cena początkowa.`,
    key: `${zl(end)}; ${end === price ? "cena taka sama" : end > price ? "cena wyższa niż początkowa" : "cena niższa niż początkowa"}`,
    scheme: [
      { points: 1, text: `Cena po podwyżce: ${num(mid)} zł.` },
      { points: 1, text: `Cena po obniżce: ${num(end)} zł.` },
      { points: 1, text: `Porównanie z ceną początkową ${zl(price)}.` },
    ],
    solution: [
      `Po podwyżce: ${price} · ${num((100 + up) / 100)} = ${num(mid)} zł`,
      `Po obniżce: ${num(mid)} · ${num((100 - down) / 100)} = ${num(end)} zł`,
      `${num(end)} zł ${end === price ? "=" : end > price ? ">" : "<"} ${price} zł`,
    ],
  });
};

const classShare = (rng: Rng) => {
  const n = pick(rng, [20, 25, 30, 40]);
  const p = pick(rng, [20, 35, 40, 45, 60, 80].filter((v) => (n * v) % 100 === 0));
  const boys = (n * p) / 100;
  return open({
    points: 2,
    prompt: `W klasie jest ${n} uczniów. Chłopcy stanowią ${p}% wszystkich uczniów klasy. Ilu dziewcząt jest w tej klasie?`,
    key: `${num(n - boys)}`,
    scheme: [
      { points: 1, text: `Liczba chłopców: ${p}% · ${n} = ${num(boys)}.` },
      { points: 1, text: `Liczba dziewcząt: ${n} - ${num(boys)} = ${num(n - boys)}.` },
    ],
    solution: [
      `${p}% · ${n} = ${num(boys)} chłopców`,
      `${n} - ${num(boys)} = ${num(n - boys)} dziewcząt`,
    ],
  });
};

const percentOfWhole = (rng: Rng) => {
  const whole = pick(rng, [20, 25, 40, 50, 200]);
  const pct = pick(rng, [10, 20, 30, 40, 60, 80].filter((p) => ((p * whole) % 100) === 0));
  const part = (pct * whole) / 100;
  return open({
    points: 2,
    prompt: `W teście z matematyki było ${whole} zadań. Ania poprawnie rozwiązała ${part} z nich. Ile procent wszystkich zadań rozwiązała poprawnie?`,
    key: `${pct}%`,
    scheme: [
      { points: 1, text: `Zapisanie ilorazu ${part}/${whole} = ${num(part / whole)}.` },
      { points: 1, text: `Zamiana na procenty: ${pct}%.` },
    ],
    solution: [`${part} : ${whole} = ${num(part / whole)} = ${pct}%`],
  });
};

const deposit = (rng: Rng) => {
  const k = pick(rng, [500, 800, 1000, 2000]);
  const p = pick(rng, [2, 3, 4, 5]);
  const interest = (k * p) / 100;
  return open({
    points: 2,
    prompt: `Pan Adam wpłacił do banku ${zl(k)} na lokatę roczną o oprocentowaniu ${p}% w stosunku rocznym. Ile złotych odsetek otrzyma po roku (bez podatku) i jaka kwota będzie wtedy na lokacie?`,
    key: `odsetki ${zl(interest)}, na lokacie ${zl(k + interest)}`,
    scheme: [
      { points: 1, text: `Odsetki: ${p}% · ${k} = ${num(interest)} zł.` },
      { points: 1, text: `Kwota na lokacie: ${num(k + interest)} zł.` },
    ],
    solution: [
      `${p}% · ${k} zł = ${num(interest)} zł`,
      `${k} zł + ${num(interest)} zł = ${num(k + interest)} zł`,
    ],
  });
};

export const PROCENTY_CHAPTER: SheetChapter = {
  id: "procenty",
  schoolClass: 7,
  title: "Procenty",
  description:
    "Procent z liczby, jaki procent stanowi liczba, obniżki i podwyżki, obliczanie liczby z jej procentu, kolejne zmiany ceny, lokata.",
  durationMin: 45,
  slots: [
    closedFromTopic("procenty", 7, 1),
    closedFromTopic("procenty", 7, 2),
    percentFacts,
    discount,
    classShare,
    percentOfWhole,
    originalPrice,
    twoChanges,
    deposit,
  ],
};

/* ---------- Pola i obwody (klasa 6) ---------- */

const rectangleAreaPerimeter = (rng: Rng) => {
  const a = int(rng, 3, 14);
  const b = int(rng, 2, 9);
  return open({
    points: 2,
    prompt: "Oblicz obwód i pole prostokąta przedstawionego na rysunku.",
    figure: { kind: "rectangle", w: `${a} cm`, h: `${b} cm` },
    key: `obwód ${2 * (a + b)} cm, pole ${a * b} cm²`,
    scheme: [
      { points: 1, text: `Obwód: 2 · (${a} + ${b}) = ${2 * (a + b)} cm.` },
      { points: 1, text: `Pole: ${a} · ${b} = ${a * b} cm².` },
    ],
    solution: [`Obwód = 2 · (${a} + ${b}) = ${2 * (a + b)} cm`, `Pole = ${a} · ${b} = ${a * b} cm²`],
  });
};

const parallelogramArea = (rng: Rng) => {
  const base = int(rng, 4, 14);
  const h = int(rng, 3, 9);
  const side = h + int(rng, 1, 4);
  return open({
    points: 2,
    prompt: "Oblicz pole równoległoboku przedstawionego na rysunku.",
    figure: {
      kind: "parallelogram",
      base: `${base} cm`,
      side: `${side} cm`,
      height: `${h} cm`,
    },
    key: `${base * h} cm²`,
    scheme: [
      { points: 1, text: `Wybranie podstawy ${base} cm i wysokości ${h} cm (długość boku ${side} cm nie jest potrzebna).` },
      { points: 1, text: `Pole: ${base} · ${h} = ${base * h} cm².` },
    ],
    solution: [`P = a · h = ${base} · ${h} = ${base * h} cm²`],
  });
};

const triangleArea = (rng: Rng) => {
  const base = int(rng, 4, 14);
  const h = int(rng, 3, 10);
  return open({
    points: 2,
    prompt: "Oblicz pole trójkąta przedstawionego na rysunku.",
    figure: { kind: "triangle-height", base: `${base} cm`, height: `${h} cm` },
    key: `${num((base * h) / 2)} cm²`,
    scheme: [
      { points: 1, text: `Zapisanie wzoru P = ½ · a · h z danymi: ½ · ${base} · ${h}.` },
      { points: 1, text: `Pole: ${num((base * h) / 2)} cm².` },
    ],
    solution: [`P = ½ · ${base} · ${h} = ${num((base * h) / 2)} cm²`],
  });
};

const trapezoidArea = (rng: Rng) => {
  const top = int(rng, 3, 8);
  const bottom = top + int(rng, 2, 7);
  const h = int(rng, 3, 8);
  return open({
    points: 2,
    prompt: "Oblicz pole trapezu przedstawionego na rysunku.",
    figure: {
      kind: "trapezoid",
      top: `${top} cm`,
      bottom: `${bottom} cm`,
      height: `${h} cm`,
    },
    key: `${num(((top + bottom) * h) / 2)} cm²`,
    scheme: [
      { points: 1, text: `Zapisanie wzoru P = ½ · (a + b) · h z danymi: ½ · (${top} + ${bottom}) · ${h}.` },
      { points: 1, text: `Pole: ${num(((top + bottom) * h) / 2)} cm².` },
    ],
    solution: [`P = ½ · (${top} + ${bottom}) · ${h} = ${num(((top + bottom) * h) / 2)} cm²`],
  });
};

const flooring = (rng: Rng) => {
  const a = int(rng, 3, 7);
  const b = int(rng, 3, 8);
  const price = pick(rng, [6, 8, 9, 12]);
  const tiles = 4 * a * b;
  return open({
    points: 3,
    prompt: `Podłoga w pokoju ma kształt prostokąta o wymiarach ${a} m × ${b} m. Chcemy ją wyłożyć kwadratowymi płytkami o boku 50 cm. Ile płytek potrzeba i ile zapłacimy za wszystkie płytki, jeśli jedna kosztuje ${zl(price)}?`,
    key: `${tiles} płytek, koszt ${zl(tiles * price)}`,
    scheme: [
      { points: 1, text: `Obliczenie pola płytki: 0,5 m · 0,5 m = 0,25 m² (lub liczby płytek wzdłuż boków: ${2 * a} i ${2 * b}).` },
      { points: 1, text: `Liczba płytek: ${a * b} : 0,25 = ${tiles}.` },
      { points: 1, text: `Koszt: ${tiles} · ${price} = ${tiles * price} zł.` },
    ],
    solution: [
      `Pole podłogi: ${a} · ${b} = ${a * b} m²`,
      `Pole płytki: 0,5 · 0,5 = 0,25 m²`,
      `Liczba płytek: ${a * b} : 0,25 = ${tiles}`,
      `Koszt: ${tiles} · ${price} zł = ${tiles * price} zł`,
    ],
  });
};

const squareFromPerimeter = (rng: Rng) => {
  const a = int(rng, 3, 12);
  return open({
    points: 2,
    prompt: `Obwód kwadratu wynosi ${4 * a} cm. Oblicz pole tego kwadratu.`,
    key: `${a * a} cm²`,
    scheme: [
      { points: 1, text: `Długość boku: ${4 * a} : 4 = ${a} cm.` },
      { points: 1, text: `Pole: ${a} · ${a} = ${a * a} cm².` },
    ],
    solution: [`a = ${4 * a} cm : 4 = ${a} cm`, `P = ${a}² = ${a * a} cm²`],
  });
};

const UNITS = [
  { text: "1 m² = 10 000 cm²", truth: true, step: "1 m = 100 cm, więc 1 m² = 100 · 100 cm² = 10 000 cm²" },
  { text: "1 m² = 100 cm²", truth: false, step: "1 m² = 10 000 cm²" },
  { text: "1 ha = 10 000 m²", truth: true, step: "1 ha to kwadrat 100 m × 100 m" },
  { text: "1 ha = 1000 m²", truth: false, step: "1 ha = 10 000 m²" },
  { text: "1 a = 100 m²", truth: true, step: "1 a to kwadrat 10 m × 10 m" },
  { text: "1 dm² = 100 cm²", truth: true, step: "1 dm = 10 cm, więc 1 dm² = 100 cm²" },
  { text: "1 km² = 1000 m²", truth: false, step: "1 km² = 1 000 000 m²" },
];

const unitsFacts = (rng: Rng) => {
  const chosen = shuffle(rng, UNITS).slice(0, 3);
  return trueFalse({
    prompt: TF_PROMPT,
    statements: chosen.map(({ text, truth }) => ({ text, truth })),
    solution: chosen.map((u) => `${u.text}: ${u.truth ? "prawda" : "fałsz"} - ${u.step}`),
  });
};

export const POLA_6_CHAPTER: SheetChapter = {
  id: "pola-i-obwody-6",
  schoolClass: 6,
  title: "Pola i obwody",
  description:
    "Obwód i pole prostokąta i kwadratu, pole równoległoboku, trójkąta i trapezu, jednostki pola, zadania praktyczne.",
  durationMin: 45,
  slots: [
    closedFromTopic("geometria-podstawy", 6, 1),
    closedFromTopic("geometria-podstawy", 6, 2),
    unitsFacts,
    rectangleAreaPerimeter,
    parallelogramArea,
    triangleArea,
    trapezoidArea,
    squareFromPerimeter,
    flooring,
  ],
};
