import {
  closedNumber,
  closedText,
  gcd,
  int,
  lin,
  open,
  pick,
  randInt,
  shuffle,
  trueFalse,
} from "@/lib/sprawdziany/draft";
import type { Rng, SheetChapter } from "@/lib/sprawdziany/types";

const TF_PROMPT =
  "Oceń, czy podane zdania są prawdziwe. Zaznacz P, jeśli zdanie jest prawdziwe, albo F, jeśli jest fałszywe.";

const signed = (n: number) => (n < 0 ? `(${n})` : String(n));
const pt = (x: number, y: number) => `(${x}, ${y})`;
const sgn = (n: number) => (n < 0 ? "-" : "+");

function frac(n: number, d: number): string {
  const g = gcd(n, d) || 1;
  const nn = n / g;
  const dd = d / g;
  return dd === 1 ? String(nn) : `${nn}/${dd}`;
}

function poly2(a: number, b: number, c: number): string {
  const parts = [`${a === 1 ? "" : a === -1 ? "-" : a}x²`];
  if (b !== 0) parts.push(`${sgn(b)} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x`);
  if (c !== 0) parts.push(`${sgn(c)} ${Math.abs(c)}`);
  return parts.join(" ");
}

/* ---------- Funkcja liniowa (liceum 1) ---------- */

const linTf = (rng: Rng) => {
  const a = randInt(rng, -4, 5, [0]);
  const b = randInt(rng, -6, 6, [0]);
  const x1 = randInt(rng, -3, 4, [0]);
  const y1 = a * x1 + b;
  const onLine = rng() < 0.5;
  const yy = onLine ? y1 : y1 + pick(rng, [-2, -1, 1, 2]);
  const claimRising = rng() < 0.5;
  const kk = rng() < 0.5 ? b : b + pick(rng, [-2, -1, 1, 2]);
  return trueFalse({
    prompt: `Dana jest funkcja f(x) = ${lin(a, b)}. ${TF_PROMPT}`,
    statements: [
      {
        text: `Punkt ${pt(x1, yy)} należy do wykresu funkcji f.`,
        truth: onLine,
      },
      {
        text: `Funkcja f jest ${claimRising ? "rosnąca" : "malejąca"}.`,
        truth: claimRising === a > 0,
      },
      {
        text: `Wykres funkcji f przecina oś Oy w punkcie ${pt(0, kk)}.`,
        truth: kk === b,
      },
    ],
    solution: [
      `f(${x1}) = ${a}·${signed(x1)} ${sgn(b)} ${Math.abs(b)} = ${y1}`,
      `Współczynnik a = ${a} jest ${a > 0 ? "dodatni" : "ujemny"}, więc funkcja jest ${a > 0 ? "rosnąca" : "malejąca"}.`,
      `Wykres przecina oś Oy w punkcie (0, b) = ${pt(0, b)}.`,
    ],
  });
};

const linZeroClosed = (rng: Rng) => {
  const a = pick(rng, [2, 3, 4, -2, -3, -4]);
  const x0 = randInt(rng, -6, 6, [0]);
  const b = -a * x0;
  return closedNumber(rng, {
    prompt: `Miejscem zerowym funkcji f(x) = ${lin(a, b)} jest liczba:`,
    correct: x0,
    wrongs: [-x0, b, a * x0],
    solution: [`${lin(a, b)} = 0, stąd x = ${-b}/${a} = ${x0}`],
  });
};

const linParamClosed = (rng: Rng) => {
  const k = randInt(rng, -6, 6, [0]);
  const b = randInt(rng, -5, 5, [0]);
  return closedText(rng, {
    prompt: `Funkcja f(x) = (m ${k >= 0 ? "-" : "+"} ${Math.abs(k)})x ${sgn(b)} ${Math.abs(b)} jest rosnąca dla:`,
    correct: `m > ${k}`,
    wrongs: [`m < ${k}`, `m > ${-k}`, `m < ${-k}`],
    solution: [
      `Funkcja liniowa jest rosnąca, gdy współczynnik kierunkowy jest dodatni: m ${k >= 0 ? "-" : "+"} ${Math.abs(k)} > 0, stąd m > ${k}.`,
    ],
  });
};

const linValues = (rng: Rng) => {
  const a = pick(rng, [2, 3, 4, -2, -3]);
  const x0 = randInt(rng, -5, 5, [0]);
  const b = -a * x0;
  const k = randInt(rng, -4, 5, [0]);
  return open({
    points: 3,
    prompt: `Dana jest funkcja liniowa f(x) = ${lin(a, b)}.`,
    parts: [
      `Oblicz f(${k}).`,
      "Wyznacz miejsce zerowe funkcji f.",
      "Podaj współrzędne punktu przecięcia wykresu funkcji f z osią Oy.",
    ],
    key: `a) f(${k}) = ${a * k + b}, b) x = ${x0}, c) ${pt(0, b)}`,
    scheme: [
      { points: 1, text: `a) f(${k}) = ${a * k + b}.` },
      { points: 1, text: `b) x = ${x0}.` },
      { points: 1, text: `c) ${pt(0, b)}.` },
    ],
    solution: [
      `a) f(${k}) = ${a}·${signed(k)} ${sgn(b)} ${Math.abs(b)} = ${a * k + b}`,
      `b) ${lin(a, b)} = 0, stąd x = ${x0}`,
      `c) f(0) = ${b}, czyli ${pt(0, b)}`,
    ],
  });
};

const linTwoPoints = (rng: Rng) => {
  const a = randInt(rng, -3, 3, [0]);
  const d = int(rng, 1, 4);
  const x1 = randInt(rng, -3, 2);
  const y1 = randInt(rng, -3, 3);
  const x2 = x1 + d;
  const y2 = y1 + a * d;
  const b = y1 - a * x1;
  return open({
    points: 4,
    prompt: `Wykres funkcji liniowej f przechodzi przez punkty A = ${pt(x1, y1)} oraz B = ${pt(x2, y2)}. Wyznacz wzór funkcji f.`,
    figure: {
      kind: "coordinate",
      points: [
        { label: "A", x: x1, y: y1 },
        { label: "B", x: x2, y: y2 },
      ],
      connect: true,
    },
    key: `f(x) = ${lin(a, b)}`,
    scheme: [
      { points: 1, text: "Zapisanie układu równań lub wzoru na współczynnik a." },
      { points: 1, text: `Obliczenie a = ${a}.` },
      { points: 1, text: `Obliczenie b = ${b}.` },
      { points: 1, text: `Zapisanie wzoru f(x) = ${lin(a, b)}.` },
    ],
    solution: [
      `a = (y₂ - y₁)/(x₂ - x₁) = (${y2} - ${signed(y1)})/(${x2} - ${signed(x1)}) = ${a}`,
      `Podstawiamy punkt A: ${y1} = ${a}·${signed(x1)} + b, stąd b = ${b}`,
      `f(x) = ${lin(a, b)}`,
    ],
  });
};

const linIntersect = (rng: Rng) => {
  const a1 = randInt(rng, -3, 4, [0]);
  const a2 = randInt(rng, -3, 4, [0, a1]);
  const x0 = randInt(rng, -5, 5);
  const y0 = randInt(rng, -6, 6);
  const b1 = y0 - a1 * x0;
  const b2 = y0 - a2 * x0;
  return open({
    points: 3,
    prompt: `Wyznacz współrzędne punktu przecięcia prostych o równaniach y = ${lin(a1, b1)} oraz y = ${lin(a2, b2)}.`,
    key: pt(x0, y0),
    scheme: [
      { points: 1, text: `Zapisanie równania ${lin(a1, b1)} = ${lin(a2, b2)}.` },
      { points: 1, text: `Obliczenie x = ${x0}.` },
      { points: 1, text: `Obliczenie y = ${y0}.` },
    ],
    solution: [
      `${lin(a1, b1)} = ${lin(a2, b2)}`,
      `${a1 - a2}x = ${b2 - b1}, stąd x = ${x0}`,
      `y = ${a1}·${signed(x0)} ${sgn(b1)} ${Math.abs(b1)} = ${y0}`,
    ],
  });
};

const linParallel = (rng: Rng) => {
  const a = randInt(rng, -4, 4, [0]);
  const b = randInt(rng, -5, 5, [0]);
  const p = randInt(rng, -4, 4, [0]);
  const q = randInt(rng, -6, 6, [0]);
  const nb = q - a * p;
  return open({
    points: 2,
    prompt: `Wyznacz równanie prostej równoległej do prostej y = ${lin(a, b)} i przechodzącej przez punkt P = ${pt(p, q)}.`,
    key: `y = ${lin(a, nb)}`,
    scheme: [
      { points: 1, text: `Współczynnik kierunkowy a = ${a} (proste równoległe).` },
      { points: 1, text: `Obliczenie b = ${nb} i zapisanie równania y = ${lin(a, nb)}.` },
    ],
    solution: [
      `Proste równoległe mają równe współczynniki kierunkowe, więc a = ${a}.`,
      `${q} = ${a}·${signed(p)} + b, stąd b = ${nb}`,
      `y = ${lin(a, nb)}`,
    ],
  });
};

export const FUNKCJA_LINIOWA_CHAPTER: SheetChapter = {
  id: "funkcja-liniowa",
  schoolClass: 9,
  title: "Funkcja liniowa",
  description:
    "Wzór i wykres funkcji liniowej, miejsce zerowe, monotoniczność, wzór z dwóch punktów, proste równoległe, punkt przecięcia prostych.",
  durationMin: 45,
  slots: [
    linTf,
    linZeroClosed,
    linParamClosed,
    linValues,
    linTwoPoints,
    linIntersect,
    linParallel,
  ],
};

/* ---------- Funkcja kwadratowa (liceum 1) ---------- */

function twoRoots(rng: Rng): [number, number] {
  for (let i = 0; i < 100; i++) {
    const r1 = randInt(rng, -6, 5, [0]);
    const r2 = randInt(rng, r1 + 1, 7, [0]);
    if (r2 > r1 && r1 + r2 !== 0) return [r1, r2];
  }
  return [-1, 3];
}

const quadVertexClosed = (rng: Rng) => {
  const a = pick(rng, [1, 2, 3, -1, -2]);
  const p = randInt(rng, -5, 5, [0]);
  const q = randInt(rng, -8, 8, [0]);
  const coeff = a === 1 ? "" : a === -1 ? "-" : String(a);
  return closedText(rng, {
    prompt: `Wierzchołek paraboli o równaniu y = ${coeff}(x ${p >= 0 ? "-" : "+"} ${Math.abs(p)})² ${sgn(q)} ${Math.abs(q)} ma współrzędne:`,
    correct: pt(p, q),
    wrongs: [pt(-p, q), pt(p, -q), pt(-p, -q)],
    solution: [
      `Postać kanoniczna y = a(x - p)² + q ma wierzchołek w punkcie (p, q) = ${pt(p, q)}.`,
    ],
  });
};

const quadRootsTf = (rng: Rng) => {
  const [r1, r2] = twoRoots(rng);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const other = randInt(rng, -7, 7, [r1, r2]);
  const ks = shuffle(rng, [r1, r2, other]);
  const value = (k: number) => k * k + b * k + c;
  return trueFalse({
    prompt: `Dana jest funkcja f(x) = ${poly2(1, b, c)}. ${TF_PROMPT}`,
    statements: ks.map((k) => ({
      text: `Liczba ${k} jest miejscem zerowym funkcji f.`,
      truth: value(k) === 0,
    })),
    solution: ks.map(
      (k) =>
        `f(${k}) = ${value(k)}, więc ${value(k) === 0 ? "prawda" : "fałsz"}`,
    ),
  });
};

const quadCountClosed = (rng: Rng) => {
  const kind = pick(rng, ["two", "one", "none"] as const);
  let b: number;
  let c: number;
  if (kind === "two") {
    const [r1, r2] = twoRoots(rng);
    b = -(r1 + r2);
    c = r1 * r2;
  } else if (kind === "one") {
    const r = randInt(rng, -6, 6, [0]);
    b = -2 * r;
    c = r * r;
  } else {
    const m = randInt(rng, -4, 4, [0]);
    b = 2 * m;
    c = m * m + int(rng, 1, 6);
  }
  const delta = b * b - 4 * c;
  const answers = [
    "Funkcja nie ma miejsc zerowych.",
    "Funkcja ma jedno miejsce zerowe.",
    "Funkcja ma dwa miejsca zerowe.",
    "Funkcja ma trzy miejsca zerowe.",
  ];
  const correct = delta < 0 ? answers[0] : delta === 0 ? answers[1] : answers[2];
  return closedText(rng, {
    prompt: `Ile miejsc zerowych ma funkcja f(x) = ${poly2(1, b, c)}?`,
    correct,
    wrongs: answers.filter((x) => x !== correct),
    solution: [
      `Δ = ${b}² - 4·${c} = ${delta}, ${delta < 0 ? "Δ < 0" : delta === 0 ? "Δ = 0" : "Δ > 0"}, więc ${correct.toLowerCase()}`,
    ],
  });
};

const quadSolve = (rng: Rng) => {
  const [r1, r2] = twoRoots(rng);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const delta = (r2 - r1) ** 2;
  const d = r2 - r1;
  return open({
    points: 3,
    prompt: `Rozwiąż równanie ${poly2(1, b, c)} = 0.`,
    key: `x = ${r1} lub x = ${r2}`,
    scheme: [
      { points: 1, text: `Obliczenie Δ = ${delta}.` },
      { points: 1, text: `Obliczenie √Δ = ${d}.` },
      { points: 1, text: `Podanie rozwiązań: x₁ = ${r1}, x₂ = ${r2}.` },
    ],
    solution: [
      `Δ = b² - 4ac = ${b}² - 4·${c} = ${delta}`,
      `√Δ = ${d}`,
      `x₁ = (${-b} - ${d})/2 = ${r1}, x₂ = (${-b} + ${d})/2 = ${r2}`,
    ],
  });
};

const quadInequality = (rng: Rng) => {
  const [r1, r2] = twoRoots(rng);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const op = pick(rng, ["<", ">", "≤", "≥"] as const);
  const answers = {
    "<": `x ∈ (${r1}, ${r2})`,
    "≤": `x ∈ ⟨${r1}, ${r2}⟩`,
    ">": `x ∈ (-∞, ${r1}) ∪ (${r2}, ∞)`,
    "≥": `x ∈ (-∞, ${r1}⟩ ∪ ⟨${r2}, ∞)`,
  } as const;
  const answer = answers[op];
  return open({
    points: 3,
    prompt: `Rozwiąż nierówność ${poly2(1, b, c)} ${op} 0.`,
    key: answer,
    scheme: [
      { points: 1, text: `Wyznaczenie miejsc zerowych: ${r1} i ${r2}.` },
      {
        points: 1,
        text: "Szkic paraboli z ramionami skierowanymi do góry i zaznaczeniem miejsc zerowych.",
      },
      { points: 1, text: `Odczytanie rozwiązania: ${answer}.` },
    ],
    solution: [
      `Δ = ${(r2 - r1) ** 2}, x₁ = ${r1}, x₂ = ${r2}`,
      "Parabola ma ramiona skierowane do góry, bo współczynnik przy x² jest dodatni.",
      `Rozwiązanie: ${answer}`,
    ],
  });
};

const quadCanonical = (rng: Rng) => {
  const a = pick(rng, [1, 2, -1, -2]);
  const p = randInt(rng, -4, 4, [0]);
  const q = randInt(rng, -8, 8, [0]);
  const b = -2 * a * p;
  const c = a * p * p + q;
  const up = a > 0;
  return open({
    points: 3,
    prompt: `Dana jest funkcja kwadratowa f(x) = ${poly2(a, b, c)}.`,
    parts: [
      "Wyznacz współrzędne wierzchołka paraboli.",
      "Podaj najmniejszą lub największą wartość funkcji f.",
      "Podaj zbiór wartości funkcji f.",
    ],
    key: `a) W = ${pt(p, q)}, b) ${up ? "najmniejsza" : "największa"} wartość wynosi ${q}, c) ${up ? `⟨${q}, ∞)` : `(-∞, ${q}⟩`}`,
    scheme: [
      { points: 1, text: `a) p = ${p}, q = ${q}.` },
      {
        points: 1,
        text: `b) Parabola ma ramiona skierowane ${up ? "do góry" : "w dół"}, więc wartość ${up ? "najmniejsza" : "największa"} wynosi ${q}.`,
      },
      { points: 1, text: `c) ${up ? `⟨${q}, ∞)` : `(-∞, ${q}⟩`}.` },
    ],
    solution: [
      `a) p = -b/(2a) = ${-b}/${2 * a} = ${p}, q = f(${p}) = ${q}`,
      `b) a = ${a} ${up ? "> 0" : "< 0"}, więc ramiona paraboli są skierowane ${up ? "do góry" : "w dół"}`,
      `c) ${up ? `⟨${q}, ∞)` : `(-∞, ${q}⟩`}`,
    ],
  });
};

const quadRectangle = (rng: Rng) => {
  const k = int(rng, 3, 9);
  return open({
    points: 4,
    prompt: `Obwód prostokąta jest równy ${4 * k} cm. Jeden z jego boków ma długość x cm.`,
    parts: [
      "Zapisz pole prostokąta jako funkcję zmiennej x.",
      "Dla jakiego x pole prostokąta jest największe?",
      "Oblicz największe pole tego prostokąta.",
    ],
    key: `a) P(x) = x(${2 * k} - x) = -x² + ${2 * k}x, b) x = ${k}, c) ${k * k} cm²`,
    scheme: [
      { points: 1, text: `a) Drugi bok ma długość ${2 * k} - x; P(x) = -x² + ${2 * k}x.` },
      { points: 2, text: `b) Wierzchołek paraboli: x = ${k}.` },
      { points: 1, text: `c) P(${k}) = ${k * k} cm².` },
    ],
    solution: [
      `a) Suma długości sąsiednich boków wynosi ${2 * k} cm, więc P(x) = x(${2 * k} - x)`,
      `b) p = ${2 * k}/2 = ${k}`,
      `c) P(${k}) = ${k}·${k} = ${k * k} cm² (kwadrat)`,
    ],
  });
};

export const FUNKCJA_KWADRATOWA_CHAPTER: SheetChapter = {
  id: "funkcja-kwadratowa",
  schoolClass: 9,
  title: "Funkcja kwadratowa",
  description:
    "Postać kanoniczna, wierzchołek paraboli, miejsca zerowe, równania i nierówności kwadratowe, zbiór wartości, zadanie optymalizacyjne.",
  durationMin: 45,
  slots: [
    quadVertexClosed,
    quadRootsTf,
    quadCountClosed,
    quadSolve,
    quadInequality,
    quadCanonical,
    quadRectangle,
  ],
};

/* ---------- Ciągi (liceum 2) ---------- */

const seqArithClosed = (rng: Rng) => {
  const a1 = randInt(rng, -5, 9);
  const r = pick(rng, [2, 3, 4, 5, 6, -2, -3]);
  const k = int(rng, 8, 15);
  const ak = a1 + (k - 1) * r;
  return closedNumber(rng, {
    prompt: `W ciągu arytmetycznym $(a_n)$ pierwszy wyraz jest równy ${a1}, a różnica wynosi ${r}. Wyraz $a_{${k}}$ jest równy:`,
    correct: ak,
    wrongs: [a1 + k * r, a1 + (k - 2) * r, a1 * r * k],
    solution: [
      `$a_{${k}} = a_1 + ${k - 1}r = ${a1} + ${k - 1}·${signed(r)} = ${ak}$`,
    ],
  });
};

const seqGeomClosed = (rng: Rng) => {
  const a1 = int(rng, 1, 4);
  const q = int(rng, 2, 3);
  const a5 = a1 * q ** 4;
  return closedNumber(rng, {
    prompt: `W ciągu geometrycznym $(a_n)$ pierwszy wyraz jest równy ${a1}, a iloraz wynosi ${q}. Wyraz $a_5$ jest równy:`,
    correct: a5,
    wrongs: [a1 * q ** 5, a1 * q * 4, a1 + 4 * q],
    solution: [`$a_5 = a_1 · q^4 = ${a1} · ${q}^4 = ${a5}$`],
  });
};

const seqTf = (rng: Rng) => {
  const p = randInt(rng, 2, 7);
  const s = randInt(rng, -5, 6, [0]);
  const k = int(rng, 5, 10);
  const claimedR = rng() < 0.5 ? p : p + pick(rng, [-1, 1]);
  const claimedAk = rng() < 0.5 ? p * k + s : p * k + s + pick(rng, [-p, p, 1]);
  const isArithmetic = rng() < 0.5;
  const formula = isArithmetic
    ? `$a_n = ${lin(p, s, "n")}$`
    : `$a_n = ${p}n² ${sgn(s)} ${Math.abs(s)}$`;
  const arithmeticTruth = isArithmetic;
  return trueFalse({
    prompt: `Dany jest ciąg $(a_n)$ o wzorze ogólnym ${formula}. ${TF_PROMPT}`,
    statements: [
      { text: "Ciąg $(a_n)$ jest arytmetyczny.", truth: arithmeticTruth },
      {
        text: `Różnica ciągu $(a_n)$ jest równa ${claimedR}.`,
        truth: isArithmetic && claimedR === p,
      },
      {
        text: `Wyraz $a_{${k}}$ jest równy ${claimedAk}.`,
        truth:
          claimedAk === (isArithmetic ? p * k + s : p * k * k + s),
      },
    ],
    solution: [
      isArithmetic
        ? "Różnica $a_{n+1} - a_n$ jest stała, więc ciąg jest arytmetyczny."
        : "Różnica $a_{n+1} - a_n$ zależy od n, więc ciąg nie jest arytmetyczny.",
      isArithmetic
        ? `Różnica jest równa ${p}.`
        : "Ciąg nie jest arytmetyczny, więc nie ma różnicy.",
      `$a_{${k}} = ${isArithmetic ? p * k + s : p * k * k + s}$`,
    ],
  });
};

const seqArithOpen = (rng: Rng) => {
  const r = pick(rng, [2, 3, 4, 5, -2, -3]);
  const a1 = int(rng, 1, 9);
  const a3 = a1 + 2 * r;
  const a7 = a1 + 6 * r;
  const s10 = 5 * (2 * a1 + 9 * r);
  return open({
    points: 4,
    prompt: `W ciągu arytmetycznym $(a_n)$ dane są: $a_3 = ${a3}$ oraz $a_7 = ${a7}$.`,
    parts: [
      "Oblicz różnicę r tego ciągu.",
      "Oblicz pierwszy wyraz $a_1$.",
      "Oblicz sumę dziesięciu początkowych wyrazów tego ciągu.",
    ],
    key: `a) r = ${r}, b) $a_1$ = ${a1}, c) $S_{10}$ = ${s10}`,
    scheme: [
      { points: 1, text: `a) $4r = ${a7} - ${signed(a3)}$, r = ${r}.` },
      { points: 1, text: `b) $a_1 = ${a1}$.` },
      { points: 1, text: "c) Zastosowanie wzoru na sumę wyrazów ciągu arytmetycznego." },
      { points: 1, text: `c) $S_{10} = ${s10}$.` },
    ],
    solution: [
      `a) $a_7 - a_3 = 4r$, stąd r = ${r}`,
      `b) $a_1 = a_3 - 2r = ${a1}$`,
      `c) $S_{10} = (2a_1 + 9r)/2 · 10 = (2·${a1} + 9·${signed(r)}) · 5 = ${s10}$`,
    ],
  });
};

const seqGeomOpen = (rng: Rng) => {
  const q = pick(rng, [2, 3, -2]);
  const a1 = int(rng, 1, 3);
  const a2 = a1 * q;
  const a5 = a1 * q ** 4;
  const a6 = a5 * q;
  return open({
    points: 3,
    prompt: `W ciągu geometrycznym $(a_n)$ dane są: $a_2 = ${a2}$ oraz $a_5 = ${a5}$.`,
    parts: [
      "Oblicz iloraz q tego ciągu.",
      "Oblicz pierwszy wyraz $a_1$.",
      "Oblicz szósty wyraz $a_6$.",
    ],
    key: `a) q = ${q}, b) $a_1$ = ${a1}, c) $a_6$ = ${a6}`,
    scheme: [
      { points: 1, text: `a) $q^3 = ${a5}/${signed(a2)} = ${q ** 3}$, q = ${q}.` },
      { points: 1, text: `b) $a_1 = ${a1}$.` },
      { points: 1, text: `c) $a_6 = ${a6}$.` },
    ],
    solution: [
      `a) $a_5 = a_2 · q^3$, stąd $q^3 = ${q ** 3}$, q = ${q}`,
      `b) $a_1 = a_2 / q = ${a1}$`,
      `c) $a_6 = a_5 · q = ${a6}$`,
    ],
  });
};

const seqCondition = (rng: Rng) => {
  const p = randInt(rng, -5, 8, [0]);
  const q = randInt(rng, -5, 8, [0]);
  const s = randInt(rng, -5, 8, [0]);
  const x = 2 * q - p - s;
  return open({
    points: 3,
    prompt: `Wyznacz x, dla którego liczby ${lin(1, p)}, ${lin(2, q)}, ${lin(4, s)} (w podanej kolejności) tworzą ciąg arytmetyczny.`,
    key: `x = ${x}`,
    scheme: [
      { points: 1, text: "Zapisanie warunku: środkowy wyraz jest średnią arytmetyczną sąsiednich." },
      { points: 1, text: "Zapisanie i uporządkowanie równania liniowego z niewiadomą x." },
      { points: 1, text: `Obliczenie x = ${x}.` },
    ],
    solution: [
      `2·(${lin(2, q)}) = (${lin(1, p)}) + (${lin(4, s)})`,
      `${4}x ${sgn(2 * q)} ${Math.abs(2 * q)} = ${5}x ${sgn(p + s)} ${Math.abs(p + s)}`,
      `x = ${x}`,
    ],
  });
};

const seqRows = (rng: Rng) => {
  const n = pick(rng, [10, 12, 14, 16, 20]);
  const a1 = int(rng, 12, 24);
  const r = int(rng, 2, 4);
  const last = a1 + (n - 1) * r;
  const total = (n * (a1 + last)) / 2;
  return open({
    points: 3,
    prompt: `W sali widowiskowej jest ${n} rzędów krzeseł. W pierwszym rzędzie jest ${a1} krzeseł, a w każdym następnym rzędzie o ${r} więcej niż w poprzednim.`,
    parts: [
      "Ile krzeseł jest w ostatnim rzędzie?",
      "Ile krzeseł jest w całej sali?",
    ],
    key: `a) ${last}, b) ${total}`,
    scheme: [
      { points: 1, text: `a) $a_{${n}} = ${last}$.` },
      { points: 1, text: "b) Zastosowanie wzoru na sumę wyrazów ciągu arytmetycznego." },
      { points: 1, text: `b) $S_{${n}} = ${total}$.` },
    ],
    solution: [
      `a) $a_{${n}} = ${a1} + ${n - 1}·${r} = ${last}$`,
      `b) $S_{${n}} = (${a1} + ${last})/2 · ${n} = ${total}$`,
    ],
  });
};

const seqDeposit = (rng: Rng) => {
  const K = pick(rng, [1000, 1500, 2000, 2500, 3000, 4000, 5000]);
  const p = pick(rng, [10, 20]);
  const y1 = (K * (100 + p)) / 100;
  const y2 = (y1 * (100 + p)) / 100;
  const f = p === 10 ? "1,1" : "1,2";
  return open({
    points: 3,
    prompt: `Pan Jan wpłacił do banku ${K} zł na dwuletnią lokatę. Oprocentowanie lokaty wynosi ${p}% w skali roku, a odsetki są dopisywane po zakończeniu każdego roku. Oblicz, ile złotych będzie na lokacie po dwóch latach (pomiń podatek od odsetek).`,
    key: `${y2} zł`,
    scheme: [
      { points: 1, text: `Zapisanie, że kapitał rośnie ${f} razy w ciągu roku.` },
      { points: 1, text: `Kapitał po pierwszym roku: ${y1} zł.` },
      { points: 1, text: `Kapitał po drugim roku: ${y2} zł.` },
    ],
    solution: [
      `Po roku kapitał jest równy ${K}·${f} = ${y1} zł`,
      `Po dwóch latach: ${y1}·${f} = ${y2} zł`,
    ],
  });
};

export const CIAGI_CHAPTER: SheetChapter = {
  id: "ciagi",
  schoolClass: 10,
  title: "Ciągi",
  description:
    "Ciąg arytmetyczny i geometryczny, wzór ogólny, suma wyrazów, warunek na trzy kolejne wyrazy, zadania tekstowe i lokata.",
  durationMin: 45,
  slots: [
    seqArithClosed,
    seqGeomClosed,
    seqTf,
    seqArithOpen,
    seqGeomOpen,
    seqCondition,
    seqRows,
    seqDeposit,
  ],
};

/* ---------- Trygonometria (liceum 2) ---------- */

const PRIMITIVE_TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
] as const;

function legs(rng: Rng) {
  const [x, y, c] = pick(rng, PRIMITIVE_TRIPLES);
  const swap = rng() < 0.5;
  return { opp: swap ? y : x, adj: swap ? x : y, c };
}

const trigRatioClosed = (rng: Rng) => {
  const { opp, adj, c } = legs(rng);
  const values = {
    sin: frac(opp, c),
    cos: frac(adj, c),
    tg: frac(opp, adj),
    ctg: frac(adj, opp),
  };
  const fn = pick(rng, ["sin", "cos", "tg"] as const);
  const others = (["sin", "cos", "tg", "ctg"] as const).filter((x) => x !== fn);
  return closedText(rng, {
    prompt: `W trójkącie prostokątnym przyprostokątne mają długości ${opp} cm i ${adj} cm, a przeciwprostokątna ma ${c} cm. Kąt ostry α leży naprzeciw przyprostokątnej o długości ${opp} cm. Wartość ${fn} α jest równa:`,
    figure: {
      kind: "right-triangle",
      a: `${adj} cm`,
      b: `${opp} cm`,
      c: `${c} cm`,
    },
    correct: values[fn],
    wrongs: others.map((x) => values[x]),
    solution: [
      `sin α = ${opp}/${c}, cos α = ${adj}/${c}, tg α = ${opp}/${adj}, ctg α = ${adj}/${opp}`,
      `${fn} α = ${values[fn]}`,
    ],
  });
};

const trigFromSinClosed = (rng: Rng) => {
  const { opp, adj, c } = legs(rng);
  return closedText(rng, {
    prompt: `Kąt ostry α spełnia warunek sin α = ${frac(opp, c)}. Wtedy tg α jest równy:`,
    correct: frac(opp, adj),
    wrongs: [frac(adj, opp), frac(adj, c), frac(opp, c)],
    solution: [
      `Przyjmujemy sin α = ${opp}/${c}: przyprostokątna naprzeciw kąta ma długość ${opp}, przeciwprostokątna ${c}.`,
      `Druga przyprostokątna: √(${c}² - ${opp}²) = ${adj}, więc tg α = ${opp}/${adj}`,
    ],
  });
};

const TRIG_FACTS: { text: string; truth: boolean }[] = [
  { text: "sin 30° = 1/2", truth: true },
  { text: "sin 45° = √2/2", truth: true },
  { text: "sin 60° = √3/2", truth: true },
  { text: "cos 60° = 1/2", truth: true },
  { text: "tg 45° = 1", truth: true },
  { text: "tg 30° = √3/3", truth: true },
  { text: "cos 30° = 1/2", truth: false },
  { text: "cos 45° = 1", truth: false },
  { text: "sin 60° = 1/2", truth: false },
  { text: "tg 60° = √3/3", truth: false },
  { text: "tg 30° = √3", truth: false },
  { text: "sin 45° = 1/2", truth: false },
];

const trigFactsTf = (rng: Rng) => {
  const yes = shuffle(rng, TRIG_FACTS.filter((f) => f.truth)).slice(0, 2);
  const no = shuffle(rng, TRIG_FACTS.filter((f) => !f.truth)).slice(0, 2);
  const statements = shuffle(rng, [...yes, ...no]);
  return trueFalse({
    prompt: `Wartości funkcji trygonometrycznych dla kątów 30°, 45° i 60°. ${TF_PROMPT}`,
    statements,
    solution: statements.map(
      (s) => `${s.text} - ${s.truth ? "prawda" : "fałsz"}`,
    ),
  });
};

const TRIG_VARIANTS = [
  {
    parts: [
      ["sin 30° + cos 60°", "1"],
      ["tg 45° · sin 60°", "√3/2"],
      ["cos 30° · tg 30°", "1/2"],
    ],
    steps: [
      "1/2 + 1/2 = 1",
      "1 · √3/2 = √3/2",
      "(√3/2) · (√3/3) = 3/6 = 1/2",
    ],
  },
  {
    parts: [
      ["sin 60° · cos 30°", "3/4"],
      ["tg 60° · tg 30°", "1"],
      ["sin 45° · cos 45°", "1/2"],
    ],
    steps: [
      "(√3/2) · (√3/2) = 3/4",
      "√3 · (√3/3) = 3/3 = 1",
      "(√2/2) · (√2/2) = 2/4 = 1/2",
    ],
  },
  {
    parts: [
      ["2 · sin 30° + tg 45°", "2"],
      ["cos 60° · tg 60°", "√3/2"],
      ["sin 45° / cos 45°", "1"],
    ],
    steps: [
      "2 · 1/2 + 1 = 2",
      "(1/2) · √3 = √3/2",
      "(√2/2) : (√2/2) = 1",
    ],
  },
  {
    parts: [
      ["sin 30° · tg 60°", "√3/2"],
      ["cos 45° + sin 45°", "√2"],
      ["cos 60° + sin 60° · tg 30°", "1"],
    ],
    steps: [
      "(1/2) · √3 = √3/2",
      "√2/2 + √2/2 = √2",
      "1/2 + (√3/2) · (√3/3) = 1/2 + 1/2 = 1",
    ],
  },
] as const;

const trigValues = (rng: Rng) => {
  const v = pick(rng, TRIG_VARIANTS);
  return open({
    points: 3,
    prompt: "Oblicz wartość wyrażenia (wynik zapisz w najprostszej postaci).",
    parts: v.parts.map(([expr]) => expr),
    key: v.parts.map(([, res], i) => `${String.fromCharCode(97 + i)}) ${res}`).join(", "),
    scheme: v.parts.map(([, res], i) => ({
      points: 1,
      text: `${String.fromCharCode(97 + i)}) ${res}.`,
    })),
    solution: v.steps.map((s, i) => `${String.fromCharCode(97 + i)}) ${s}`),
  });
};

const trigSides = (rng: Rng) => {
  const angle = pick(rng, [30, 45] as const);
  const a = int(rng, 3, 9);
  if (angle === 30) {
    return open({
      points: 3,
      prompt: `Jeden z kątów ostrych trójkąta prostokątnego ma miarę 30°, a przyprostokątna leżąca naprzeciw tego kąta ma długość ${a} cm. Oblicz długości pozostałych boków tego trójkąta.`,
      key: `przeciwprostokątna: ${2 * a} cm, druga przyprostokątna: ${a}√3 cm`,
      scheme: [
        { points: 1, text: "Zapisanie zależności sin 30° = a/c." },
        { points: 1, text: `Przeciwprostokątna c = ${2 * a} cm.` },
        { points: 1, text: `Druga przyprostokątna ${a}√3 cm.` },
      ],
      solution: [
        `sin 30° = ${a}/c, czyli 1/2 = ${a}/c, stąd c = ${2 * a} cm`,
        `tg 30° = ${a}/b, czyli √3/3 = ${a}/b, stąd b = ${a}√3 cm`,
      ],
    });
  }
  return open({
    points: 3,
    prompt: `Jeden z kątów ostrych trójkąta prostokątnego ma miarę 45°, a przyprostokątna leżąca naprzeciw tego kąta ma długość ${a} cm. Oblicz długości pozostałych boków tego trójkąta.`,
    key: `druga przyprostokątna: ${a} cm, przeciwprostokątna: ${a}√2 cm`,
    scheme: [
      { points: 1, text: "Zapisanie zależności tg 45° = 1 lub stwierdzenie, że trójkąt jest równoramienny." },
      { points: 1, text: `Druga przyprostokątna ${a} cm.` },
      { points: 1, text: `Przeciwprostokątna ${a}√2 cm.` },
    ],
    solution: [
      `tg 45° = ${a}/b = 1, stąd b = ${a} cm`,
      `sin 45° = ${a}/c, czyli √2/2 = ${a}/c, stąd c = ${a}√2 cm`,
    ],
  });
};

const trigArea = (rng: Rng) => {
  const a = pick(rng, [4, 6, 8, 10]);
  const b = pick(rng, [4, 6, 8, 12]);
  const angle = pick(rng, [30, 45, 60] as const);
  const N = (a * b) / 4;
  const result =
    angle === 30 ? `${(a * b) / 4}` : angle === 45 ? `${N}√2` : `${N}√3`;
  const sinText = angle === 30 ? "1/2" : angle === 45 ? "√2/2" : "√3/2";
  return open({
    points: 3,
    prompt: `W trójkącie dwa boki mają długości ${a} cm i ${b} cm, a kąt między nimi ma miarę ${angle}°. Oblicz pole tego trójkąta.`,
    key: `${result} cm²`,
    scheme: [
      { points: 1, text: "Zastosowanie wzoru P = ½ · a · b · sin γ." },
      { points: 1, text: `Zapisanie sin ${angle}° = ${sinText}.` },
      { points: 1, text: `P = ${result} cm².` },
    ],
    solution: [
      `P = ½ · ${a} · ${b} · sin ${angle}°`,
      `P = ${(a * b) / 2} · ${sinText} = ${result} cm²`,
    ],
  });
};

const trigLadder = (rng: Rng) => {
  const L = pick(rng, [4, 6, 8, 10, 12]);
  return closedNumber(rng, {
    prompt: `Drabina o długości ${L} m oparta jest o pionową ścianę i tworzy z poziomym podłożem kąt 30°. Na jakiej wysokości drabina dotyka ściany?`,
    correct: L / 2,
    wrongs: [L, 2 * L, L / 2 + 1],
    format: (n) => `${n} m`,
    solution: [`h = ${L} · sin 30° = ${L} · 1/2 = ${L / 2} m`],
  });
};

export const TRYGONOMETRIA_CHAPTER: SheetChapter = {
  id: "trygonometria",
  schoolClass: 10,
  title: "Trygonometria",
  description:
    "Funkcje trygonometryczne kąta ostrego, wartości dla 30°, 45°, 60°, obliczanie boków trójkąta prostokątnego, pole trójkąta ze wzoru z sinusem.",
  durationMin: 45,
  slots: [
    trigRatioClosed,
    trigFromSinClosed,
    trigFactsTf,
    trigValues,
    trigSides,
    trigArea,
    trigLadder,
  ],
};

/* ---------- Kombinatoryka i prawdopodobieństwo (liceum 3) ---------- */

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const choose = (n: number, k: number) =>
  factorial(n) / (factorial(k) * factorial(n - k));

const combDigitsClosed = (rng: Rng) => {
  const m = int(rng, 5, 8);
  const digits = Array.from({ length: m }, (_, i) => i + 1).join(", ");
  const ans = m * (m - 1) * (m - 2);
  return closedNumber(rng, {
    prompt: `Ile jest liczb trzycyfrowych o różnych cyfrach, które można zapisać za pomocą cyfr: ${digits}?`,
    correct: ans,
    wrongs: [m ** 3, choose(m, 3), factorial(m)],
    solution: [
      `Pierwszą cyfrę wybieramy na ${m} sposobów, drugą na ${m - 1}, trzecią na ${m - 2}: ${m}·${m - 1}·${m - 2} = ${ans}`,
    ],
  });
};

const combChooseClosed = (rng: Rng) => {
  const n = int(rng, 6, 10);
  const k = pick(rng, [2, 3]);
  const perm = k === 2 ? n * (n - 1) : n * (n - 1) * (n - 2);
  return closedNumber(rng, {
    prompt: `Na ile sposobów można wybrać ${k} osoby spośród ${n}-osobowej grupy, jeżeli kolejność wyboru nie ma znaczenia?`,
    correct: choose(n, k),
    wrongs: [perm, n ** k, n * k],
    solution: [`C(${n}, ${k}) = ${n}!/(${k}!·${n - k}!) = ${choose(n, k)}`],
  });
};

const PROB_FACTS: { text: string; truth: boolean; step: string }[] = [
  {
    text: "Prawdopodobieństwo wyrzucenia parzystej liczby oczek w jednym rzucie kostką wynosi 1/2.",
    truth: true,
    step: "Sprzyjają 3 wyniki (2, 4, 6) spośród 6, czyli 3/6 = 1/2.",
  },
  {
    text: "Prawdopodobieństwo otrzymania sumy oczek równej 7 w rzucie dwiema kostkami wynosi 1/6.",
    truth: true,
    step: "Sprzyja 6 par spośród 36, czyli 6/36 = 1/6.",
  },
  {
    text: "Prawdopodobieństwo wylosowania asa z talii 52 kart wynosi 1/13.",
    truth: true,
    step: "Są 4 asy, więc 4/52 = 1/13.",
  },
  {
    text: "Prawdopodobieństwo otrzymania sumy oczek równej 12 w rzucie dwiema kostkami wynosi 1/12.",
    truth: false,
    step: "Sprzyja tylko para (6, 6), więc prawdopodobieństwo to 1/36.",
  },
  {
    text: "Prawdopodobieństwo otrzymania dwóch orłów w rzucie dwiema monetami wynosi 1/2.",
    truth: false,
    step: "Wszystkich wyników jest 4, a sprzyja jeden, więc 1/4.",
  },
  {
    text: "Prawdopodobieństwo wyrzucenia liczby oczek większej od 4 w jednym rzucie kostką wynosi 1/2.",
    truth: false,
    step: "Sprzyjają wyniki 5 i 6, więc 2/6 = 1/3.",
  },
];

const probTf = (rng: Rng) => {
  const yes = shuffle(rng, PROB_FACTS.filter((f) => f.truth)).slice(0, 2);
  const no = shuffle(rng, PROB_FACTS.filter((f) => !f.truth)).slice(0, 2);
  const items = shuffle(rng, [...yes, ...no]);
  return trueFalse({
    prompt: TF_PROMPT,
    statements: items.map(({ text, truth }) => ({ text, truth })),
    solution: items.map((i) => i.step),
  });
};

const probUrn = (rng: Rng) => {
  const w = int(rng, 3, 7);
  const r = int(rng, 3, 7);
  const n = w + r;
  return open({
    points: 4,
    prompt: `W urnie jest ${w} kul białych i ${r} kul czerwonych. Kule różnią się tylko kolorem.`,
    parts: [
      "Losujemy jedną kulę. Oblicz prawdopodobieństwo wylosowania kuli białej.",
      "Losujemy dwa razy po jednej kuli, za każdym razem zwracając kulę do urny. Oblicz prawdopodobieństwo wylosowania dwóch kul czerwonych.",
      "Losujemy dwie kule jednocześnie (bez zwracania). Oblicz prawdopodobieństwo, że obie są czerwone.",
    ],
    key: `a) ${frac(w, n)}, b) ${frac(r * r, n * n)}, c) ${frac(r * (r - 1), n * (n - 1))}`,
    scheme: [
      { points: 1, text: `a) P = ${w}/${n} = ${frac(w, n)}.` },
      { points: 1, text: `b) P = ${r}/${n} · ${r}/${n} = ${frac(r * r, n * n)}.` },
      { points: 1, text: `c) Zapisanie |Ω| = ${n * (n - 1)} i |A| = ${r * (r - 1)} lub równoważnego iloczynu.` },
      { points: 1, text: `c) P = ${frac(r * (r - 1), n * (n - 1))}.` },
    ],
    solution: [
      `a) ${w}/${n} = ${frac(w, n)}`,
      `b) (${r}/${n})² = ${frac(r * r, n * n)}`,
      `c) (${r}/${n}) · (${r - 1}/${n - 1}) = ${frac(r * (r - 1), n * (n - 1))}`,
    ],
  });
};

const probTwoDice = (rng: Rng) => {
  const s = int(rng, 3, 11);
  const pairs: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const j = s - i;
    if (j >= 1 && j <= 6) pairs.push(`(${i}, ${j})`);
  }
  const count = pairs.length;
  return open({
    points: 3,
    prompt: `Rzucamy dwa razy symetryczną sześcienną kostką do gry. Oblicz prawdopodobieństwo zdarzenia A polegającego na tym, że suma wyrzuconych oczek jest równa ${s}.`,
    key: `P(A) = ${frac(count, 36)}`,
    scheme: [
      { points: 1, text: "Zapisanie |Ω| = 36." },
      { points: 1, text: `Wypisanie zdarzeń sprzyjających: ${pairs.join(", ")}, czyli |A| = ${count}.` },
      { points: 1, text: `P(A) = ${count}/36 = ${frac(count, 36)}.` },
    ],
    solution: [
      "|Ω| = 6 · 6 = 36",
      `A = {${pairs.join(", ")}}, |A| = ${count}`,
      `P(A) = ${count}/36 = ${frac(count, 36)}`,
    ],
  });
};

const combOpen = (rng: Rng) => {
  const n1 = int(rng, 4, 6);
  const n2 = int(rng, 8, 10);
  const n3 = int(rng, 7, 10);
  const c2 = choose(n2, 3);
  const v3 = n3 * (n3 - 1) * (n3 - 2);
  return open({
    points: 3,
    prompt: "Oblicz, na ile sposobów można:",
    parts: [
      `ustawić w kolejce ${n1} osób,`,
      `wybrać trzyosobową delegację spośród ${n2} osób,`,
      `wybrać spośród ${n3} osób przewodniczącego, zastępcę i skarbnika (każdą funkcję pełni inna osoba).`,
    ],
    key: `a) ${factorial(n1)}, b) ${c2}, c) ${v3}`,
    scheme: [
      { points: 1, text: `a) ${n1}! = ${factorial(n1)}.` },
      { points: 1, text: `b) C(${n2}, 3) = ${c2}.` },
      { points: 1, text: `c) ${n3}·${n3 - 1}·${n3 - 2} = ${v3}.` },
    ],
    solution: [
      `a) permutacje: ${n1}! = ${factorial(n1)}`,
      `b) kolejność nie ma znaczenia: C(${n2}, 3) = ${c2}`,
      `c) kolejność ma znaczenie: ${n3}·${n3 - 1}·${n3 - 2} = ${v3}`,
    ],
  });
};

const statsOpen = (rng: Rng) => {
  let data = [2, 5, 5, 7, 6];
  for (let t = 0; t < 300; t++) {
    const y = int(rng, 1, 9);
    const [x, z] = shuffle(rng, Array.from({ length: 12 }, (_, i) => i + 1).filter((v) => v !== y));
    const base = 2 * y + x + z;
    const candidates = Array.from({ length: 15 }, (_, i) => i + 1).filter(
      (v) => v !== x && v !== y && v !== z && (base + v) % 5 === 0,
    );
    if (candidates.length === 0) continue;
    data = shuffle(rng, [y, y, x, z, pick(rng, candidates)]);
    break;
  }
  const sum = data.reduce((s, v) => s + v, 0);
  const sorted = [...data].sort((a, b) => a - b);
  const mode = sorted.find((v) => sorted.filter((w) => w === v).length === 2)!;
  return open({
    points: 3,
    prompt: `Uczniowie zapisali liczby punktów uzyskanych w pięciu zadaniach: ${data.join(", ")}.`,
    parts: ["Oblicz średnią arytmetyczną.", "Wyznacz medianę.", "Wyznacz dominantę."],
    key: `a) ${sum / 5}, b) ${sorted[2]}, c) ${mode}`,
    scheme: [
      { points: 1, text: `a) ${sum}/5 = ${sum / 5}.` },
      { points: 1, text: `b) Uporządkowanie danych i mediana ${sorted[2]}.` },
      { points: 1, text: `c) Dominanta ${mode}.` },
    ],
    solution: [
      `a) (${data.join(" + ")})/5 = ${sum}/5 = ${sum / 5}`,
      `b) po uporządkowaniu: ${sorted.join(", ")}; środkowa liczba to ${sorted[2]}`,
      `c) najczęściej występuje liczba ${mode}`,
    ],
  });
};

export const KOMBINATORYKA_CHAPTER: SheetChapter = {
  id: "kombinatoryka-i-prawdopodobienstwo",
  schoolClass: 11,
  title: "Kombinatoryka i prawdopodobieństwo",
  description:
    "Reguła mnożenia, permutacje, wariacje, kombinacje, klasyczna definicja prawdopodobieństwa, losowanie ze zwracaniem i bez, statystyka opisowa.",
  durationMin: 45,
  slots: [
    combDigitsClosed,
    combChooseClosed,
    probTf,
    probUrn,
    probTwoDice,
    combOpen,
    statsOpen,
  ],
};

/* ---------- Geometria analityczna (liceum 3) ---------- */

const SEGMENT_VECTORS = [
  [3, 4],
  [4, 3],
  [-3, 4],
  [3, -4],
  [6, 8],
  [-8, 6],
] as const;

const gaDistanceClosed = (rng: Rng) => {
  const [dx, dy] = pick(rng, SEGMENT_VECTORS);
  const x1 = randInt(rng, -3, 2);
  const y1 = randInt(rng, -3, 2);
  const d = Math.sqrt(dx * dx + dy * dy);
  return closedNumber(rng, {
    prompt: `Odległość punktów A = ${pt(x1, y1)} i B = ${pt(x1 + dx, y1 + dy)} jest równa:`,
    figure: {
      kind: "coordinate",
      points: [
        { label: "A", x: x1, y: y1 },
        { label: "B", x: x1 + dx, y: y1 + dy },
      ],
      connect: true,
    },
    correct: d,
    wrongs: [Math.abs(dx) + Math.abs(dy), d * d, Math.abs(dx * dy)],
    solution: [
      `|AB| = √((${x1 + dx} - ${signed(x1)})² + (${y1 + dy} - ${signed(y1)})²) = √(${dx * dx} + ${dy * dy}) = ${d}`,
    ],
  });
};

const gaMidpointClosed = (rng: Rng) => {
  const sx = randInt(rng, -5, 5, [0]);
  const sy = randInt(rng, -5, 5, [0, sx]);
  const dx = randInt(rng, -4, 4, [0]);
  const dy = randInt(rng, -4, 4, [0]);
  const A = pt(sx - dx, sy - dy);
  const B = pt(sx + dx, sy + dy);
  return closedText(rng, {
    prompt: `Środek odcinka AB, gdzie A = ${A} oraz B = ${B}, ma współrzędne:`,
    correct: pt(sx, sy),
    wrongs: [pt(sy, sx), pt(2 * sx, 2 * sy), pt(sx, -sy)],
    solution: [
      `S = ((${sx - dx} + ${signed(sx + dx)})/2, (${sy - dy} + ${signed(sy + dy)})/2) = ${pt(sx, sy)}`,
    ],
  });
};

const gaTf = (rng: Rng) => {
  const a = randInt(rng, -3, 4, [0]);
  const b = randInt(rng, -5, 5, [0]);
  const x1 = randInt(rng, -3, 4, [0]);
  const onLine = rng() < 0.5;
  const yy = a * x1 + b + (onLine ? 0 : pick(rng, [-2, -1, 1, 2]));
  const m = int(rng, 2, 4);
  const perpTrue = rng() < 0.5;
  const second = perpTrue ? `-1/${m}` : pick(rng, [`1/${m}`, `-${m}`]);
  const c1 = randInt(rng, -4, 4, [0]);
  const c2 = randInt(rng, -4, 4, [0]);
  const equalSlope = rng() < 0.5;
  const s1 = randInt(rng, -3, 4, [0]);
  const s2 = equalSlope ? s1 : randInt(rng, -3, 4, [0, s1]);
  return trueFalse({
    prompt: TF_PROMPT,
    statements: [
      {
        text: `Punkt ${pt(x1, yy)} leży na prostej y = ${lin(a, b)}.`,
        truth: onLine,
      },
      {
        text: `Proste y = ${m}x ${sgn(c1)} ${Math.abs(c1)} oraz y = ${second}x ${sgn(c2)} ${Math.abs(c2)} są prostopadłe.`,
        truth: perpTrue,
      },
      {
        text: `Proste y = ${lin(s1, c1)} oraz y = ${lin(s2, c2)} są równoległe.`,
        truth: equalSlope,
      },
    ],
    solution: [
      `Dla x = ${x1} otrzymujemy y = ${a * x1 + b}, więc punkt ${onLine ? "leży" : "nie leży"} na prostej.`,
      `Proste są prostopadłe, gdy iloczyn współczynników kierunkowych jest równy -1; tu ${m} · (${second}) ${perpTrue ? "= -1" : "≠ -1"}.`,
      `Proste są równoległe, gdy mają równe współczynniki kierunkowe (${s1} i ${s2}).`,
    ],
  });
};

const gaCircleOpen = (rng: Rng) => {
  const [dx, dy] = pick(rng, [
    [6, 8],
    [8, 6],
    [-6, 8],
    [8, -6],
  ] as const);
  const x1 = randInt(rng, -3, 0);
  const y1 = randInt(rng, -3, 0);
  const x2 = x1 + dx;
  const y2 = y1 + dy;
  const sx = (x1 + x2) / 2;
  const sy = (y1 + y2) / 2;
  const sh = (v: number, n: string) => `(${n} ${v >= 0 ? "-" : "+"} ${Math.abs(v)})²`;
  const eq = `${sh(sx, "x")} + ${sh(sy, "y")} = 25`;
  return open({
    points: 4,
    prompt: `Odcinek AB, gdzie A = ${pt(x1, y1)} oraz B = ${pt(x2, y2)}, jest średnicą okręgu.`,
    parts: [
      "Oblicz długość odcinka AB.",
      "Wyznacz współrzędne środka okręgu.",
      "Zapisz równanie tego okręgu.",
    ],
    figure: {
      kind: "coordinate",
      points: [
        { label: "A", x: x1, y: y1 },
        { label: "B", x: x2, y: y2 },
      ],
      connect: true,
    },
    key: `a) 10, b) S = ${pt(sx, sy)}, c) ${eq}`,
    scheme: [
      { points: 1, text: "a) |AB| = 10." },
      { points: 1, text: `b) S = ${pt(sx, sy)}.` },
      { points: 1, text: "c) Promień r = 5, r² = 25." },
      { points: 1, text: `c) ${eq}.` },
    ],
    solution: [
      `a) |AB| = √(${dx * dx} + ${dy * dy}) = 10`,
      `b) S = ((${x1} + ${signed(x2)})/2, (${y1} + ${signed(y2)})/2) = ${pt(sx, sy)}`,
      `c) r = 10/2 = 5, więc ${eq}`,
    ],
  });
};

const gaPerpendicular = (rng: Rng) => {
  const m = int(rng, 2, 4);
  const n = randInt(rng, -5, 5, [0]);
  const p = randInt(rng, -4, 4, [0]);
  const q = randInt(rng, -6, 6, [0]);
  const b = q - m * p;
  return open({
    points: 3,
    prompt: `Prosta k ma równanie $y = -\\frac{1}{${m}}x ${sgn(n)} ${Math.abs(n)}$. Wyznacz równanie prostej l prostopadłej do prostej k i przechodzącej przez punkt P = ${pt(p, q)}.`,
    key: `y = ${lin(m, b)}`,
    scheme: [
      { points: 1, text: `Współczynnik kierunkowy prostej l: a = ${m}.` },
      { points: 1, text: `Podstawienie współrzędnych punktu P i obliczenie b = ${b}.` },
      { points: 1, text: `Równanie y = ${lin(m, b)}.` },
    ],
    solution: [
      `Warunek prostopadłości: a · (-1/${m}) = -1, stąd a = ${m}`,
      `${q} = ${m}·${signed(p)} + b, stąd b = ${b}`,
      `y = ${lin(m, b)}`,
    ],
  });
};

const gaCircleClosed = (rng: Rng) => {
  const a = randInt(rng, -5, 5, [0]);
  const b = randInt(rng, -5, 5, [0]);
  const r = int(rng, 2, 7);
  const sh = (v: number, n: string) => `(${n} ${v >= 0 ? "-" : "+"} ${Math.abs(v)})²`;
  return closedText(rng, {
    prompt: `Okrąg o środku w punkcie S = ${pt(a, b)} i promieniu ${r} ma równanie:`,
    correct: `${sh(a, "x")} + ${sh(b, "y")} = ${r * r}`,
    wrongs: [
      `${sh(-a, "x")} + ${sh(b, "y")} = ${r * r}`,
      `${sh(a, "x")} + ${sh(-b, "y")} = ${r * r}`,
      `${sh(a, "x")} + ${sh(b, "y")} = ${r}`,
    ],
    solution: [
      `Równanie okręgu: (x - a)² + (y - b)² = r², więc ${sh(a, "x")} + ${sh(b, "y")} = ${r * r}`,
    ],
  });
};

const gaTriangleAreaClosed = (rng: Rng) => {
  const base = pick(rng, [4, 6, 8]);
  const h = int(rng, 3, 6);
  const x0 = randInt(rng, -3, 0);
  const y0 = randInt(rng, -3, 0);
  const cx = x0 + int(rng, 0, base);
  const area = (base * h) / 2;
  return closedNumber(rng, {
    prompt: `Pole trójkąta ABC o wierzchołkach A = ${pt(x0, y0)}, B = ${pt(x0 + base, y0)}, C = ${pt(cx, y0 + h)} jest równe:`,
    figure: {
      kind: "coordinate",
      points: [
        { label: "A", x: x0, y: y0 },
        { label: "B", x: x0 + base, y: y0 },
        { label: "C", x: cx, y: y0 + h },
      ],
      connect: true,
    },
    correct: area,
    wrongs: [base * h, area + h, area - h],
    solution: [
      `Podstawa AB ma długość ${base}, a wysokość opuszczona z C jest równa ${h}.`,
      `P = ½ · ${base} · ${h} = ${area}`,
    ],
  });
};

export const GEOMETRIA_ANALITYCZNA_CHAPTER: SheetChapter = {
  id: "geometria-analityczna",
  schoolClass: 11,
  title: "Geometria analityczna",
  description:
    "Odległość punktów, środek odcinka, równanie prostej, proste równoległe i prostopadłe, równanie okręgu, pole trójkąta w układzie współrzędnych.",
  durationMin: 45,
  slots: [
    gaDistanceClosed,
    gaMidpointClosed,
    gaTf,
    gaCircleOpen,
    gaPerpendicular,
    gaCircleClosed,
    gaTriangleAreaClosed,
  ],
};
