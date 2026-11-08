import {
  TRIPLES,
  closedFromTopic,
  closedNumber,
  cm,
  int,
  isSquare,
  num,
  open,
  pick,
  shuffle,
  simplifySqrt,
  sup,
  trueFalse,
} from "@/lib/sprawdziany/draft";
import type { Rng, SheetChapter } from "@/lib/sprawdziany/types";

function scaledTriple(rng: Rng, maxHyp = 30): [number, number, number] {
  const [a, b, c] = pick(rng, TRIPLES);
  const k = c * 2 <= maxHyp && rng() < 0.4 ? 2 : 1;
  return rng() < 0.5 ? [a * k, b * k, c * k] : [b * k, a * k, c * k];
}

/* ---------- Twierdzenie Pitagorasa ---------- */

const hypotenuse = (rng: Rng) => {
  const [a, b, c] = scaledTriple(rng);
  return closedNumber(rng, {
    prompt:
      "Trójkąt przedstawiony na rysunku jest prostokątny. Ile wynosi długość boku oznaczonego literą c?",
    figure: { kind: "right-triangle", a: cm(a), b: cm(b), c: "c" },
    correct: c,
    wrongs: [a + b, Math.abs(a - b), a * b],
    format: cm,
    solution: [`c² = ${a}² + ${b}² = ${a * a + b * b}`, `c = ${c} cm`],
  });
};

const leg = (rng: Rng) => {
  const [a, b, c] = scaledTriple(rng);
  return closedNumber(rng, {
    prompt:
      "Trójkąt przedstawiony na rysunku jest prostokątny. Ile wynosi długość boku oznaczonego literą x?",
    figure: { kind: "right-triangle", a: cm(a), b: "x", c: cm(c) },
    correct: b,
    wrongs: [c - a, c + a, Math.round((c * c - a * a) / 2)],
    format: cm,
    solution: [`x² = ${c}² - ${a}² = ${c * c - a * a}`, `x = ${b} cm`],
  });
};

const rightTriangleTest = (rng: Rng) => {
  const picks = shuffle(rng, TRIPLES);
  const sets: [number, number, number][] = [];
  const [a1, b1, c1] = picks[0];
  sets.push([a1, b1, c1]);
  const [a2, b2, c2] = picks[1];
  sets.push(rng() < 0.5 ? [a2, b2, c2 + 1] : [a2 + 1, b2, c2]);
  const x = int(rng, 4, 8);
  sets.push(rng() < 0.5 ? [x, x + 1, x + 2] : [picks[2][0], picks[2][1], picks[2][2]]);
  const statements = shuffle(rng, sets).map(([a, b, c]) => {
    const truth = a * a + b * b === c * c;
    return {
      text: `Trójkąt o bokach długości ${a} cm, ${b} cm i ${c} cm jest prostokątny.`,
      truth,
      step: `${a}² + ${b}² = ${a * a + b * b}, ${c}² = ${c * c} - ${
        truth ? "równe, więc prawda" : "różne, więc fałsz"
      }`,
    };
  });
  return trueFalse({
    prompt:
      "Oceń, czy podane zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe, albo F, jeśli jest fałszywe.",
    statements: statements.map(({ text, truth }) => ({ text, truth })),
    solution: statements.map((s) => s.step),
  });
};

const rectangleDiagonal = (rng: Rng) => {
  let a: number;
  let b: number;
  if (rng() < 0.5) {
    [a, b] = scaledTriple(rng, 25);
  } else {
    a = int(rng, 2, 9);
    b = int(rng, 2, 9);
    if (a === b) b += 1;
  }
  const d2 = a * a + b * b;
  const d = simplifySqrt(d2);
  return open({
    points: 2,
    prompt: "Oblicz długość przekątnej prostokąta przedstawionego na rysunku.",
    figure: { kind: "rectangle", w: cm(a), h: cm(b), diagonal: "d" },
    key: `d = ${d} cm`,
    scheme: [
      { points: 1, text: `Zapisanie równania d² = ${a}² + ${b}² (twierdzenie Pitagorasa).` },
      { points: 1, text: `Obliczenie d = ${d} cm.` },
    ],
    solution: [`d² = ${a}² + ${b}² = ${d2}`, `d = ${d} cm`],
  });
};

const squareDiagonal = (rng: Rng) => {
  const a = int(rng, 2, 12);
  if (rng() < 0.5) {
    return open({
      points: 2,
      prompt: "Oblicz długość przekątnej kwadratu przedstawionego na rysunku.",
      figure: { kind: "rectangle", w: cm(a), h: cm(a), diagonal: "d" },
      key: `d = ${a}√2 cm`,
      scheme: [
        { points: 1, text: `Zapisanie równania d² = ${a}² + ${a}² = ${2 * a * a}.` },
        { points: 1, text: `Obliczenie d = ${a}√2 cm.` },
      ],
      solution: [`d² = ${a}² + ${a}² = ${2 * a * a}`, `d = ${a}√2 cm`],
    });
  }
  return open({
    points: 2,
    prompt: `Przekątna kwadratu ma długość ${a}√2 cm. Oblicz obwód tego kwadratu.`,
    key: `Obwód = ${4 * a} cm`,
    scheme: [
      { points: 1, text: `Wyznaczenie długości boku: a = ${a} cm (przekątna kwadratu to a√2).` },
      { points: 1, text: `Obliczenie obwodu 4 · ${a} = ${4 * a} cm.` },
    ],
    solution: [
      `Przekątna kwadratu wynosi a√2, więc a√2 = ${a}√2, czyli a = ${a} cm`,
      `Obwód = 4 · ${a} = ${4 * a} cm`,
    ],
  });
};

const ladder = (rng: Rng) => {
  const [a, h, l] = scaledTriple(rng, 20);
  return open({
    points: 3,
    prompt: `Drabina o długości ${l} m oparta o pionową ścianę dotyka jej na pewnej wysokości. Dolny koniec drabiny jest oddalony od ściany o ${a} m. Na jakiej wysokości drabina dotyka ściany?`,
    figure: { kind: "right-triangle", a: `${a} m`, b: "h", c: `${l} m` },
    key: `h = ${h} m`,
    scheme: [
      { points: 1, text: "Zauważenie, że ściana, ziemia i drabina tworzą trójkąt prostokątny." },
      { points: 1, text: `Zapisanie równania ${a}² + h² = ${l}².` },
      { points: 1, text: `Obliczenie h = ${h} m.` },
    ],
    solution: [
      `${a}² + h² = ${l}²`,
      `h² = ${l * l} - ${a * a} = ${h * h}`,
      `h = ${h} m`,
    ],
  });
};

const isoscelesHeight = (rng: Rng) => {
  const [m, h, c] = scaledTriple(rng, 20);
  return open({
    points: 3,
    prompt: `Podstawa trójkąta równoramiennego ma długość ${2 * m} cm, a ramię ${c} cm. Oblicz wysokość opuszczoną na podstawę oraz pole tego trójkąta.`,
    figure: {
      kind: "isosceles",
      base: cm(2 * m),
      arm: cm(c),
      height: "h",
    },
    key: `h = ${h} cm, pole = ${m * h} cm²`,
    scheme: [
      { points: 1, text: `Wysokość dzieli podstawę na dwa odcinki po ${m} cm.` },
      { points: 1, text: `Obliczenie h z równania ${m}² + h² = ${c}²: h = ${h} cm.` },
      { points: 1, text: `Obliczenie pola: ½ · ${2 * m} · ${h} = ${m * h} cm².` },
    ],
    solution: [
      `Wysokość dzieli podstawę na połowy: ${m} cm`,
      `h² = ${c}² - ${m}² = ${h * h}, h = ${h} cm`,
      `P = ½ · ${2 * m} · ${h} = ${m * h} cm²`,
    ],
  });
};

const pointDistance = (rng: Rng) => {
  const useTriple = rng() < 0.6;
  const [dx, dy] = useTriple
    ? pick(rng, [
        [3, 4],
        [4, 3],
        [6, 8],
        [5, 12],
      ] as const)
    : pick(rng, [
        [2, 3],
        [1, 4],
        [2, 5],
        [3, 5],
      ] as const);
  const x1 = int(rng, -5, 1);
  const y1 = int(rng, -4, 1);
  const x2 = x1 + dx;
  const y2 = y1 + (rng() < 0.5 ? dy : -dy);
  const d2 = dx * dx + dy * dy;
  const d = simplifySqrt(d2);
  return open({
    points: 3,
    prompt: `W układzie współrzędnych zaznaczono punkty A = (${x1}, ${y1}) i B = (${x2}, ${y2}). Oblicz długość odcinka AB.`,
    figure: {
      kind: "coordinate",
      points: [
        { label: "A", x: x1, y: y1 },
        { label: "B", x: x2, y: y2 },
      ],
      connect: true,
    },
    key: `|AB| = ${d}`,
    scheme: [
      { points: 1, text: `Odczytanie długości przyprostokątnych: ${dx} i ${dy}.` },
      { points: 1, text: `Zapisanie |AB|² = ${dx}² + ${dy}².` },
      { points: 1, text: `Obliczenie |AB| = ${d}.` },
    ],
    solution: [
      `Poziomo: |${x2} - (${x1})| = ${dx}, pionowo: |${y2} - (${y1})| = ${dy}`,
      `|AB|² = ${dx}² + ${dy}² = ${d2}`,
      `|AB| = ${d}`,
    ],
  });
};

const rhombusSide = (rng: Rng) => {
  const [p, q, s] = pick(rng, [
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [4, 3, 5],
  ] as const);
  return open({
    points: 3,
    prompt: `Przekątne rombu mają długości ${2 * p} cm i ${2 * q} cm. Oblicz długość boku i obwód tego rombu.`,
    figure: { kind: "rhombus", d1: cm(2 * p), d2: cm(2 * q), side: "a" },
    key: `a = ${s} cm, obwód = ${4 * s} cm`,
    scheme: [
      { points: 1, text: `Przekątne dzielą się na połowy i są prostopadłe: ${p} cm i ${q} cm.` },
      { points: 1, text: `a² = ${p}² + ${q}², czyli a = ${s} cm.` },
      { points: 1, text: `Obwód 4 · ${s} = ${4 * s} cm.` },
    ],
    solution: [
      `Połowy przekątnych: ${p} cm i ${q} cm`,
      `a² = ${p}² + ${q}² = ${p * p + q * q}, a = ${s} cm`,
      `Obwód = 4 · ${s} = ${4 * s} cm`,
    ],
  });
};

export const PITAGORAS_CHAPTER: SheetChapter = {
  id: "twierdzenie-pitagorasa",
  schoolClass: 8,
  title: "Twierdzenie Pitagorasa",
  description:
    "Obliczanie boków trójkąta prostokątnego, twierdzenie odwrotne, przekątne, wysokość trójkąta równoramiennego, odległość punktów, romb.",
  durationMin: 45,
  slots: [
    hypotenuse,
    leg,
    rightTriangleTest,
    rectangleDiagonal,
    squareDiagonal,
    ladder,
    isoscelesHeight,
    pointDistance,
    rhombusSide,
  ],
};

/* ---------- Bryły ---------- */

const cuboidVolume = (rng: Rng) => {
  const a = int(rng, 2, 9);
  const b = int(rng, 2, 9);
  const c = int(rng, 2, 9);
  return closedNumber(rng, {
    prompt: "Ile wynosi objętość prostopadłościanu przedstawionego na rysunku?",
    figure: { kind: "box", a: cm(a), b: cm(b), c: cm(c) },
    correct: a * b * c,
    wrongs: [2 * (a * b + b * c + a * c), a + b + c, a * b + c],
    format: (n) => `${num(n)} cm³`,
    solution: [`V = ${a} · ${b} · ${c} = ${a * b * c} cm³`],
  });
};

const cubeSurface = (rng: Rng) => {
  const a = int(rng, 2, 10);
  return closedNumber(rng, {
    prompt: "Ile wynosi pole powierzchni całkowitej sześcianu przedstawionego na rysunku?",
    figure: { kind: "box", a: cm(a), b: cm(a), c: cm(a) },
    correct: 6 * a * a,
    wrongs: [a * a * a, 4 * a * a, 12 * a, 6 * a],
    format: (n) => `${num(n)} cm²`,
    solution: [`Pc = 6 · ${a}² = ${6 * a * a} cm²`],
  });
};

const cuboidSurface = (rng: Rng) => {
  const a = int(rng, 2, 9);
  const b = int(rng, 2, 9);
  const c = int(rng, 2, 9);
  const pc = 2 * (a * b + b * c + a * c);
  const edges = 4 * (a + b + c);
  return open({
    points: 3,
    prompt:
      "Oblicz pole powierzchni całkowitej prostopadłościanu przedstawionego na rysunku oraz sumę długości wszystkich jego krawędzi.",
    figure: { kind: "box", a: cm(a), b: cm(b), c: cm(c) },
    key: `Pc = ${pc} cm², suma krawędzi = ${edges} cm`,
    scheme: [
      { points: 1, text: `Zapisanie wzoru Pc = 2(ab + bc + ac) z poprawnymi danymi.` },
      { points: 1, text: `Obliczenie Pc = ${pc} cm².` },
      { points: 1, text: `Obliczenie sumy krawędzi 4(${a} + ${b} + ${c}) = ${edges} cm.` },
    ],
    solution: [
      `Pc = 2 · (${a}·${b} + ${b}·${c} + ${a}·${c}) = 2 · ${a * b + b * c + a * c} = ${pc} cm²`,
      `Suma krawędzi = 4 · (${a} + ${b} + ${c}) = ${edges} cm`,
    ],
  });
};

const pyramidVolume = (rng: Rng) => {
  const a = int(rng, 3, 10);
  const h = pick(rng, [3, 6, 9, 12]);
  const v = (a * a * h) / 3;
  return open({
    points: 2,
    prompt:
      "Podstawą ostrosłupa przedstawionego na rysunku jest kwadrat. Oblicz objętość tego ostrosłupa.",
    figure: { kind: "pyramid", base: cm(a), height: cm(h) },
    key: `V = ${v} cm³`,
    scheme: [
      { points: 1, text: `Zapisanie wzoru V = ⅓ · ${a}² · ${h}.` },
      { points: 1, text: `Obliczenie V = ${v} cm³.` },
    ],
    solution: [`Pp = ${a}² = ${a * a} cm²`, `V = ⅓ · ${a * a} · ${h} = ${v} cm³`],
  });
};

const pyramidSurface = (rng: Rng) => {
  const a = int(rng, 4, 12);
  const hw = int(rng, 3, 12);
  const pc = a * a + 2 * a * hw;
  return open({
    points: 3,
    prompt: `Podstawą ostrosłupa prawidłowego czworokątnego jest kwadrat o boku ${a} cm. Wysokość ściany bocznej (poprowadzona z wierzchołka ostrosłupa) ma ${hw} cm. Oblicz pole powierzchni całkowitej ostrosłupa.`,
    figure: { kind: "pyramid", base: cm(a), wall: cm(hw) },
    key: `Pc = ${pc} cm²`,
    scheme: [
      { points: 1, text: `Pole podstawy ${a}² = ${a * a} cm².` },
      { points: 1, text: `Pole jednej ściany ½ · ${a} · ${hw} = ${(a * hw) / 2} cm², czterech ścian: ${2 * a * hw} cm².` },
      { points: 1, text: `Pc = ${a * a} + ${2 * a * hw} = ${pc} cm².` },
    ],
    solution: [
      `Pp = ${a}² = ${a * a} cm²`,
      `Pb = 4 · ½ · ${a} · ${hw} = ${2 * a * hw} cm²`,
      `Pc = ${a * a} + ${2 * a * hw} = ${pc} cm²`,
    ],
  });
};

const POLYGONS: Record<number, string> = {
  3: "trójkąt",
  5: "pięciokąt",
  6: "sześciokąt",
  8: "ośmiokąt",
};

const solidFacts = (rng: Rng) => {
  const ns = shuffle(rng, [3, 5, 6, 8]);
  const wrong = (truth: number) => (rng() < 0.5 ? truth : truth + pick(rng, [-2, -1, 1, 2]));
  const prism = ns[0];
  const pyramid = ns[1];
  const prism2 = ns[2];
  const facesClaim = wrong(prism + 2);
  const edgesClaim = wrong(2 * pyramid);
  const vertClaim = wrong(2 * prism2);
  const statements = shuffle(rng, [
    {
      text: `Graniastosłup, którego podstawą jest ${POLYGONS[prism]}, ma ${facesClaim} ścian.`,
      truth: facesClaim === prism + 2,
      step: `Graniastosłup ma ${prism} ścian bocznych i 2 podstawy: ${prism + 2} ścian`,
    },
    {
      text: `Ostrosłup, którego podstawą jest ${POLYGONS[pyramid]}, ma ${edgesClaim} krawędzi.`,
      truth: edgesClaim === 2 * pyramid,
      step: `Ostrosłup ma ${pyramid} krawędzi podstawy i ${pyramid} bocznych: ${2 * pyramid} krawędzi`,
    },
    {
      text: `Graniastosłup, którego podstawą jest ${POLYGONS[prism2]}, ma ${vertClaim} wierzchołków.`,
      truth: vertClaim === 2 * prism2,
      step: `Graniastosłup ma ${prism2} wierzchołków w każdej podstawie: ${2 * prism2} wierzchołków`,
    },
  ]);
  return trueFalse({
    prompt:
      "Oceń, czy podane zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe, albo F, jeśli jest fałszywe.",
    statements: statements.map(({ text, truth }) => ({ text, truth })),
    solution: statements.map((s) => s.step),
  });
};

const CUBOID_DIAGONALS = [
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [2, 4, 4, 6],
  [4, 4, 7, 9],
  [2, 6, 9, 11],
  [1, 4, 8, 9],
] as const;

const cuboidDiagonal = (rng: Rng) => {
  const [a, b, c, d] = pick(rng, CUBOID_DIAGONALS);
  const [x, y, z] = shuffle(rng, [a, b, c]);
  return open({
    points: 3,
    prompt:
      "Oblicz długość przekątnej prostopadłościanu przedstawionego na rysunku.",
    figure: { kind: "box", a: cm(x), b: cm(y), c: cm(z), diagonal: "d" },
    key: `d = ${d} cm`,
    scheme: [
      { points: 1, text: `Obliczenie przekątnej podstawy lub zapisanie d² = a² + b² + c².` },
      { points: 1, text: `d² = ${x}² + ${y}² + ${z}² = ${x * x + y * y + z * z}.` },
      { points: 1, text: `d = ${d} cm.` },
    ],
    solution: [
      `d² = ${x}² + ${y}² + ${z}² = ${x * x + y * y + z * z}`,
      `d = ${d} cm`,
    ],
  });
};

const aquarium = (rng: Rng) => {
  const [den, num_, hs] = pick(rng, [
    [4, 3, [40, 80]],
    [5, 4, [50, 100]],
  ] as const);
  const a = pick(rng, [30, 40, 50, 60]);
  const b = pick(rng, [20, 30, 40]);
  const c = pick(rng, hs);
  const litres = (a * b * ((c * num_) / den)) / 1000;
  return open({
    points: 2,
    prompt: `Akwarium ma kształt prostopadłościanu o wymiarach ${a} cm × ${b} cm × ${c} cm. Do akwarium nalano wody do ${num_}/${den} jego wysokości. Ile litrów wody znajduje się w akwarium? (1 litr = 1 dm³)`,
    key: `${num(litres)} l`,
    scheme: [
      { points: 1, text: `Obliczenie objętości wody w cm³: ${a} · ${b} · ${(c * num_) / den} = ${a * b * ((c * num_) / den)} cm³.` },
      { points: 1, text: `Zamiana na litry: ${num(litres)} l.` },
    ],
    solution: [
      `Wysokość wody = ${num_}/${den} · ${c} = ${(c * num_) / den} cm`,
      `V = ${a} · ${b} · ${(c * num_) / den} = ${a * b * ((c * num_) / den)} cm³`,
      `1000 cm³ = 1 l, więc ${num(litres)} l`,
    ],
  });
};

export const BRYLY_CHAPTER: SheetChapter = {
  id: "ostroslupy-i-graniastoslupy",
  schoolClass: 8,
  title: "Bryły: prostopadłościany i ostrosłupy",
  description:
    "Objętość i pole powierzchni, przekątna prostopadłościanu, liczba ścian i krawędzi, zamiana jednostek objętości.",
  durationMin: 45,
  slots: [
    cuboidVolume,
    cubeSurface,
    solidFacts,
    pyramidVolume,
    cuboidSurface,
    pyramidSurface,
    cuboidDiagonal,
    aquarium,
  ],
};

/* ---------- Potęgi i pierwiastki ---------- */

const powerLaws = (rng: Rng) => {
  const base = int(rng, 2, 6);
  const m = int(rng, 2, 5);
  const n = int(rng, 2, 5);
  const p = int(rng, 6, 9);
  const q = int(rng, 2, 5);
  const r = int(rng, 2, 4);
  const s = int(rng, 2, 4);
  const c1 = rng() < 0.5 ? m + n : m * n === m + n ? m + n + 1 : m * n;
  const c2 = rng() < 0.5 ? p - q : p + q;
  const c3 = rng() < 0.5 ? r * s : r + s === r * s ? r * s + 1 : r + s;
  const statements = shuffle(rng, [
    {
      text: `${base}${sup(m)} · ${base}${sup(n)} = ${base}${sup(c1)}`,
      truth: c1 === m + n,
      step: `Mnożenie potęg o tej samej podstawie: wykładniki dodajemy, ${m} + ${n} = ${m + n}`,
    },
    {
      text: `${base}${sup(p)} : ${base}${sup(q)} = ${base}${sup(c2)}`,
      truth: c2 === p - q,
      step: `Dzielenie potęg o tej samej podstawie: wykładniki odejmujemy, ${p} - ${q} = ${p - q}`,
    },
    {
      text: `(${base}${sup(r)})${sup(s)} = ${base}${sup(c3)}`,
      truth: c3 === r * s,
      step: `Potęga potęgi: wykładniki mnożymy, ${r} · ${s} = ${r * s}`,
    },
  ]);
  return trueFalse({
    prompt:
      "Oceń, czy podane równości są prawdziwe. Zaznacz P, jeśli równość jest prawdziwa, albo F, jeśli jest fałszywa.",
    statements: statements.map(({ text, truth }) => ({ text, truth })),
    solution: statements.map((x) => x.step),
  });
};

const singlePower = (rng: Rng) => {
  const base = pick(rng, [2, 3, 5]);
  const k = int(rng, 2, 4);
  const m = int(rng, 3, 5);
  const n = int(rng, 2, 4);
  const e = m + n - k;
  const value = Math.pow(base, e);
  return open({
    points: 2,
    prompt: `Zapisz w postaci jednej potęgi, a następnie oblicz wartość wyrażenia: (${base}${sup(m)} · ${base}${sup(n)}) : ${base}${sup(k)}`,
    key: `${base}${sup(e)} = ${value}`,
    scheme: [
      { points: 1, text: `Poprawne zastosowanie praw działań na potęgach: ${base}${sup(e)}.` },
      { points: 1, text: `Obliczenie wartości: ${value}.` },
    ],
    solution: [
      `${base}${sup(m)} · ${base}${sup(n)} = ${base}${sup(m + n)}`,
      `${base}${sup(m + n)} : ${base}${sup(k)} = ${base}${sup(e)} = ${value}`,
    ],
  });
};

const sqrtSimplify = (rng: Rng) => {
  const n = pick(rng, [2, 3, 5, 6, 7]);
  const k = int(rng, 2, 6);
  const m = pick(rng, [2, 3, 5]);
  const s = int(rng, 2, 4);
  return open({
    points: 2,
    prompt: "Oblicz.",
    parts: [`a) √${k * k * n}  (zapisz w postaci k√n)`, `b) √${m} · √${m * s * s}`],
    key: `a) ${k}√${n}, b) ${m * s}`,
    scheme: [
      { points: 1, text: `a) √${k * k * n} = √${k * k} · √${n} = ${k}√${n}.` },
      { points: 1, text: `b) √${m * m * s * s} = ${m * s}.` },
    ],
    solution: [
      `a) √${k * k * n} = √${k * k} · √${n} = ${k}√${n}`,
      `b) √${m} · √${m * s * s} = √${m * m * s * s} = ${m * s}`,
    ],
  });
};

const scientificNotation = (rng: Rng) => {
  const a = int(rng, 2, 9);
  const b = int(rng, 2, 9);
  const m = int(rng, 2, 6);
  const n = int(rng, 2, 6);
  const prod = a * b;
  const exp = m + n + (prod >= 10 ? 1 : 0);
  const mant = prod >= 10 ? prod / 10 : prod;
  return open({
    points: 3,
    prompt: `Oblicz iloczyn (${a} · 10${sup(m)}) · (${b} · 10${sup(n)}) i zapisz wynik w notacji wykładniczej, czyli w postaci c · 10ⁿ, gdzie 1 ≤ c < 10.`,
    key: `${num(mant)} · 10${sup(exp)}`,
    scheme: [
      { points: 1, text: `Przekształcenie: (${a} · ${b}) · 10${sup(m + n)}.` },
      { points: 1, text: `Obliczenie ${a} · ${b} = ${prod}.` },
      { points: 1, text: `Zapisanie wyniku w postaci ${num(mant)} · 10${sup(exp)}.` },
    ],
    solution: [
      `(${a} · ${b}) · (10${sup(m)} · 10${sup(n)}) = ${prod} · 10${sup(m + n)}`,
      prod >= 10
        ? `${prod} · 10${sup(m + n)} = ${num(mant)} · 10${sup(exp)}`
        : `Wynik w postaci wykładniczej: ${num(mant)} · 10${sup(exp)}`,
    ],
  });
};

const estimateAndCompare = (rng: Rng) => {
  let n = int(rng, 20, 90);
  while (isSquare(n)) n += 1;
  const lo = Math.floor(Math.sqrt(n));
  const a = int(rng, 2, 5);
  const b = int(rng, 2, 7);
  let c = int(rng, 2, 5);
  let d = int(rng, 2, 7);
  while (a * a * b === c * c * d) {
    c = int(rng, 2, 5);
    d = int(rng, 2, 7);
  }
  const left = a * a * b;
  const right = c * c * d;
  const bigger = left > right ? `${a}√${b}` : `${c}√${d}`;
  const sign = left > right ? ">" : "<";
  return open({
    points: 2,
    prompt: "Rozwiąż podane zadania.",
    parts: [
      `a) Między którymi kolejnymi liczbami całkowitymi leży liczba √${n}?`,
      `b) Porównaj liczby ${a}√${b} i ${c}√${d}. Wstaw znak <, > lub =.`,
    ],
    key: `a) między ${lo} i ${lo + 1}, b) ${a}√${b} ${sign} ${c}√${d} (większa: ${bigger})`,
    scheme: [
      { points: 1, text: `a) ${lo}² = ${lo * lo} < ${n} < ${(lo + 1) * (lo + 1)} = ${lo + 1}², więc ${lo} < √${n} < ${lo + 1}.` },
      { points: 1, text: `b) Wprowadzenie liczb pod pierwiastek: √${left} i √${right}, porównanie.` },
    ],
    solution: [
      `a) ${lo}² = ${lo * lo}, ${lo + 1}² = ${(lo + 1) * (lo + 1)}, więc ${lo} < √${n} < ${lo + 1}`,
      `b) ${a}√${b} = √${left}, ${c}√${d} = √${right}, więc ${a}√${b} ${sign} ${c}√${d}`,
    ],
  });
};

export const POTEGI_CHAPTER: SheetChapter = {
  id: "potegi-i-pierwiastki",
  schoolClass: 8,
  title: "Potęgi i pierwiastki",
  description:
    "Działania na potęgach, notacja wykładnicza, wyłączanie czynnika przed pierwiastek, szacowanie i porównywanie pierwiastków.",
  durationMin: 45,
  slots: [
    closedFromTopic("potegi-pierwiastki", 8, 1),
    closedFromTopic("potegi-pierwiastki", 8, 2),
    powerLaws,
    singlePower,
    sqrtSimplify,
    scientificNotation,
    estimateAndCompare,
  ],
};
