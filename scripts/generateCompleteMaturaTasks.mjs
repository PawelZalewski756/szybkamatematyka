#!/usr/bin/env node
/**
 * Generator zadań dla nowych tematów matury podstawowej.
 *
 *   node scripts/generateCompleteMaturaTasks.mjs
 *
 * Dla każdego tematu z drzewa CKE, który nie miał pliku w data/tasks-cache,
 * zapisuje bundle z dokładnie 20 zadaniami zamkniętymi. Zadania są
 * deterministyczne: ziarno zależy od tematu i numeru zadania, a identyfikator
 * powstaje z sha1 (ten sam schemat co scripts/generateCoverageTasks.mjs).
 *
 * Poprawność: każde zadanie liczy odpowiedź z parametrów losowanych przez
 * mulberry32, a generator na końcu sprawdza kompletność opcji, unikalność
 * treści w temacie oraz zgodność xp_reward z trudnością.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT_DIR = path.resolve(process.cwd(), "data/tasks-cache");
const GENERATED_AT = new Date().toISOString();
const R = String.raw;

/* ------------------------------------------------------------------ */
/* Losowość deterministyczna                                           */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function int(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

function shuffle(rng, items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Formatowanie liczb i wyrażeń                                        */
/* ------------------------------------------------------------------ */

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Liczba w polskim zapisie: przecinek dziesiętny, bez zbędnych zer. */
function num(value) {
  if (!Number.isFinite(value)) {
    throw new Error(`Nieprawidłowa liczba w generatorze: ${value}`);
  }
  if (Number.isInteger(value)) return String(value);
  return String(round2(value)).replace(".", ",");
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

/** Ułamek w LaTeX-u, zawsze skrócony. */
function fracStr(numerator, denominator) {
  if (denominator === 0) throw new Error("Dzielenie przez zero w fracStr");
  let a = numerator;
  let b = denominator;
  if (b < 0) {
    a = -a;
    b = -b;
  }
  const g = gcd(a, b);
  a /= g;
  b /= g;
  if (b === 1) return String(a);
  return a < 0 ? `-\\frac{${-a}}{${b}}` : `\\frac{${a}}{${b}}`;
}

function factorial(n) {
  let out = 1;
  for (let i = 2; i <= n; i += 1) out *= i;
  return out;
}

function binom(n, k) {
  if (k < 0 || k > n) return 0;
  const m = Math.min(k, n - k);
  let out = 1;
  for (let i = 1; i <= m; i += 1) {
    out = (out * (n - m + i)) / i;
  }
  return Math.round(out);
}

/** $...$ dla opcji i wyjaśnień. */
function math(latex) {
  return `$${latex}$`;
}

/** Wielomian z listy współczynników od najwyższej potęgi. */
function polyStr(coefs) {
  const degree = coefs.length - 1;
  let out = "";
  coefs.forEach((coef, index) => {
    if (coef === 0) return;
    const power = degree - index;
    const abs = Math.abs(coef);
    let term;
    if (power === 0) term = String(abs);
    else {
      const variable = power === 1 ? "x" : `x^${power}`;
      term = abs === 1 ? variable : `${abs}${variable}`;
    }
    if (!out) out = coef < 0 ? `-${term}` : term;
    else out += coef < 0 ? `-${term}` : `+${term}`;
  });
  return out || "0";
}

/** Czynnik (x + a) z poprawnym znakiem. */
function xplus(a) {
  if (a === 0) return "(x)";
  return a > 0 ? `(x+${a})` : `(x-${-a})`;
}

/** Dopisek +b albo -b, pomijany dla b = 0. */
function shift(b) {
  if (b === 0) return "";
  return b > 0 ? `+${b}` : `-${-b}`;
}

function interval(a, b) {
  return math(`(${a},${b})`);
}

function closedInterval(a, b) {
  return math(`[${a},${b}]`);
}

function setUnionLeftRight(a, b) {
  return math(`(-\\infty,${a}]\\cup[${b},\\infty)`);
}

/** Poprawna odpowiedź i trzy wiarygodne, ale różne dystraktory. */
function fillWrongs(correct, candidates) {
  const result = [];
  for (const candidate of candidates) {
    const text = String(candidate).trim();
    if (!text || text === correct || result.includes(text)) continue;
    result.push(text);
  }
  let step = 1;
  while (result.length < 3) {
    if (!/^-?\d+(,\d+)?$/.test(correct)) {
      throw new Error(`Za mało dystraktorów dla odpowiedzi: ${correct} (${result.join(" | ")})`);
    }
    const numeric = Number(correct.replace(",", "."));
    const fallback = num(numeric + step);
    if (fallback !== correct && !result.includes(fallback)) result.push(fallback);
    step += 1;
  }
  return result.slice(0, 3);
}

function task(content, correct, wrongs, explanation) {
  return { content, correct, wrongs, explanation };
}

/* ------------------------------------------------------------------ */
/* Budowa zadań                                                        */
/* ------------------------------------------------------------------ */

function makeTask(rng, spec, difficulty) {
  const correct = String(spec.correct).trim();
  let wrongs;
  try {
    wrongs = fillWrongs(correct, spec.wrongs ?? []);
  } catch (error) {
    throw new Error(`${error.message} | treść: ${spec.content}`);
  }
  const options = shuffle(rng, [correct, ...wrongs]);

  if (options.length !== 4) {
    throw new Error(`Zadanie nie ma 4 opcji: ${spec.content}`);
  }
  if (new Set(options).size !== 4) {
    throw new Error(`Opcje nie są unikalne: ${spec.content} -> ${options.join(" | ")}`);
  }
  if (!options.includes(correct)) {
    throw new Error(`Brak poprawnej odpowiedzi w opcjach: ${spec.content}`);
  }
  if (!spec.explanation || spec.explanation.trim().length < 10) {
    throw new Error(`Brak wyjaśnienia: ${spec.content}`);
  }

  return {
    content: spec.content.trim(),
    correct_answer: correct,
    options,
    answer_type: "choice",
    difficulty,
    xp_reward: 10 + difficulty * 4,
    explanation: `${spec.explanation.trim()}\n**Odpowiedź:** ${correct}`,
    figure_svg: null,
    figure_caption: null,
    id: null,
    generatedAt: GENERATED_AT,
    model: "complete-matura-v1",
  };
}

function deterministicId(topic, index) {
  const hash = crypto
    .createHash("sha1")
    .update(`${topic.exam_type}|${topic.category}|${topic.topic}|${index}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function buildTopic(topic) {
  const tasks = [];
  const usedContent = new Set();

  for (let i = 0; i < 20; i += 1) {
    const difficulty = i < 7 ? 1 : i < 14 ? 2 : 3;
    let spec = null;
    let attempt = 0;

    while (!spec && attempt < 60) {
      const generator = topic.gens[(i + attempt) % topic.gens.length];
      const seedBase = topic.topic
        .split("")
        .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      const rng = mulberry32(seedBase * 1009 + i * 7919 + attempt * 104729);
      const candidate = generator(rng);
      if (!candidate) {
        attempt += 1;
        continue;
      }
      if (typeof candidate.content !== "string") {
        throw new Error(`Zły wynik generatora w ${topic.category}/${topic.topic}: ${JSON.stringify(candidate)}`);
      }
      const key = candidate.content.trim().replace(/\s+/g, " ");
      if (!usedContent.has(key)) {
        usedContent.add(key);
        spec = candidate;
      }
      attempt += 1;
    }

    if (!spec) {
      throw new Error(
        `Nie udało się wygenerować 20 unikalnych zadań dla ${topic.category}/${topic.topic} (zadanie ${i + 1})`,
      );
    }

    const rngOptions = mulberry32(
      topic.topic.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 7919 +
        i * 104729,
    );
    const task = makeTask(rngOptions, spec, difficulty);
    task.id = deterministicId(topic, i);
    tasks.push(task);
  }

  if (new Set(tasks.map((task) => task.id)).size !== 20) {
    throw new Error(`Zduplikowane ID w ${topic.category}/${topic.topic}`);
  }

  return {
    exam_type: topic.exam_type,
    category: topic.category,
    topic: topic.topic,
    categoryName: topic.categoryName,
    topicName: topic.topicName,
    tasks,
    updatedAt: GENERATED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Tematy                                                              */
/* ------------------------------------------------------------------ */

const LICZBY = [
  {
    category: "liczby_rzeczywiste",
    categoryName: "Liczby rzeczywiste",
    topic: "pierwiastki",
    topicName: "Pierwiastki dowolnego stopnia",
    gens: [
      (rng) => {
        const m = pick(rng, [2, 3, 5, 6, 7]);
        const k = int(rng, 2, 6);
        const n = k * k * m;
        const correct = math(R`${k}\sqrt{${m}}`);
        return task(
          R`Uprość pierwiastek $\sqrt{${n}}$.`,
          correct,
          [
            math(R`${k + 1}\sqrt{${m}}`),
            math(R`${k * k}\sqrt{${m}}`),
            math(R`${k}\sqrt{${m + 1}}`),
          ],
          R`Wyłączamy pełny kwadrat: $\sqrt{${n}}=\sqrt{${k * k}\cdot${m}}=${k}\sqrt{${m}}$.`,
        );
      },
      (rng) => {
        const a = pick(rng, [2, 3, 5]);
        const k = pick(rng, [2, 3, 4]);
        const b = k * k * a;
        const correct = num(k * a);
        return task(
          R`Oblicz $\sqrt{${a}}\cdot\sqrt{${b}}$.`,
          correct,
          [num(a), num(k * a + 1), num(k * k * a)],
          R`$\sqrt{${a}}\cdot\sqrt{${b}}=\sqrt{${a}\cdot${b}}=\sqrt{${k * k}\cdot${a * a}}=${k * a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 7, 20);
        const correct = num(a);
        return task(
          R`Oblicz $(\sqrt{${a}})^2$.`,
          correct,
          [num(a * a), num(a + 1), num(a - 1)],
          R`Pierwiastek i kwadrat znoszą się dla liczb nieujemnych: $(\sqrt{${a}})^2=${a}$.`,
        );
      },
      (rng) => {
        const m = pick(rng, [2, 3, 5]);
        const k = int(rng, 2, 4);
        const n = k * k * k * m;
        const correct = math(R`${k}\sqrt[3]{${m}}`);
        return task(
          R`Uprość $\sqrt[3]{${n}}$.`,
          correct,
          [
            math(R`${k + 1}\sqrt[3]{${m}}`),
            math(R`${k}\sqrt[3]{${m + 1}}`),
            math(R`${k * k}\sqrt[3]{${m}}`),
          ],
          R`$\sqrt[3]{${n}}=\sqrt[3]{${k * k * k}\cdot${m}}=${k}\sqrt[3]{${m}}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 2, 6);
        const q = int(rng, 2, 6);
        if (p === q) return null;
        const correct = math(R`\frac{${p}}{${q}}`);
        return task(
          R`Oblicz $\sqrt{\frac{${p * p}}{${q * q}}}$.`,
          correct,
          [
            math(R`\frac{${p}}{${q + 1}}`),
            math(R`\frac{${p + 1}}{${q}}`),
            math(R`\frac{${p * p}}{${q * q}}`),
          ],
          R`Pierwiastek z ilorazu to iloraz pierwiastków: $\sqrt{\frac{${p * p}}{${q * q}}}=\frac{${p}}{${q}}$.`,
        );
      },
      (rng) => {
        const a = pick(rng, [2, 3, 5, 6, 7, 8, 10]);
        const correct = math(R`\frac{\sqrt{${a}}}{${a}}`);
        return task(
          R`Usuń niewymierność z mianownika: $\frac{1}{\sqrt{${a}}}$.`,
          correct,
          [
            math(R`\frac{1}{${a}}`),
            math(R`\sqrt{${a}}`),
            math(R`\frac{\sqrt{${a}}}{${a * a}}`),
          ],
          R`Mnożymy licznik i mianownik przez $\sqrt{${a}}$: $\frac{1}{\sqrt{${a}}}=\frac{\sqrt{${a}}}{${a}}$.`,
        );
      },
    ],
  },
  {
    category: "liczby_rzeczywiste",
    categoryName: "Liczby rzeczywiste",
    topic: "dowody_podzielnosci",
    topicName: "Dowody podzielności",
    gens: [
      (rng) => {
        const n = int(rng, 1000, 9876);
        const rest = n % 9;
        const correct = num(rest);
        return task(
          R`Liczba $${n}$ przy dzieleniu przez $9$ daje resztę:`,
          correct,
          [num((rest + 1) % 9), num((rest + 2) % 9), num((rest + 3) % 9)],
          R`Reszta z dzielenia przez $9$ jest równa reszcie z dzielenia sumy cyfr. Suma cyfr to $${String(n)
            .split("")
            .join("+")}=${String(n)
            .split("")
            .reduce((sum, digit) => sum + Number(digit), 0)}$, więc reszta wynosi $${rest}$.`,
        );
      },
      (rng) => {
        const m = int(rng, 3, 9);
        const candidates = [3 * m, 3 * m + 1, 3 * m + 2, 3 * m + 4];
        const correct = num(3 * m);
        return task(
          R`Która z liczb jest podzielna przez $3$?`,
          correct,
          candidates.filter((value) => value !== 3 * m).map(num),
          R`Suma cyfr liczby $${3 * m}$ jest podzielna przez $3$, dlatego $${3 * m}$ dzieli się przez $3$. Pozostałe liczby dają resztę $1$ lub $2$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        return task(
          R`Reszta z dzielenia liczby $4^{${k}}-1$ przez $3$ wynosi:`,
          "0",
          ["1", "2", num(4 ** k - 1)],
          R`Ponieważ $4\equiv1\pmod 3$, to $4^{${k}}\equiv1\pmod 3$, więc $4^{${k}}-1$ dzieli się przez $3$ bez reszty.`,
        );
      },
      (rng) => {
        const n = int(rng, 5, 20);
        return task(
          R`Dla $n=${n}$ iloczyn $n(n+1)$ jest podzielny przez:`,
          "2",
          ["3", "4", "5"],
          R`Liczby $n$ i $n+1$ są kolejne, więc jedna z nich jest parzysta. Iloczyn jest zawsze podzielny przez $2$ (dla $n=${n}$: $${n}\cdot${n + 1}=${n * (n + 1)}$).`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 6);
        const correct = num(9 * k);
        return task(
          R`Liczba $10^{${k}}-1$ składa się z samych cyfr $9$. Ile wynosi suma jej cyfr?`,
          correct,
          [num(9), num(9 * (k - 1)), num(10 * k)],
          R`Liczba $10^{${k}}-1$ to $${k}$ dziewiątek, więc suma cyfr wynosi $9\cdot${k}=${9 * k}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 5, 15);
        return task(
          R`Dla $n=${n}$ iloczyn $n(n+1)(n+2)$ jest zawsze podzielny przez:`,
          "6",
          ["4", "9", "12"],
          R`Wśród trzech kolejnych liczb całkowitych jest liczba parzysta i liczba podzielna przez $3$, więc iloczyn dzieli się przez $2\cdot3=6$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        return task(
          R`Reszta z dzielenia liczby $10^{${k}}+1$ przez $3$ wynosi:`,
          "2",
          ["0", "1", num(3)],
          R`$10\equiv1\pmod3$, więc $10^{${k}}+1\equiv1+1=2\pmod3$. Reszta to $2$.`,
        );
      },
    ],
  },
];

const ALGEBRA_A = [
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "przeksztalcanie_wyrazen",
    topicName: "Przekształcanie wyrażeń",
    gens: [
      (rng) => {
        const a = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
        const b = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
        if (a === -b || a === b) return null;
        const correct = math(polyStr([1, a + b, a * b]));
        return task(
          R`Rozwiń wyrażenie $${xplus(a)}${xplus(b)}$.`,
          correct,
          [
            math(polyStr([1, a + b + 1, a * b])),
            math(polyStr([1, a + b, a * b + 1])),
            math(polyStr([1, a * b, a + b])),
          ],
          R`Po redukcji wyrazów podobnych otrzymujemy $${polyStr([1, a + b, a * b])}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const sign = pick(rng, [1, -1]);
        const b = sign * a;
        const correct = math(polyStr([1, 2 * b, b * b]));
        return task(
          R`Rozwiń wyrażenie $${xplus(b)}^2$.`,
          correct,
          [
            math(polyStr([1, b, b * b])),
            math(polyStr([1, 2 * b, b])),
            math(polyStr([1, 2 * b, b * b + 1])),
          ],
          R`$ ${xplus(b)}^2=${polyStr([1, 2 * b, b * b])}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const correct = math(R`x^2-${a * a}`);
        return task(
          R`Rozwiń wyrażenie $(x-${a})(x+${a})$.`,
          correct,
          [
            math(R`x^2+${a * a}`),
            math(R`x^2-${2 * a}x+${a * a}`),
            math(R`x^2-${a}`),
          ],
          R`Różnica kwadratów: $(x-${a})(x+${a})=x^2-${a * a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 6);
        const b = int(rng, 1, 6);
        const constant = -3 * a - 2 * b;
        const correct = math(polyStr([1, constant]));
        return task(
          R`Uprość wyrażenie $3(x-${a})-2(x+${b})$.`,
          correct,
          [
            math(polyStr([1, constant + 1])),
            math(polyStr([1, constant - 1])),
            math(polyStr([5, constant])),
          ],
          R`$3x-${3 * a}-2x-${2 * b}=${polyStr([1, constant])}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 7);
        const b = int(rng, 1, 7);
        const correct = math(R`(x+${a})(x+${b})`);
        return task(
          R`Rozłóż na czynniki wyrażenie $x^2+${a + b}x+${a * b}$.`,
          correct,
          [
            math(R`(x-${a})(x-${b})`),
            math(R`(x+${a})(x-${b})`),
            math(R`(x-${a})(x+${b})`),
          ],
          R`Szukamy liczb o sumie $${a + b}$ i iloczynie $${a * b}$: są to $${a}$ i $${b}$, więc $x^2+${a + b}x+${a * b}=(x+${a})(x+${b})$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, 1, 9);
        const c = int(rng, 2, 5);
        const d = int(rng, 1, 8);
        const e = int(rng, 1, 9);
        const correct = math(polyStr([1 - c, a - d, b - e]));
        return task(
          R`Uprość $(x^2+${a}x+${b})-(${c}x^2+${d}x+${e})$.`,
          correct,
          [
            math(polyStr([1 + c, a + d, b + e])),
            math(polyStr([1 - c, a - d, b - e + 1])),
            math(polyStr([1 - c, a + d, b - e])),
          ],
          R`Odejmujemy współczynniki: $(${1 - c})x^2+(${a - d})x+(${b - e})=${polyStr([1 - c, a - d, b - e])}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        const a = int(rng, 2, 7);
        const correct = math(polyStr([k, -k * a]));
        return task(
          R`Rozwiń wyrażenie $${k}x(x-${a})$.`,
          correct,
          [
            math(polyStr([k, -a])),
            math(polyStr([k, -k * a - k])),
            math(polyStr([k * k, -k * a])),
          ],
          R`$${k}x\cdot x-${k}x\cdot${a}=${k}x^2-${k * a}x$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "dzielenie_wielomianow",
    topicName: "Dzielenie wielomianów",
    gens: [
      (rng) => {
        const p = int(rng, 2, 5);
        const qq = int(rng, 1, 5);
        const dividend = [1, qq - p, -p * qq];
        const correct = math(R`x+${qq}`);
        return task(
          R`Iloraz wielomianu $${polyStr(dividend)}$ przez $x-${p}$ wynosi:`,
          correct,
          [math(R`x-${qq}`), math(R`x+${p * qq}`), math(R`x+${p + qq}`)],
          R`Dzielenie jest dokładne: $${polyStr(dividend)}=(x-${p})(x+${qq})$, więc iloraz to $x+${qq}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 2, 5);
        const qq = int(rng, 1, 5);
        const dividend = [1, p - qq, -p * qq];
        const correct = math(R`x-${qq}`);
        return task(
          R`Iloraz wielomianu $${polyStr(dividend)}$ przez $x+${p}$ wynosi:`,
          correct,
          [math(R`x+${qq}`), math(R`x+${p * qq}`), math(R`x-${p + qq}`)],
          R`$${polyStr(dividend)}=(x+${p})(x-${qq})$, więc iloraz to $x-${qq}$.`,
        );
      },
      (rng) => {
        const a = int(rng, -3, 3);
        const b = int(rng, -4, 4);
        const c = int(rng, -5, 5);
        const p = int(rng, 1, 5);
        const value = p ** 3 + a * p ** 2 + b * p + c;
        const correct = num(value);
        const polynomial = polyStr([1, a, b, c]);
        return task(
          R`Reszta z dzielenia $W(x)=${polynomial}$ przez $x-${p}$ wynosi:`,
          correct,
          [num(value + 1), num(value - 1), num(c)],
          R`Z twierdzenia Bézouta reszta to $W(${p})=${value}$, bo podstawiamy $x=${p}$ do wielomianu.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const correct = math(polyStr([1, a, a * a]));
        return task(
          R`Iloraz $\frac{x^3-${a ** 3}}{x-${a}}$ jest równy:`,
          correct,
          [
            math(polyStr([1, -a, a * a])),
            math(polyStr([1, a, -a * a])),
            math(polyStr([1, a + 1, a * a])),
          ],
          R`Korzystamy ze wzoru $a^3-b^3=(a-b)(a^2+ab+b^2)$: $x^3-${a ** 3}=(x-${a})(x^2+${a}x+${a * a})$.`,
        );
      },
      (rng) => {
        const high = int(rng, 4, 7);
        const low = int(rng, 2, 3);
        const correct = num(high - low);
        return task(
          R`Wielomian stopnia $${high}$ dzielimy przez wielomian stopnia $${low}$. Stopień ilorazu wynosi:`,
          correct,
          [num(high + low), num(high), num(high - low + 1)],
          R`Przy dzieleniu wielomianów stopnie odejmują się: $${high}-${low}=${high - low}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 2, 5);
        const qq = int(rng, 1, 6);
        const c = -p * qq;
        const correct = num(qq - p);
        return task(
          R`Wielomian $W(x)=x^2+kx${c >= 0 ? "+" : ""}${c}$ jest podzielny przez $x-${p}$. Współczynnik $k$ jest równy:`,
          correct,
          [num(qq + p), num(p - qq), num(qq)],
          R`Z twierdzenia Bézouta $W(${p})=0$: $${p ** 2}+k\cdot${p}${c >= 0 ? "+" : ""}${c}=0$, więc $k=${qq - p}$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "rownania_wielomianowe",
    topicName: "Równania wielomianowe",
    gens: [
      (rng) => {
        const a = int(rng, 2, 6);
        const correct = `x=${a}`;
        return task(
          R`Rozwiąż równanie $x^3=${a ** 3}$.`,
          correct,
          [`x=-${a}`, `x=${a * a}`, `x=${a + 1}`],
          R`Obie strony są sześcianami: $x^3=${a}^3$, a funkcja $x^3$ jest różnowartościowa, więc $x=${a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, 1, 5);
        const correct = `x=${a}`;
        return task(
          R`Największy pierwiastek równania $x(x-${a})(x+${b})=0$ to:`,
          correct,
          [`x=-${b}`, "x=0", `x=${a + b}`],
          R`Pierwiastki to $0$, $${a}$ oraz $-${b}$. Największy z nich to $${a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const correct = `x=-${a}`;
        return task(
          R`Najmniejszy pierwiastek równania $x^3-${a * a}x=0$ to:`,
          correct,
          ["x=0", `x=${a}`, `x=-${a * a}`],
          R`Wyłączamy $x$: $x(x-${a})(x+${a})=0$. Pierwiastki to $-${a}$, $0$, $${a}$, więc najmniejszy to $-${a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        const b = int(rng, 1, 5);
        return task(
          R`Ile różnych pierwiastków ma równanie $(x-${a})^2(x+${b})=0$?`,
          "2",
          ["1", "3", "4"],
          R`Czynnik $(x-${a})^2$ daje pierwiastek $x=${a}$ (dwukrotny), a czynnik $x+${b}$ daje $x=-${b}$. Różnych pierwiastków jest $2$.`,
        );
      },
      (rng) => {
        const b = int(rng, 2, 7);
        const correct = `x=-${b}`;
        return task(
          R`Pierwiastek różny od zera równania $x^3+${b}x^2=0$ to:`,
          correct,
          [`x=${b}`, "x=0", `x=${b * b}`],
          R`$x^2(x+${b})=0$, więc $x=0$ lub $x=-${b}$. Pierwiastek różny od zera to $-${b}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, 3, 6);
        const correct = num(a + b);
        return task(
          R`Suma pierwiastków równania $x(x-${a})(x-${b})=0$ wynosi:`,
          correct,
          [num(a * b), num(b - a), "0"],
          R`Pierwiastki to $0$, $${a}$ i $${b}$. Ich suma to $0+${a}+${b}=${a + b}$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "rownania_wymierne",
    topicName: "Równania wymierne",
    gens: [
      (rng) => {
        const a = int(rng, 2, 7);
        const b = int(rng, 1, 6);
        const correct = `x=${a}`;
        return task(
          R`Rozwiąż równanie $\frac{x-${a}}{x-${b}}=0$.`,
          correct,
          [`x=-${a}`, `x=${a + 1}`, `x=${b}`, `x=${a + b}`],
          R`Licznik musi być zerem: $x-${a}=0$, czyli $x=${a}$. Mianownik jest wtedy różny od zera.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        const b = int(rng, 2, 6);
        const correct = `x=${a + b}`;
        return task(
          R`Rozwiąż równanie $\frac{1}{x-${a}}=\frac{1}{${b}}$.`,
          correct,
          [`x=${b - a}`, `x=${a * b}`, `x=${a + 1}`, `x=${b}`],
          R`Przy równych licznikach mianowniki są równe: $x-${a}=${b}$, więc $x=${a + b}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const correct = `x=${2 * a}`;
        return task(
          R`Rozwiąż równanie $\frac{x}{x-${a}}=2$.`,
          correct,
          [`x=${a}`, `x=-${2 * a}`, `x=${a / 2}`],
          R`Mnożymy przez mianownik: $x=2(x-${a})$, czyli $x=2x-${2 * a}$, więc $x=${2 * a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const correct = `x=-${a}`;
        return task(
          R`Rozwiąż równanie $\frac{x^2-${a * a}}{x-${a}}=0$.`,
          correct,
          [`x=${a}`, "x=0", `x=${a * a}`],
          R`Licznik to $(x-${a})(x+${a})$, więc $x=${a}$ lub $x=-${a}$. Dla $x=${a}$ mianownik jest zerem, więc zostaje $x=-${a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, 1, 5);
        const correct = `x=-${b}`;
        return task(
          R`Rozwiąż równanie $\frac{(x-${a})(x+${b})}{x-${a}}=0$.`,
          correct,
          [`x=${a}`, `x=${b}`, `x=${a + 1}`, `x=${b + 2}`],
          R`Skracamy czynnik $x-${a}$ (dla $x\ne${a}$): $x+${b}=0$, więc $x=-${b}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 3, 7);
        const x = 2 * b - a;
        if (x === a || x === b) return null;
        const correct = `x=${x}`;
        return task(
          R`Rozwiąż równanie $\frac{2}{x-${a}}=\frac{1}{x-${b}}$.`,
          correct,
          [`x=${a}`, `x=${b}`, `x=${2 * b}`, `x=${a + b}`],
          R`Mnożymy na krzyż: $2(x-${b})=x-${a}$, więc $2x-${2 * b}=x-${a}$ i $x=${x}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 7);
        return task(
          R`Dziedziną równania $\frac{x+1}{x^2-${a * a}}=0$ jest zbiór:`,
          `x ≠ -${a} i x ≠ ${a}`,
          [`x ≠ ${a}`, `x ≠ ${a * a}`, "wszystkie liczby rzeczywiste"],
          R`Mianownik nie może być zerem: $x^2-${a * a}\ne0$, czyli $x\ne-${a}$ i $x\ne${a}$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "nierownosci_kwadratowe",
    topicName: "Nierówności kwadratowe",
    gens: [
      (rng) => {
        const a = int(rng, 1, 4);
        const b = a + int(rng, 2, 5);
        const correct = interval(a, b);
        return task(
          R`Rozwiąż nierówność $(x-${a})(x-${b})<0$.`,
          correct,
          [
            closedInterval(a, b),
            math(R`(-\infty,${a})\cup(${b},\infty)`),
            interval(b, a + 1),
          ],
          R`Parabola ma ramiona w górę, a miejsca zerowe $${a}$ i $${b}$. Wartości ujemne są między pierwiastkami: $x\in(${a},${b})$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = a + int(rng, 2, 5);
        const correct = closedInterval(a, b);
        return task(
          R`Rozwiąż nierówność $(x-${a})(x-${b})\le0$.`,
          correct,
          [
            interval(a, b),
            math(R`(-\infty,${a}]\cup[${b},\infty)`),
            closedInterval(b, a + 1),
          ],
          R`Wartości niedodatnie leżą między pierwiastkami wraz z końcami: $x\in[${a},${b}]$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        const correct = interval(-a, a);
        return task(
          R`Rozwiąż nierówność $x^2<${a * a}$.`,
          correct,
          [
            closedInterval(-a, a),
            math(R`(-\infty,-${a})\cup(${a},\infty)`),
            interval(0, a),
          ],
          R`$x^2-${a * a}<0$, czyli $(x-${a})(x+${a})<0$. Rozwiązanie to $x\in(-${a},${a})$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        const correct = setUnionLeftRight(-a, a);
        return task(
          R`Rozwiąż nierówność $x^2\ge${a * a}$.`,
          correct,
          [
            closedInterval(-a, a),
            math(R`(-${a},${a})`),
            math(R`(${a},\infty)`),
          ],
          R`$x^2-${a * a}\ge0$, czyli $(x-${a})(x+${a})\ge0$. Ramiona paraboli są w górę, więc $x\in(-\infty,-${a}]\cup[${a},\infty)$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = a + int(rng, 2, 4);
        const correct = closedInterval(a, b);
        return task(
          R`Rozwiąż nierówność $x^2-${a + b}x+${a * b}\le0$.`,
          correct,
          [
            interval(a, b),
            math(R`(-\infty,${a})\cup(${b},\infty)`),
            closedInterval(-b, -a),
          ],
          R`Lewa strona to $(x-${a})(x-${b})$, więc rozwiązaniem jest $[${a},${b}]$.`,
        );
      },
      (rng) => {
        const c = int(rng, 1, 9);
        const correct = "zbiór liczb rzeczywistych";
        return task(
          R`Rozwiąż nierówność $x^2+${c}>0$.`,
          correct,
          ["zbiór pusty", "x>0", `x>-${c}`],
          R`$x^2\ge0$, więc $x^2+${c}\ge${c}>0$ dla każdej liczby rzeczywistej. Rozwiązaniem jest cały zbiór $\mathbb{R}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 6);
        const correct = `x=${a}`;
        return task(
          R`Rozwiąż nierówność $(x-${a})^2\le0$.`,
          correct,
          ["zbiór pusty", "zbiór liczb rzeczywistych", `x\\le${a}`],
          R`Kwadrat jest nieujemny, więc $(x-${a})^2\le0$ tylko wtedy, gdy $(x-${a})^2=0$, czyli $x=${a}$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "rownania_z_wartoscia_bezwzgledna",
    topicName: "Równania z wartością bezwzględną",
    gens: [
      (rng) => {
        const a = int(rng, 1, 6);
        const b = int(rng, 1, 6);
        const correct = `x=${a - b} lub x=${a + b}`;
        return task(
          R`Rozwiąż równanie $|x-${a}|=${b}$.`,
          correct,
          [
            `x=${a} lub x=${b}`,
            `x=-${a - b} lub x=${a + b}`,
            `x=-${a + b} lub x=${a + b}`,
          ],
          R`$|x-${a}|=${b}$ oznacza $x-${a}=${b}$ lub $x-${a}=-${b}$, więc $x=${a + b}$ lub $x=${a - b}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const correct = `x=-${a} lub x=${a}`;
        return task(
          R`Rozwiąż równanie $|x|=${a}$.`,
          correct,
          [`x=${a}`, `x=-${a}`, `x=${a * a}`],
          R`Odległość od zera wynosi $${a}$, więc $x=${a}$ lub $x=-${a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        const b = int(rng, 1, 6);
        const x1 = (a - b) / 2;
        const x2 = (a + b) / 2;
        if (!Number.isInteger(x1) || !Number.isInteger(x2)) return null;
        const correct = `x=${x1} lub x=${x2}`;
        return task(
          R`Rozwiąż równanie $|2x-${a}|=${b}$.`,
          correct,
          [
            `x=${a - b} lub x=${a + b}`,
            `x=${x1} lub x=${x2 + 1}`,
            `x=${x1 - 1} lub x=${x2}`,
          ],
          R`$2x-${a}=${b}$ lub $2x-${a}=-${b}$. Stąd $x=${x2}$ lub $x=${x1}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        const b = int(rng, 1, 3);
        const correct = interval(a - b, a + b);
        return task(
          R`Rozwiąż nierówność $|x-${a}|<${b}$.`,
          correct,
          [
            closedInterval(a - b, a + b),
            math(R`(-\infty,${a - b})\cup(${a + b},\infty)`),
            interval(a, a + b),
          ],
          R`Odległość $x$ od $${a}$ jest mniejsza od $${b}$, więc $x\in(${a - b},${a + b})$.`,
        );
      },
      (rng) => {
        const a = int(rng, 3, 8);
        const b = int(rng, 1, 3);
        const correct = math(R`(-\infty,${a - b})\cup(${a + b},\infty)`);
        return task(
          R`Rozwiąż nierówność $|x-${a}|>${b}$.`,
          correct,
          [
            interval(a - b, a + b),
            math(R`(${a + b},\infty)`),
            closedInterval(a - b, a + b),
          ],
          R`Odległość $x$ od $${a}$ jest większa od $${b}$, więc $x<${a - b}$ lub $x>${a + b}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = a + int(rng, 2, 6);
        const correct = num(b - a);
        return task(
          R`Jaka jest najmniejsza wartość wyrażenia $|x-${a}|+|x-${b}|$?`,
          correct,
          [num(a + b), num(b - a + 1), "0"],
          R`Suma odległości od punktów $${a}$ i $${b}$ jest najmniejsza dla $x$ między nimi i wynosi $${b}-${a}=${b - a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 9);
        const correct = "brak rozwiązań";
        return task(
          R`Rozwiąż równanie $|x|=-${a}$.`,
          correct,
          [`x=-${a}`, `x=${a}`, "x=0"],
          R`Wartość bezwzględna jest nieujemna, więc nigdy nie jest równa liczbie ujemnej. Równanie nie ma rozwiązań.`,
        );
      },
    ],
  },
];

// TOPICS jest składane na końcu pliku.

/** Zapis y = kx + b bez zbędnych znaków. */
function linear(k, b, variable = "x") {
  const head = k === 1 ? variable : k === -1 ? `-${variable}` : `${k}${variable}`;
  if (b === 0) return head;
  return `${head}${b > 0 ? "+" : ""}${b}`;
}

/** Ten sam wielomian, ale ze zmienną n. */
function polyN(coefs) {
  return polyStr(coefs).replace(/x/g, "n");
}

/** Współczynnik przy pi: 1 daje samo pi, a nie 1 pi. */
function piCoeff(c) {
  if (c === 1) return "\\pi";
  if (c === -1) return "-\\pi";
  return `${c}\\pi`;
}

/** Miara łukowa p/q * pi. */
function radStr(numerator, denominator = 1) {
  const g = gcd(numerator, denominator);
  const p = numerator / g;
  const q = denominator / g;
  if (q === 1) return p === 1 ? "\\pi" : `${p}\\pi`;
  return p === 1 ? `\\frac{\\pi}{${q}}` : `\\frac{${p}\\pi}{${q}}`;
}

const TRIG_VALUES = {
  120: { sin: R`\frac{\sqrt3}{2}`, cos: R`-\frac12`, tg: R`-\sqrt3` },
  135: { sin: R`\frac{\sqrt2}{2}`, cos: R`-\frac{\sqrt2}{2}`, tg: "-1" },
  150: { sin: R`\frac12`, cos: R`-\frac{\sqrt3}{2}`, tg: R`-\frac{\sqrt3}{3}` },
  210: { sin: R`-\frac12`, cos: R`-\frac{\sqrt3}{2}`, tg: R`\frac{\sqrt3}{3}` },
  225: { sin: R`-\frac{\sqrt2}{2}`, cos: R`-\frac{\sqrt2}{2}`, tg: "1" },
  240: { sin: R`-\frac{\sqrt3}{2}`, cos: R`-\frac12`, tg: R`\sqrt3` },
  300: { sin: R`-\frac{\sqrt3}{2}`, cos: R`\frac12`, tg: R`-\sqrt3` },
  315: { sin: R`-\frac{\sqrt2}{2}`, cos: R`\frac{\sqrt2}{2}`, tg: "-1" },
  330: { sin: R`-\frac12`, cos: R`\frac{\sqrt3}{2}`, tg: R`-\frac{\sqrt3}{3}` },
};

const TRIG_POOL = [
  R`\frac12`,
  R`-\frac12`,
  R`\frac{\sqrt2}{2}`,
  R`-\frac{\sqrt2}{2}`,
  R`\frac{\sqrt3}{2}`,
  R`-\frac{\sqrt3}{2}`,
  "1",
  "-1",
  R`\frac{\sqrt3}{3}`,
  R`-\frac{\sqrt3}{3}`,
  R`\sqrt3`,
  R`-\sqrt3`,
];

const ALGEBRA_B = [
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "wzory_viete",
    topicName: "Wzory Viète'a",
    gens: [
      (rng) => {
        const p = int(rng, 1, 5);
        const qq = p + int(rng, 1, 4);
        const b = -(p + qq);
        const c = p * qq;
        return task(
          R`Suma pierwiastków równania $${polyStr([1, b, c])}=0$ wynosi:`,
          num(p + qq),
          [num(c), num(p + qq + 1), num(qq - p)],
          R`Ze wzorów Viète'a $x_1+x_2=-\frac{b}{a}=${p + qq}$. Pierwiastki to $${p}$ i $${qq}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 1, 5);
        const qq = p + int(rng, 1, 4);
        const b = -(p + qq);
        const c = p * qq;
        return task(
          R`Iloczyn pierwiastków równania $${polyStr([1, b, c])}=0$ wynosi:`,
          num(c),
          [num(p + qq), num(c + p + qq), num(c - 1)],
          R`Ze wzorów Viète'a $x_1x_2=\frac{c}{a}=${c}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 1, 5);
        const qq = p + int(rng, 1, 4);
        const sum = p + qq;
        const product = p * qq;
        const correct = num(sum * sum - 2 * product);
        return task(
          R`Pierwiastki równania $${polyStr([1, -sum, product])}=0$ to $x_1$ i $x_2$. Oblicz $x_1^2+x_2^2$.`,
          correct,
          [num(sum * sum + 2 * product), num(sum * sum - product), num(2 * product - sum * sum)],
          R`$x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2=${sum}^2-2\cdot${product}=${correct}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 1, 5);
        const qq = p + int(rng, 1, 4);
        const sum = p + qq;
        const product = p * qq;
        const correct = math(fracStr(sum, product));
        return task(
          R`Pierwiastki równania $${polyStr([1, -sum, product])}=0$ to $x_1$ i $x_2$. Oblicz $\frac{1}{x_1}+\frac{1}{x_2}$.`,
          correct,
          [
            math(fracStr(product, sum)),
            math(fracStr(sum, product + 1)),
            num(product - sum),
          ],
          R`$\frac{1}{x_1}+\frac{1}{x_2}=\frac{x_1+x_2}{x_1x_2}=\frac{${sum}}{${product}}=${fracStr(sum, product)}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 1, 5);
        const qq = p + int(rng, 1, 4);
        const sum = p + qq;
        const product = p * qq;
        const correct = math(polyStr([1, -sum, product]));
        return task(
          R`Równanie kwadratowe, którego pierwiastkami są $${p}$ i $${qq}$, ma postać:`,
          correct,
          [
            math(polyStr([1, sum, product])),
            math(polyStr([1, -sum, -product])),
            math(polyStr([1, sum, -product])),
          ],
          R`$x^2-(x_1+x_2)x+x_1x_2=0$, czyli $x^2-${sum}x+${product}=0$.`,
        );
      },
      (rng) => {
        const p = int(rng, 1, 5);
        const qq = p + int(rng, 1, 4);
        const correct = num(qq - p);
        return task(
          R`Pierwiastki równania $${polyStr([1, -(p + qq), p * qq])}=0$ to $x_1$ i $x_2$. Oblicz $|x_1-x_2|$.`,
          correct,
          [num(p + qq), num(p * qq), num(qq - p + 1)],
          R`$|x_1-x_2|=\sqrt{(x_1+x_2)^2-4x_1x_2}$. Pierwiastki to $${p}$ i $${qq}$, więc różnica wynosi $${qq - p}$.`,
        );
      },
      (rng) => {
        const p = int(rng, 1, 4);
        const qq = p + int(rng, 1, 3);
        const sum = p + qq;
        const product = p * qq;
        const correct = num(sum ** 3 - 3 * product * sum);
        return task(
          R`Pierwiastki równania $${polyStr([1, -sum, product])}=0$ to $x_1$ i $x_2$. Oblicz $x_1^3+x_2^3$.`,
          correct,
          [
            num(sum ** 3 + 3 * product * sum),
            num(sum ** 3 - product * sum),
            num(sum ** 3),
          ],
          R`$x_1^3+x_2^3=(x_1+x_2)^3-3x_1x_2(x_1+x_2)=${sum}^3-3\cdot${product}\cdot${sum}=${correct}$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "uklady_liniowo_kwadratowe",
    topicName: "Układy liniowo-kwadratowe",
    gens: [
      (rng) => {
        const a = int(rng, 2, 6);
        return task(
          R`Ile rozwiązań ma układ równań $y=x^2$ i $y=${a * a}$?`,
          "2",
          ["0", "1", "4"],
          R`$x^2=${a * a}$, więc $x=${a}$ lub $x=-${a}$. Układ ma dwa rozwiązania: $(${a},${a * a})$ i $(-${a},${a * a})$.`,
        );
      },
      (rng) => {
        const c = int(rng, -3, 3);
        const delta = 1 + 4 * c;
        const count = delta > 0 ? "2" : delta === 0 ? "1" : "0";
        return task(
          R`Ile rozwiązań ma układ równań $y=x^2$ i $y=${linear(1, c)}$?`,
          count,
          ["0", "1", "2", "3"].filter((value) => value !== count),
          R`Podstawiamy $x^2=${linear(1, c)}$, czyli $${polyStr([1, -1, -c])}=0$. Wyróżnik wynosi $\Delta=${delta}$, więc rozwiązań jest $${count}$.`,
        );
      },
      (rng) => {
        const p = int(rng, -3, 2);
        const qq = p + int(rng, 1, 3);
        const k = p + qq;
        const m = -p * qq;
        return task(
          R`Układ $y=x^2$ i $y=${linear(k, m)}$ ma dwa rozwiązania. Suma ich współrzędnych $x$ wynosi:`,
          num(k),
          [num(p * qq), num(-p * qq), num(p - qq)],
          R`Po podstawieniu $x^2=${linear(k, m)}$ otrzymujemy $${polyStr([1, -k, -m])}=0$. Suma pierwiastków to $${k}$.`,
        );
      },
      (rng) => {
        const p = int(rng, -3, 2);
        const qq = p + int(rng, 1, 3);
        const k = p + qq;
        const m = -p * qq;
        return task(
          R`Układ $y=x^2$ i $y=${linear(k, m)}$ ma dwa rozwiązania. Iloczyn ich współrzędnych $x$ wynosi:`,
          num(-m),
          [num(k), num(-k), num(p + qq + 1)],
          R`Równanie $${polyStr([1, -k, -m])}=0$ ma iloczyn pierwiastków równy $${-m}$.`,
        );
      },
      (rng) => {
        const p = int(rng, -3, 2);
        const qq = p + int(rng, 1, 3);
        const k = p + qq;
        const m = -p * qq;
        return task(
          R`Rozwiąż układ $y=x^2$ i $y=${linear(k, m)}$. Większa współrzędna $x$ rozwiązania wynosi:`,
          num(Math.max(p, qq)),
          [num(Math.min(p, qq)), num(k), num(m)],
          R`Pierwiastki równania $${polyStr([1, -k, -m])}=0$ to $${p}$ i $${qq}$, więc większa współrzędna $x$ to $${Math.max(p, qq)}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 6);
        return task(
          R`Ile rozwiązań ma układ $y=(x-${a})^2$ i $y=0$?`,
          "1",
          ["0", "2", "4"],
          R`$(x-${a})^2=0$ tylko dla $x=${a}$, więc układ ma jedno rozwiązanie: $(${a},0)$.`,
        );
      },
      (rng) => {
        const p = int(rng, -3, 2);
        const qq = p + int(rng, 1, 3);
        const k = p + qq;
        const m = -p * qq;
        return task(
          R`Rozwiąż układ $y=x^2$ i $y=${linear(k, m)}$. Mniejsza współrzędna $x$ rozwiązania wynosi:`,
          num(Math.min(p, qq)),
          [num(Math.max(p, qq)), num(k), num(-m)],
          R`Po podstawieniu $${polyStr([1, -k, -m])}=0$ otrzymujemy pierwiastki $${p}$ i $${qq}$, więc mniejsza współrzędna $x$ to $${Math.min(p, qq)}$.`,
        );
      },
    ],
  },
  {
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "zadania_tekstowe_uklady",
    topicName: "Zadania tekstowe z układami",
    gens: [
      (rng) => {
        const smaller = int(rng, 3, 15);
        const difference = int(rng, 2, 6);
        const larger = smaller + difference;
        const sum = smaller + larger;
        return task(
          R`Suma dwóch liczb wynosi $${sum}$, a ich różnica to $${difference}$. Większa z tych liczb to:`,
          num(larger),
          [num(smaller), num(sum), num(difference)],
          R`Oznaczmy liczby przez $x$ i $y$. Wtedy $x+y=${sum}$ oraz $x-y=${difference}$. Dodając równania, dostajemy $2x=${sum + difference}$, więc $x=${larger}$.`,
        );
      },
      (rng) => {
        const smaller = int(rng, 2, 9);
        const k = int(rng, 2, 5);
        const sum = smaller * (k + 1);
        return task(
          R`Jedna liczba jest $${k}$ razy większa od drugiej, a ich suma wynosi $${sum}$. Mniejsza z tych liczb to:`,
          num(smaller),
          [num(sum - smaller), num(sum), num(smaller + 1)],
          R`Niech mniejsza liczba będzie $x$. Wtedy $x+${k}x=${sum}$, czyli $${k + 1}x=${sum}$, więc $x=${smaller}$.`,
        );
      },
      (rng) => {
        const adults = int(rng, 3, 12);
        const children = int(rng, 4, 15);
        const priceAdult = int(rng, 15, 25);
        const priceChild = int(rng, 8, 14);
        const total = adults * priceAdult + children * priceChild;
        const count = adults + children;
        return task(
          R`Na wycieczkę pojechało $${count}$ osób. Bilet dla dorosłego kosztował $${priceAdult}$ zł, a dla dziecka $${priceChild}$ zł. Razem zapłacono $${total}$ zł. Ile było osób dorosłych?`,
          num(adults),
          [num(children), num(count), num(adults + 1)],
          R`Niech $x$ oznacza dorosłych, a $y$ dzieci. Wtedy $x+y=${count}$ oraz $${priceAdult}x+${priceChild}y=${total}$. Po podstawieniu $y=${count}-x$ otrzymujemy $x=${adults}$.`,
        );
      },
      (rng) => {
        const son = int(rng, 8, 15);
        const father = 3 * son;
        const sum = father + son;
        return task(
          R`Ojciec jest $3$ razy starszy od syna. Razem mają $${sum}$ lat. Ile lat ma syn?`,
          num(son),
          [num(father), num(sum), num(son + 2)],
          R`Jeśli syn ma $x$ lat, to ojciec ma $3x$. Z równania $x+3x=${sum}$ dostajemy $4x=${sum}$, czyli $x=${son}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 4, 12);
        const b = a + int(rng, 2, 6);
        const perimeter = 2 * (a + b);
        const difference = b - a;
        return task(
          R`Prostokąt ma obwód $${perimeter}$ cm, a różnica długości jego boków wynosi $${difference}$ cm. Dłuższy bok ma długość:`,
          `${b} cm`,
          [`${a} cm`, `${perimeter / 2} cm`, `${b + 1} cm`],
          R`Niech boki mają $a$ i $b$ cm. Wtedy $2(a+b)=${perimeter}$ oraz $b-a=${difference}$. Stąd $a+b=${perimeter / 2}$, więc $b=${b}$ cm.`,
        );
      },
      (rng) => {
        const apple = int(rng, 3, 7);
        const pear = int(rng, 4, 9);
        const together = apple + pear;
        const total = 2 * apple + 3 * pear;
        return task(
          R`$2$ kg jabłek i $3$ kg gruszek kosztują $${total}$ zł, a $1$ kg jabłek i $1$ kg gruszek kosztuje $${together}$ zł. Ile kosztuje $1$ kg jabłek?`,
          `${apple} zł`,
          [`${pear} zł`, `${together} zł`, `${total} zł`],
          R`Z drugiego równania $g=${together}-j$. Po podstawieniu $2j+3(${together}-j)=${total}$ otrzymujemy $j=${apple}$ zł.`,
        );
      },
      (rng) => {
        const smaller = int(rng, 3, 10);
        const difference = int(rng, 2, 8);
        const larger = smaller + difference;
        const sum = smaller + larger;
        return task(
          R`Różnica dwóch liczb wynosi $${difference}$, a ich suma to $${sum}$. Mniejsza z tych liczb to:`,
          num(smaller),
          [num(larger), num(sum), num(difference)],
          R`Dodając i odejmując równania $x+y=${sum}$ oraz $x-y=${difference}$, otrzymujemy $2x=${sum - difference}$, czyli $x=${smaller}$.`,
        );
      },
    ],
  },
];

const FUNKCJE = [
  {
    category: "funkcje",
    categoryName: "Funkcje",
    topic: "przeksztalcenia_wykresow",
    topicName: "Przekształcenia wykresów",
    gens: [
      (rng) => {
        const a = pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4]);
        const b = int(rng, -4, 4);
        const correct = `(${a},${b})`;
        return task(
          R`Wykres funkcji $g(x)=${xplus(-a)}^2${shift(b)}$ powstaje z wykresu $f(x)=x^2$ przez przesunięcie. Wierzchołek paraboli $g$ to punkt:`,
          correct,
          [`(${-a},${b})`, `(${a},${b + 1})`, `(${a + 1},${b})`],
          R`Postać kanoniczna $g(x)=${xplus(-a)}^2${shift(b)}$ ma wierzchołek $(${a},${b})$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        return task(
          R`Wykres funkcji $g(x)=f(x)+${a}$ otrzymujemy z wykresu $f$ przez:`,
          `przesunięcie o ${a} jednostki w górę`,
          [
            `przesunięcie o ${a} jednostki w dół`,
            `przesunięcie o ${a} jednostki w prawo`,
            `przesunięcie o ${a} jednostki w lewo`,
          ],
          R`Dodanie liczby do wartości funkcji podnosi każdy punkt wykresu o $${a}$ jednostek w górę.`,
        );
      },
      () => {
        return task(
          R`Wykres funkcji $g(x)=-f(x)$ otrzymujemy z wykresu $f$ przez:`,
          "symetrię względem osi OX",
          [
            "symetrię względem osi OY",
            "symetrię względem początku układu współrzędnych",
            "symetrię względem prostej y=x",
          ],
          R`Zmiana znaku wartości funkcji odbija wykres względem osi $OX$.`,
        );
      },
      () => {
        return task(
          R`Wykres funkcji $g(x)=f(-x)$ otrzymujemy z wykresu $f$ przez:`,
          "symetrię względem osi OY",
          [
            "symetrię względem osi OX",
            "symetrię względem początku układu współrzędnych",
            "przesunięcie o jedną jednostkę w lewo",
          ],
          R`Zamiana $x$ na $-x$ odbija wykres względem osi $OY$.`,
        );
      },
      () => {
        return task(
          R`Wykres funkcji $g(x)=|f(x)|$ powstaje z wykresu $f$ przez:`,
          "odbicie części leżącej pod osią OX nad tę oś",
          [
            "odbicie części leżącej nad osią OX pod tę oś",
            "symetrię względem osi OY",
            "dwukrotne rozciągnięcie w kierunku osi OY",
          ],
          R`Wartość bezwzględna zamienia ujemne wartości na dodatnie, więc część wykresu pod osią $OX$ odbija się nad nią.`,
        );
      },
      () => {
        return task(
          R`Wykres funkcji $g(x)=2f(x)$ powstaje z wykresu $f$ przez:`,
          "rozciągnięcie dwukrotne w kierunku osi OY",
          [
            "rozciągnięcie dwukrotne w kierunku osi OX",
            "ściśnięcie dwukrotne w kierunku osi OY",
            "przesunięcie o 2 jednostki w górę",
          ],
          R`Mnożenie wartości funkcji przez $2$ podwaja każdą rzędną, czyli rozciąga wykres dwukrotnie w kierunku osi $OY$.`,
        );
      },
      (rng) => {
        const a = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
        const b = int(rng, -5, 5);
        const correct = `(${-a},${b})`;
        return task(
          R`Wykres funkcji $g(x)=${xplus(-a)}^2${shift(b)}$ powstaje z paraboli $y=x^2$. Wierzchołek $g$ to punkt:`,
          correct,
          [`(${a},${b})`, `(${-a + 1},${b})`, `(${-a},${b + 1})`],
          R`Postać kanoniczna $g(x)=${xplus(-a)}^2${shift(b)}$ ma wierzchołek $(${-a},${b})$.`,
        );
      },
    ],
  },
];

const CIAGI = [
  {
    category: "ciagi",
    categoryName: "Ciągi",
    topic: "wyrazy_ciagu",
    topicName: "Wyrazy i monotoniczność ciągu",
    gens: [
      (rng) => {
        const k = int(rng, 2, 5);
        const b = int(rng, -6, 6);
        const m = int(rng, 5, 10);
        const value = k * m + b;
        return task(
          R`Ciąg jest określony wzorem $a_n=${linear(k, b, "n")}$. Oblicz $a_{${m}}$.`,
          num(value),
          [num(value + k), num(value - k), num(k + m + b)],
          R`$a_{${m}}=${k}\cdot${m}${b >= 0 ? "+" : ""}${b}=${value}$.`,
        );
      },
      (rng) => {
        const c = int(rng, 1, 4);
        const m = int(rng, 5, 10);
        const value = m * m - c * m;
        return task(
          R`Ciąg jest określony wzorem $a_n=${polyN([1, -c, 0])}$. Oblicz $a_{${m}}$.`,
          num(value),
          [num(value + m), num(value - c), num(m * m + c * m)],
          R`$a_{${m}}=${m}^2-${c}\cdot${m}=${m * m}-${c * m}=${value}$.`,
        );
      },
      (rng) => {
        const k = pick(rng, [-3, -2, -1, 1, 2, 3]);
        const b = int(rng, -5, 5);
        const correct = k > 0 ? "rosnący" : "malejący";
        return task(
          R`Ciąg $a_n=${linear(k, b, "n")}$ jest:`,
          correct,
          ["rosnący", "malejący", "stały", "naprzemienny"].filter(
            (value) => value !== correct,
          ),
          R`Różnica $a_{n+1}-a_n=${k}$ jest ${k > 0 ? "dodatnia" : "ujemna"}, więc ciąg jest ${correct}.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 4);
        const b = int(rng, -4, 4);
        const n = int(rng, 4, 12);
        const value = k * n + b;
        return task(
          R`Ciąg $a_n=${linear(k, b, "n")}$ osiąga wartość $${value}$ dla $n$ równego:`,
          num(n),
          [num(n + 1), num(n - 1), num(value)],
          R`Rozwiązujemy $${linear(k, b, "n")}=${value}$, czyli $${k}n=${value - b}$, więc $n=${n}$.`,
        );
      },
      (rng) => {
        const c = int(rng, 1, 6);
        const d = int(rng, 2, 5);
        const value = c + 5 * d;
        return task(
          R`Ciąg spełnia $a_1=${c}$ oraz $a_{n+1}=a_n+${d}$. Oblicz $a_6$.`,
          num(value),
          [num(c + 4 * d), num(c + 6 * d), num(c * d)],
          R`Od $a_1$ do $a_6$ wykonujemy $5$ kroków: $a_6=${c}+5\cdot${d}=${value}$.`,
        );
      },
      (rng) => {
        const m = int(rng, 3, 8);
        const value = (m % 2 === 0 ? 1 : -1) * m;
        return task(
          R`Ciąg jest określony wzorem $a_n=(-1)^n\cdot n$. Oblicz $a_{${m}}$.`,
          num(value),
          [num(-value), num(m * m), num(m)],
          R`Dla $n=${m}$ mamy $(-1)^{${m}}=${m % 2 === 0 ? 1 : -1}$, więc $a_{${m}}=${value}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 1, 4);
        return task(
          R`Ciąg $a_n=\frac{n+${k}}{n}$ dla $n\ge1$ jest:`,
          "malejący",
          ["rosnący", "stały", "naprzemienny"],
          R`$a_n=1+\frac{${k}}{n}$, a wraz ze wzrostem $n$ ułamek $\frac{${k}}{n}$ maleje, więc ciąg jest malejący.`,
        );
      },
    ],
  },
  {
    category: "ciagi",
    categoryName: "Ciągi",
    topic: "granica_ciagu",
    topicName: "Granica ciągu",
    gens: [
      (rng) => {
        const a = int(rng, 1, 6);
        let c = int(rng, 1, 6);
        if (c === a) c = a === 6 ? 5 : a + 1;
        const b = int(rng, -4, 4);
        const d = int(rng, -4, 4);
        const value = fracStr(a, c);
        return task(
          R`Oblicz $\lim_{n\to\infty}\frac{${linear(a, b, "n")}}{${linear(c, d, "n")}}$.`,
          math(value),
          [
            math(fracStr(c, a)),
            num(a + c),
            math(fracStr(a + 1, c)),
          ],
          R`Stopnie licznika i mianownika są równe, więc granica to iloraz współczynników przy $n$: $\frac{${a}}{${c}}=${value}$.`,
        );
      },
      (rng) => {
        const b = int(rng, 2, 6);
        const a = int(rng, -4, 4);
        const c = int(rng, -4, 4);
        return task(
          R`Oblicz $\lim_{n\to\infty}\frac{${polyN([1, a, 0])}}{${polyN([b, 0, c])}}$.`,
          math(fracStr(1, b)),
          [num(b), math(fracStr(1, b + 1)), "0"],
          R`Najwyższa potęga $n$ to $n^2$. Iloraz współczynników wynosi $\frac{1}{${b}}$, więc granica to $${fracStr(1, b)}$.`,
        );
      },
      (rng) => {
        const k = pick(rng, [2, 4, 6, 8]);
        return task(
          R`Oblicz $\lim_{n\to\infty}\left(\sqrt{n^2+${k}n}-n\right)$.`,
          num(k / 2),
          [num(k), num(k / 2 + 1), "0"],
          R`Mnożymy przez sprzężenie: $\frac{${k}n}{\sqrt{n^2+${k}n}+n}\to\frac{${k}}{2}=${k / 2}$.`,
        );
      },
      (rng) => {
        const p = pick(rng, [
          [1, 2],
          [2, 3],
          [3, 4],
        ]);
        return task(
          R`Oblicz $\lim_{n\to\infty}\left(\frac{${p[0]}}{${p[1]}}\right)^n$.`,
          "0",
          ["1", "nieskończoność", "nie istnieje"],
          R`Podstawa $\frac{${p[0]}}{${p[1]}}$ należy do przedziału $(0,1)$, więc jej kolejne potęgi dążą do $0$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 7);
        const b = int(rng, -5, 5);
        return task(
          R`Oblicz $\lim_{n\to\infty}\frac{${linear(k, b, "n")}}{n}$.`,
          num(k),
          [num(k + 1), num(b), "0"],
          R`Dzielimy licznik i mianownik przez $n$: $\lim (${k}+\frac{${b}}{n})=${k}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, -5, 5);
        const c = int(rng, -5, 5);
        return task(
          R`Oblicz $\lim_{n\to\infty}\frac{${polyN([a, b, 0])}}{${polyN([1, 0, c])}}$.`,
          num(a),
          [num(a + 1), num(1 / a), num(b)],
          R`Iloraz współczynników przy $n^2$ to $\frac{${a}}{1}=${a}$.`,
        );
      },
      (rng) => {
        const base = pick(rng, [2, 3]);
        return task(
          R`Oblicz $\lim_{n\to\infty}\frac{${base}^n}{${base + 1}^n+1}$.`,
          "0",
          [math(fracStr(base, base + 1)), "1", "nieskończoność"],
          R`Dzielimy licznik i mianownik przez $${base + 1}^n$: $\left(\frac{${base}}{${base + 1}}\right)^n\to0$, a mianownik dąży do $1$.`,
        );
      },
    ],
  },
  {
    category: "ciagi",
    categoryName: "Ciągi",
    topic: "szereg_geometryczny",
    topicName: "Szereg geometryczny",
    gens: [
      (rng) => {
        const a = 2 * int(rng, 1, 5);
        const sum = 2 * a;
        return task(
          R`Oblicz sumę szeregu geometrycznego $${a}+${a / 2}+${a / 4}+\ldots$`,
          num(sum),
          [num(a), num(2 * a + 1), num(a / 2)],
          R`$a_1=${a}$, $q=\frac12$, więc $S=\frac{${a}}{1-\frac12}=${sum}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 4);
        const value = fracStr(1, k - 1);
        return task(
          R`Oblicz sumę szeregu $\sum_{n=1}^{\infty}\left(\frac{1}{${k}}\right)^n$.`,
          math(value),
          [
            math(fracStr(1, k)),
            math(fracStr(1, k + 1)),
            num(k),
          ],
          R`$a_1=\frac{1}{${k}}$, $q=\frac{1}{${k}}$, więc $S=\frac{\frac{1}{${k}}}{1-\frac{1}{${k}}}=\frac{1}{${k - 1}}$.`,
        );
      },
      () => {
        return task(
          R`Szereg geometryczny o ilorazie $q$ jest zbieżny, gdy:`,
          "|q|<1",
          ["q>1", "|q|>1", "q<1"],
          R`Szereg geometryczny zbieżny jest dokładnie wtedy, gdy $|q|<1$.`,
        );
      },
      (rng) => {
        const d = int(rng, 1, 8);
        return task(
          R`Zamień ułamek okresowy $0,${d}${d}${d}\ldots$ na ułamek zwykły.`,
          math(fracStr(d, 9)),
          [
            math(fracStr(d, 10)),
            math(fracStr(d, 99)),
            math(fracStr(d + 1, 9)),
          ],
          R`$0,${d}${d}\ldots=\frac{${d}}{10}+\frac{${d}}{100}+\ldots=\frac{\frac{${d}}{10}}{1-\frac{1}{10}}=\frac{${d}}{9}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 8);
        const b = int(rng, 1, 9);
        if (a === b) return null;
        const value = fracStr(10 * a + b, 99);
        return task(
          R`Zamień ułamek okresowy $0,${a}${b}${a}${b}\ldots$ na ułamek zwykły.`,
          math(value),
          [
            math(fracStr(10 * a + b, 100)),
            math(fracStr(a, 9)),
            math(fracStr(10 * a + b, 999)),
          ],
          R`To szereg z $a_1=\frac{${10 * a + b}}{100}$ i $q=\frac{1}{100}$, więc suma wynosi $\frac{${10 * a + b}}{99}=${value}$.`,
        );
      },
      (rng) => {
        const a = 2 * int(rng, 1, 4);
        const sum = 2 * a;
        return task(
          R`Suma zbieżnego szeregu geometrycznego wynosi $${sum}$, a jego pierwszy wyraz to $${a}$. Iloraz tego szeregu jest równy:`,
          math(fracStr(1, 2)),
          [math(fracStr(1, 3)), math(fracStr(1, 4)), num(2)],
          R`$S=\frac{a_1}{1-q}$, więc $1-q=\frac{${a}}{${sum}}=\frac12$ i $q=\frac12$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 4);
        const first = 3 * k;
        const sum = fracStr(9 * k, 2);
        return task(
          R`Oblicz sumę szeregu $${first}+${k}+\frac{${k}}{3}+\ldots$`,
          math(sum),
          [
            math(fracStr(9 * k, 4)),
            num(2 * first),
            math(fracStr(3 * k, 2)),
          ],
          R`$a_1=${first}$, $q=\frac13$, więc $S=\frac{${first}}{1-\frac13}=\frac{${9 * k}}{2}=${sum}$.`,
        );
      },
    ],
  },
];

const TRYGONOMETRIA = [
  {
    category: "trygonometria",
    categoryName: "Trygonometria",
    topic: "tozsamosci_trygonometryczne",
    topicName: "Tożsamości trygonometryczne",
    gens: [
      (rng) => {
        const [a, b, c] = pick(rng, [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
          [7, 24, 25],
        ]);
        return task(
          R`Kąt $\alpha$ jest ostry i $\sin\alpha=\frac{${a}}{${c}}$. Wartość $\cos\alpha$ wynosi:`,
          math(fracStr(b, c)),
          [math(fracStr(a, c)), math(fracStr(b, a)), math(fracStr(c, b))],
          R`Z jedynki trygonometrycznej $\cos^2\alpha=1-\left(\frac{${a}}{${c}}\right)^2=\frac{${b * b}}{${c * c}}$. Ponieważ kąt jest ostry, $\cos\alpha=\frac{${b}}{${c}}$.`,
        );
      },
      (rng) => {
        const [a, b, c] = pick(rng, [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
          [7, 24, 25],
        ]);
        return task(
          R`Kąt $\alpha$ jest ostry i $\cos\alpha=\frac{${b}}{${c}}$. Wartość $\sin\alpha$ wynosi:`,
          math(fracStr(a, c)),
          [math(fracStr(b, c)), math(fracStr(a, b)), math(fracStr(c, a))],
          R`$\sin^2\alpha=1-\left(\frac{${b}}{${c}}\right)^2=\frac{${a * a}}{${c * c}}$, a kąt jest ostry, więc $\sin\alpha=\frac{${a}}{${c}}$.`,
        );
      },
      (rng) => {
        const [a, b, c] = pick(rng, [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
        ]);
        return task(
          R`Kąt $\alpha$ jest ostry, $\sin\alpha=\frac{${a}}{${c}}$ i $\cos\alpha=\frac{${b}}{${c}}$. Wartość $\operatorname{tg}\alpha$ wynosi:`,
          math(fracStr(a, b)),
          [math(fracStr(b, a)), math(fracStr(a, c)), math(fracStr(c, b))],
          R`$\operatorname{tg}\alpha=\frac{\sin\alpha}{\cos\alpha}=\frac{${a}}{${b}}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        const m = int(rng, 1, 4);
        const correct = num(k - m);
        return task(
          R`Oblicz $${k}(\sin^2\alpha+\cos^2\alpha)-${m}$.`,
          correct,
          [num(k + m), num(k), num(k * m)],
          R`$\sin^2\alpha+\cos^2\alpha=1$, więc wyrażenie ma wartość $${k}\cdot1-${m}=${correct}$.`,
        );
      },
      (rng) => {
        const [p, q, cn, cd] = pick(rng, [
          [1, 4, 3, 2],
          [1, 3, 5, 3],
          [1, 2, 2, 1],
          [1, 5, 7, 5],
        ]);
        const correct = math(fracStr(cn, cd));
        return task(
          R`Wiadomo, że $\sin\alpha\cos\alpha=\frac{${p}}{${q}}$. Oblicz $(\sin\alpha+\cos\alpha)^2$.`,
          correct,
          [
            num(1),
            num(0),
            num(3),
          ],
          R`$(\sin\alpha+\cos\alpha)^2=\sin^2\alpha+2\sin\alpha\cos\alpha+\cos^2\alpha=1+\frac{${2 * p}}{${q}}=\frac{${cn}}{${cd}}$.`,
        );
      },
      (rng) => {
        const [a, b, c] = pick(rng, [
          [3, 4, 5],
          [5, 12, 13],
          [8, 15, 17],
        ]);
        return task(
          R`Kąt $\alpha$ jest ostry i $\operatorname{tg}\alpha=\frac{${a}}{${b}}$. Oblicz $\frac{1}{\cos^2\alpha}$.`,
          math(fracStr(c * c, b * b)),
          [
            math(fracStr(c, b)),
            math(fracStr(a * a, b * b)),
            math(fracStr(c * c, a * a)),
          ],
          R`$1+\operatorname{tg}^2\alpha=\frac{1}{\cos^2\alpha}$, więc wynik to $1+\frac{${a * a}}{${b * b}}=\frac{${c * c}}{${b * b}}$.`,
        );
      },
      (rng) => {
        const [p, q, cn, cd] = pick(rng, [
          [1, 2, 1, 2],
          [1, 3, 7, 9],
          [1, 4, 7, 8],
        ]);
        return task(
          R`Wiadomo, że $\sin\alpha\cos\alpha=\frac{${p}}{${q}}$. Oblicz $\sin^4\alpha+\cos^4\alpha$.`,
          math(fracStr(cn, cd)),
          [
            num(1),
            num(2),
            num(0),
          ],
          R`$\sin^4\alpha+\cos^4\alpha=(\sin^2\alpha+\cos^2\alpha)^2-2\sin^2\alpha\cos^2\alpha=1-2\cdot\frac{${p * p}}{${q * q}}=\frac{${cn}}{${cd}}$.`,
        );
      },
    ],
  },
  {
    category: "trygonometria",
    categoryName: "Trygonometria",
    topic: "miara_lukowa",
    topicName: "Miara łukowa kąta",
    gens: [
      (rng) => {
        const angle = pick(rng, [30, 45, 60, 90, 120, 135, 150, 180, 270, 360]);
        const value = radStr(angle, 180);
        return task(
          R`Kąt $${angle}^\circ$ ma miarę łukową:`,
          math(value),
          [math(radStr(angle, 360)), math(radStr(angle, 90)), math(value.replace("\\pi", "\\pi^2"))],
          R`Zamieniamy stopnie na radiany: $${angle}^\circ=\frac{${angle}}{180}\pi=${value}$.`,
        );
      },
      (rng) => {
        const [p, q] = pick(rng, [
          [1, 6],
          [1, 4],
          [1, 3],
          [1, 2],
          [2, 3],
          [3, 4],
          [3, 2],
          [2, 1],
        ]);
        return task(
          R`Kąt ${math(radStr(p, q))} ma miarę w stopniach równą:`,
          num((p * 180) / q),
          ["30", "45", "60", "90", "120", "135", "150", "180", "270", "360"]
            .filter((value) => value !== num((p * 180) / q))
            .slice(0, 3),
          R`$${radStr(p, q)}$ rad to $\frac{${p}}{${q}}\cdot180^\circ=${(p * 180) / q}^\circ$.`,
        );
      },
      (rng) => {
        const [p, q] = pick(rng, [
          [1, 6],
          [1, 4],
          [1, 3],
          [1, 2],
          [2, 3],
          [3, 4],
        ]);
        const r = 12;
        const length = (r * p) / q;
        return task(
          R`Łuk okręgu o promieniu $${r}$ cm wyznacza kąt środkowy $${radStr(p, q)}$. Długość łuku wynosi:`,
          math(`${length}\\pi\\ \\text{cm}`),
          [
            math(`${length + 1}\\pi\\ \\text{cm}`),
            math(`${length}\\pi\\ \\text{cm}^2`),
            `${length} cm`,
          ],
          R`$l=r\theta=${r}\cdot${radStr(p, q)}=${piCoeff(length)}$ cm.`,
        );
      },
      (rng) => {
        const [p, q, quadrant] = pick(rng, [
          [1, 6, "I"],
          [2, 3, "II"],
          [3, 4, "II"],
          [5, 3, "IV"],
          [5, 6, "II"],
        ]);
        return task(
          R`Kąt o mierze łukowej $${radStr(p, q)}$ leży w ćwiartce:`,
          quadrant,
          ["I", "II", "III", "IV"].filter((value) => value !== quadrant),
          R`$${radStr(p, q)}$ rad to $\frac{${p}}{${q}}\cdot180^\circ=${(p * 180) / q}^\circ$, co odpowiada ćwiartce ${quadrant}.`,
        );
      },
      (rng) => {
        const [p, q] = pick(rng, [
          [1, 3],
          [1, 2],
          [2, 3],
          [5, 6],
        ]);
        const r = 6;
        const length = (r * p) / q;
        return task(
          R`Łuk o długości $${piCoeff(length)}$ cm leży na okręgu o promieniu $${r}$ cm. Kąt środkowy ma miarę:`,
          math(radStr(p, q)),
          [
            math(radStr(p, q + 1)),
            math(radStr(p + 1, q)),
            num((p * 180) / q),
          ],
          R`$l=r\theta$, więc $\theta=\frac{${piCoeff(length)}}{${r}}=${radStr(p, q)}$.`,
        );
      },
      (rng) => {
        const angle = pick(rng, [240, 300, 330]);
        return task(
          R`Kąt $${angle}^\circ$ w mierze łukowej to:`,
          math(radStr(angle, 180)),
          [
            math(radStr(angle, 360)),
            math(radStr(angle - 30, 180)),
            math(radStr(angle + 30, 180)),
          ],
          R`$${angle}^\circ=\frac{${angle}}{180}\pi=${radStr(angle, 180)}$.`,
        );
      },
    ],
  },
  {
    category: "trygonometria",
    categoryName: "Trygonometria",
    topic: "wzory_redukcyjne",
    topicName: "Wzory redukcyjne",
    gens: [
      (rng) => {
        const a = int(rng, 10, 80);
        return task(
          R`Dla $\alpha=${a}^\circ$ wskaż wartość $\sin(180^\circ-\alpha)$.`,
          math(R`\sin ${a}^\circ`),
          [
            math(R`-\sin ${a}^\circ`),
            math(R`\cos ${a}^\circ`),
            math(R`-\cos ${a}^\circ`),
          ],
          R`$\sin(180^\circ-\alpha)=\sin\alpha$, więc $\sin(180^\circ-${a}^\circ)=\sin${a}^\circ$.`,
        );
      },
      (rng) => {
        const a = int(rng, 10, 80);
        return task(
          R`Dla $\alpha=${a}^\circ$ wskaż wartość $\cos(180^\circ-\alpha)$.`,
          math(R`-\cos ${a}^\circ`),
          [
            math(R`\cos ${a}^\circ`),
            math(R`\sin ${a}^\circ`),
            math(R`-\sin ${a}^\circ`),
          ],
          R`$\cos(180^\circ-\alpha)=-\cos\alpha$, więc wynik to $-\cos${a}^\circ$.`,
        );
      },
      (rng) => {
        const a = int(rng, 10, 80);
        return task(
          R`Dla $\alpha=${a}^\circ$ wskaż wartość $\sin(180^\circ+\alpha)$.`,
          math(R`-\sin ${a}^\circ`),
          [
            math(R`\sin ${a}^\circ`),
            math(R`\cos ${a}^\circ`),
            math(R`-\cos ${a}^\circ`),
          ],
          R`$\sin(180^\circ+\alpha)=-\sin\alpha$, więc wynik to $-\sin${a}^\circ$.`,
        );
      },
      (rng) => {
        const a = int(rng, 10, 80);
        return task(
          R`Dla $\alpha=${a}^\circ$ wskaż wartość $\cos(360^\circ-\alpha)$.`,
          math(R`\cos ${a}^\circ`),
          [
            math(R`-\cos ${a}^\circ`),
            math(R`\sin ${a}^\circ`),
            math(R`-\sin ${a}^\circ`),
          ],
          R`$\cos(360^\circ-\alpha)=\cos\alpha$, więc wynik to $\cos${a}^\circ$.`,
        );
      },
      (rng) => {
        const a = int(rng, 10, 80);
        return task(
          R`Dla $\alpha=${a}^\circ$ wskaż wartość $\operatorname{tg}(180^\circ-\alpha)$.`,
          math(R`-\operatorname{tg} ${a}^\circ`),
          [
            math(R`\operatorname{tg} ${a}^\circ`),
            math(R`-\sin ${a}^\circ`),
            math(R`\cos ${a}^\circ`),
          ],
          R`$\operatorname{tg}(180^\circ-\alpha)=-\operatorname{tg}\alpha$.`,
        );
      },
      (rng) => {
        const angle = pick(rng, [120, 135, 150, 210, 225, 240, 300, 315, 330]);
        const fn = pick(rng, ["sin", "cos", "tg"]);
        const value = TRIG_VALUES[angle][fn];
        const correct = math(value);
        const wrongs = shuffle(
          rng,
          TRIG_POOL.filter((candidate) => candidate !== value),
        ).slice(0, 3);
        return task(
          R`Oblicz $\operatorname{${fn}} ${angle}^\circ$.`,
          correct,
          wrongs.map((candidate) => math(candidate)),
          R`Korzystamy z wzorów redukcyjnych i tablic wartości: $\operatorname{${fn}}${angle}^\circ=${value}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 10, 80);
        return task(
          R`Dla $\alpha=${a}^\circ$ wskaż wartość $\sin(90^\circ+\alpha)$.`,
          math(R`\cos ${a}^\circ`),
          [
            math(R`\sin ${a}^\circ`),
            math(R`-\sin ${a}^\circ`),
            math(R`-\cos ${a}^\circ`),
          ],
          R`$\sin(90^\circ+\alpha)=\cos\alpha$, więc wynik to $\cos${a}^\circ$.`,
        );
      },
    ],
  },
];

/** (x - a) albo x, gdy a = 0. */
function shiftTerm(variable, center) {
  if (center === 0) return variable;
  return center > 0 ? `(${variable}-${center})` : `(${variable}+${-center})`;
}

/** Równanie okręgu o środku (a,b) i promieniu r. */
function circleEq(a, b, r) {
  return `${shiftTerm("x", a)}^2+${shiftTerm("y", b)}^2=${r * r}`;
}

/** Równanie Ax + By + C = 0. */
function lineEquation(A, B, C) {
  let out = `${A}x`;
  out += B > 0 ? `+${B}y` : `-${-B}y`;
  if (C !== 0) out += C > 0 ? `+${C}` : `-${-C}`;
  return `${out}=0`;
}

const GEOMETRIA_A = [
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "wielokaty_foremne",
    topicName: "Wielokąty foremne",
    gens: [
      (rng) => {
        const n = pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
        const angle = ((n - 2) * 180) / n;
        return task(
          R`Miara kąta wewnętrznego wielokąta foremnego o $${n}$ bokach wynosi:`,
          `${angle}°`,
          [`${angle + 10}°`, `${angle - 10}°`, `${360 / n}°`],
          R`Kąt wewnętrzny $${n}$-kąta foremnego to $\frac{(${n}-2)\cdot180^\circ}{${n}}=${angle}^\circ$.`,
        );
      },
      (rng) => {
        const n = int(rng, 3, 12);
        const sum = (n - 2) * 180;
        return task(
          R`Suma miar kątów wewnętrznych $${n}$-kąta wynosi:`,
          `${sum}°`,
          [`${sum + 180}°`, `${sum - 180}°`, `${n * 180}°`],
          R`Suma kątów $${n}$-kąta to $(${n}-2)\cdot180^\circ=${sum}^\circ$.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 12);
        const diagonals = (n * (n - 3)) / 2;
        return task(
          R`Ile przekątnych ma $${n}$-kąt?`,
          num(diagonals),
          [num(n * (n - 3)), num(diagonals + n), num((n * (n - 1)) / 2)],
          R`Liczba przekątnych $${n}$-kąta to $\frac{${n}(${n}-3)}{2}=${diagonals}$.`,
        );
      },
      (rng) => {
        const n = pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
        const angle = 360 / n;
        return task(
          R`Kąt środkowy wyznaczony przez dwa kolejne wierzchołki $${n}$-kąta foremnego wpisanego w okrąg wynosi:`,
          `${angle}°`,
          [`${angle * 2}°`, `${angle / 2}°`, `${180 - angle}°`],
          R`Pełny kąt $360^\circ$ dzielimy na $${n}$ równych części: $\frac{360^\circ}{${n}}=${angle}^\circ$.`,
        );
      },
      (rng) => {
        const n = pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
        const angle = 360 / n;
        return task(
          R`Kąt zewnętrzny wielokąta foremnego o $${n}$ bokach wynosi:`,
          `${angle}°`,
          [`${angle * 2}°`, `${num(angle / 2)}°`, `${angle + 15}°`],
          R`Kąt zewnętrzny to $360^\circ:${n}=${angle}^\circ$ (albo $180^\circ$ minus kąt wewnętrzny).`,
        );
      },
      (rng) => {
        const n = int(rng, 3, 8);
        const a = int(rng, 2, 10);
        return task(
          R`Wielokąt foremny ma $${n}$ boków, każdy o długości $${a}$ cm. Jego obwód wynosi:`,
          `${n * a} cm`,
          [`${n + a} cm`, `${n * a + n} cm`, `${a} cm`],
          R`Obwód to suma $${n}$ równych boków: $${n}\cdot${a}=${n * a}$ cm.`,
        );
      },
      (rng) => {
        const [angle, n] = pick(rng, [
          [60, 3],
          [90, 4],
          [108, 5],
          [120, 6],
          [135, 8],
          [140, 9],
          [144, 10],
          [150, 12],
        ]);
        return task(
          R`Kąt wewnętrzny wielokąta foremnego ma $${angle}^\circ$. Ile boków ma ten wielokąt?`,
          num(n),
          [num(n + 1), num(n - 1), num(360 / angle)],
          R`Z równania $\frac{(n-2)180^\circ}{n}=${angle}^\circ$ otrzymujemy $n=${n}$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "punkty_szczegolne_trojkata",
    topicName: "Punkty szczególne trójkąta",
    gens: [
      (rng) => {
        const median = 3 * int(rng, 2, 6);
        const distance = (2 * median) / 3;
        return task(
          R`Środkowa trójkąta ma długość $${median}$ cm. Środek ciężkości dzieli ją w stosunku $2:1$. Odległość środka ciężkości od wierzchołka wynosi:`,
          `${distance} cm`,
          [`${median / 3} cm`, `${median / 2} cm`, `${median} cm`],
          R`Środek ciężkości leży bliżej boku, więc od wierzchołka jest oddalony o $\frac23\cdot${median}=${distance}$ cm.`,
        );
      },
      (rng) => {
        const median = 3 * int(rng, 2, 6);
        const distance = median / 3;
        return task(
          R`Środkowa trójkąta ma długość $${median}$ cm. Jaką odległość od boku ma środek ciężkości?`,
          `${distance} cm`,
          [`${(2 * median) / 3} cm`, `${median / 2} cm`, `${median} cm`],
          R`Środek ciężkości dzieli środkową w stosunku $2:1$, więc od boku jest oddalony o $\frac13\cdot${median}=${distance}$ cm.`,
        );
      },
      (rng) => {
        const leg1 = 2 * int(rng, 3, 8);
        const leg2 = 2 * int(rng, 3, 8);
        const hyp = Math.hypot(leg1, leg2);
        if (!Number.isInteger(hyp)) return null;
        return task(
          R`Trójkąt prostokątny ma przyprostokątne $${leg1}$ cm i $${leg2}$ cm. Promień okręgu opisanego na tym trójkącie wynosi:`,
          `${hyp / 2} cm`,
          [`${hyp} cm`, `${leg1 / 2} cm`, `${leg2 / 2} cm`],
          R`Środek okręgu opisanego na trójkącie prostokątnym to środek przeciwprostokątnej, więc $R=\frac{${hyp}}{2}=${hyp / 2}$ cm.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 10);
        return task(
          R`W trójkącie równobocznym o boku $${a}$ stosunek promienia okręgu opisanego do promienia okręgu wpisanego wynosi:`,
          "2",
          ["1", "3", "4"],
          R`Dla trójkąta równobocznego $R=\frac{a\sqrt3}{3}$ oraz $r=\frac{a\sqrt3}{6}$, więc $\frac{R}{r}=2$.`,
        );
      },
      (rng) => {
        const x = int(rng, 40, 70);
        const y = int(rng, 40, 110 - x + 30);
        const z = 180 - x - y;
        if (z <= 0) return null;
        return task(
          R`W trójkącie o kątach $${x}^\circ$, $${y}^\circ$ i $${z}^\circ$ środek okręgu wpisanego wyznacza przecięcie:`,
          "dwusiecznych kątów",
          [
            "symetralnych boków",
            "wysokości",
            "środkowych",
          ],
          R`Środek okręgu wpisanego to punkt przecięcia dwusiecznych kątów trójkąta.`,
        );
      },
      (rng) => {
        const x = int(rng, 40, 70);
        const y = int(rng, 40, 100);
        const z = 180 - x - y;
        if (z <= 0) return null;
        return task(
          R`W trójkącie o kątach $${x}^\circ$, $${y}^\circ$ i $${z}^\circ$ ortocentrum to punkt przecięcia:`,
          "wysokości",
          [
            "dwusiecznych kątów",
            "symetralnych boków",
            "środkowych",
          ],
          R`Ortocentrum to punkt przecięcia wysokości trójkąta.`,
        );
      },
      (rng) => {
        const a = 2 * int(rng, 3, 8);
        const b = 2 * int(rng, 4, 9);
        const c = Math.hypot(a, b);
        if (!Number.isInteger(c)) return null;
        return task(
          R`Trójkąt prostokątny ma przyprostokątne $${a}$ cm i $${b}$ cm. Środek okręgu opisanego na tym trójkącie leży:`,
          "w środku przeciwprostokątnej",
          [
            "w wierzchołku kąta prostego",
            "w środku krótszej przyprostokątnej",
            "w środku ciężkości trójkąta",
          ],
          R`Kąt prosty jest kątem wpisanym opartym na średnicy, więc przeciwprostokątna jest średnicą, a jej środek jest środkiem okręgu opisanego.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "wycinek_i_luk",
    topicName: "Wycinek koła i łuk okręgu",
    gens: [
      (rng) => {
        const [alpha, baseR, baseCoeff] = pick(rng, [
          [60, 3, 1],
          [90, 2, 1],
          [120, 3, 2],
          [45, 4, 1],
          [30, 6, 1],
          [180, 1, 1],
        ]);
        const k = int(rng, 1, 4);
        const r = baseR * k;
        const coeff = baseCoeff * k;
        return task(
          R`Okrąg ma promień $${r}$ cm. Długość łuku wyznaczonego przez kąt środkowy $${alpha}^\circ$ wynosi:`,
          math(`${piCoeff(coeff)}\\ \\text{cm}`),
          [
            math(`${piCoeff(2 * coeff)}\\ \\text{cm}`),
            math(`${piCoeff(coeff)}\\ \\text{cm}^2`),
            `${coeff} cm`,
          ],
          R`$l=\frac{${alpha}}{360}\cdot2\pi\cdot${r}=${piCoeff(coeff)}$ cm.`,
        );
      },
      (rng) => {
        const [alpha, baseR, baseCoeff] = pick(rng, [
          [90, 2, 1],
          [60, 6, 6],
          [120, 3, 3],
        ]);
        const k = int(rng, 1, 3);
        const r = baseR * k;
        const coeff = baseCoeff * k * k;
        return task(
          R`Pole wycinka koła o promieniu $${r}$ cm i kącie środkowym $${alpha}^\circ$ wynosi:`,
          math(`${piCoeff(coeff)}\\ \\text{cm}^2`),
          [
            math(`${piCoeff(2 * coeff)}\\ \\text{cm}^2`),
            math(`${piCoeff(coeff)}\\ \\text{cm}`),
            `${coeff} cm^2`,
          ],
          R`$P=\frac{${alpha}}{360}\cdot\pi\cdot${r}^2=${piCoeff(coeff)}$ cm$^2$.`,
        );
      },
      (rng) => {
        const [alpha, baseR, baseCoeff] = pick(rng, [
          [90, 2, 1],
          [60, 3, 1],
          [120, 3, 2],
          [45, 4, 1],
        ]);
        const k = int(rng, 1, 3);
        const r = baseR * k;
        const arcCoeff = baseCoeff * k;
        return task(
          R`Wycinek koła ma promień $${r}$ cm i kąt środkowy $${alpha}^\circ$. Obwód tego wycinka wynosi:`,
          math(`${2 * r}+${piCoeff(arcCoeff)}\\ \\text{cm}`),
          [
            math(`${r}+${piCoeff(arcCoeff)}\\ \\text{cm}`),
            math(`${2 * r}+${piCoeff(2 * arcCoeff)}\\ \\text{cm}`),
            math(`${piCoeff(arcCoeff)}\\ \\text{cm}`),
          ],
          R`Obwód wycinka to dwa promienie i łuk: $2\cdot${r}+${piCoeff(arcCoeff)}=${2 * r}+${piCoeff(arcCoeff)}$ cm.`,
        );
      },
      (rng) => {
        const [alpha, baseR, baseCoeff] = pick(rng, [
          [60, 3, 1],
          [90, 2, 1],
          [120, 3, 2],
          [45, 4, 1],
        ]);
        const k = int(rng, 1, 3);
        const r = baseR * k;
        const coeff = baseCoeff * k;
        return task(
          R`Łuk okręgu o promieniu $${r}$ cm ma długość $${piCoeff(coeff)}$ cm. Kąt środkowy tego łuku wynosi:`,
          `${alpha}°`,
          [`${alpha + 30}°`, `${alpha / 2}°`, `${2 * alpha}°`],
          R`$l=\frac{\alpha}{360}\cdot2\pi r$, więc $\frac{${alpha}}{360}\cdot2\pi\cdot${r}=${piCoeff(coeff)}$, czyli $\alpha=${alpha}^\circ$.`,
        );
      },
      (rng) => {
        const alpha = pick(rng, [30, 45, 60, 90, 120, 180]);
        const value = fracStr(alpha, 360);
        return task(
          R`Jaką część pola koła stanowi wycinek odpowiadający kątowi środkowemu $${alpha}^\circ$?`,
          math(value),
          [
            math(fracStr(alpha, 180)),
            math(fracStr(alpha + 30, 360)),
            math(fracStr(360, alpha)),
          ],
          R`Pole wycinka to $\frac{${alpha}}{360}$ pola koła, czyli $${value}$.`,
        );
      },
      (rng) => {
        const [alpha, baseR, baseCoeff] = pick(rng, [
          [60, 3, 1],
          [90, 2, 1],
          [120, 3, 2],
        ]);
        const k = int(rng, 1, 3);
        const d = 2 * baseR * k;
        const r = d / 2;
        const coeff = baseCoeff * k;
        return task(
          R`Koło ma średnicę $${d}$ cm. Łuk odpowiadający kątowi środkowemu $${alpha}^\circ$ ma długość:`,
          math(`${piCoeff(coeff)}\\ \\text{cm}`),
          [
            math(`${piCoeff(2 * coeff)}\\ \\text{cm}`),
            math(`${coeff / 2}\\pi\\ \\text{cm}`),
            `${coeff} cm`,
          ],
          R`Promień to $${r}$ cm, więc $l=\frac{${alpha}}{360}\cdot2\pi\cdot${r}=${piCoeff(coeff)}$ cm.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "katy_w_brylach",
    topicName: "Kąty w bryłach",
    gens: [
      (rng) => {
        const a = int(rng, 2, 9);
        return task(
          R`Sześcian ma krawędź $${a}$. Kąt między przekątną ściany a krawędzią tej ściany wynosi:`,
          "45°",
          ["30°", "60°", "90°"],
          R`Przekątna ściany i krawędź tworzą w kwadracie kąt $45^\circ$ (trójkąt prostokątny równoramienny).`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 9);
        return task(
          R`W sześcianie o krawędzi $${a}$ poprowadzono przekątne dwóch sąsiednich ścian z tego samego wierzchołka. Kąt między nimi wynosi:`,
          "60°",
          ["45°", "90°", "30°"],
          R`Końce tych przekątnych tworzą trójkąt równoboczny o bokach $${a}\sqrt2$, więc każdy kąt ma $60^\circ$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 9);
        return task(
          R`Sześcian ma krawędź $${a}$. Cosinus kąta między przekątną sześcianu a płaszczyzną podstawy wynosi:`,
          math(R`\frac{\sqrt6}{3}`),
          [math(fracStr(1, 2)), math(R`\frac{\sqrt3}{2}`), math(R`\frac{\sqrt2}{2}`)],
          R`Rzut przekątnej na podstawę to przekątna podstawy $${a}\sqrt2$, a przekątna sześcianu ma $${a}\sqrt3$. Stąd $\cos\alpha=\frac{${a}\sqrt2}{${a}\sqrt3}=\frac{\sqrt6}{3}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        return task(
          R`Ostrosłup prawidłowy czworokątny ma podstawę o boku $${a}$ i wysokość $\frac{${a}\sqrt2}{2}$. Kąt między krawędzią boczną a płaszczyzną podstawy wynosi:`,
          "45°",
          ["30°", "60°", "90°"],
          R`Połowa przekątnej podstawy to $\frac{${a}\sqrt2}{2}$, czyli tyle samo co wysokość. Trójkąt prostokątny jest równoramienny, więc kąt ma $45^\circ$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 8);
        return task(
          R`Stożek ma promień podstawy $${r}$ i wysokość $${r}$. Kąt między tworzącą a płaszczyzną podstawy wynosi:`,
          "45°",
          ["30°", "60°", "90°"],
          R`$\operatorname{tg}\alpha=\frac{h}{r}=1$, więc $\alpha=45^\circ$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 7);
        return task(
          R`Walec ma promień podstawy $${r}$ i wysokość $${2 * r}$. Kąt między przekątną przekroju osiowego a płaszczyzną podstawy wynosi:`,
          "45°",
          ["30°", "60°", "90°"],
          R`Przekrój osiowy to prostokąt o bokach $${2 * r}$ i $${2 * r}$, więc jego przekątna tworzy z podstawą kąt $45^\circ$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 9);
        return task(
          R`W sześcianie o krawędzi $${a}$ kąt między przekątną sześcianu a krawędzią wychodzącą z tego samego wierzchołka ma cosinus równy:`,
          math(R`\frac{\sqrt3}{3}`),
          [math(R`\frac{\sqrt2}{2}`), math(fracStr(1, 3)), math(fracStr(2, 3))],
          R`Kąt tworzą wektory $(1,1,1)$ i $(1,0,0)$: $\cos\alpha=\frac{1}{\sqrt3}=\frac{\sqrt3}{3}$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "przekroje_bryl",
    topicName: "Przekroje brył",
    gens: [
      (rng) => {
        const a = int(rng, 2, 9);
        return task(
          R`Sześcian o krawędzi $${a}$ przecięto płaszczyzną równoległą do jednej ze ścian. Pole otrzymanego przekroju wynosi:`,
          math(`${a * a}\\ \\text{cm}^2`),
          [
            math(`${2 * a * a}\\ \\text{cm}^2`),
            math(`${a * a}\\sqrt2\\ \\text{cm}^2`),
            math(`${a * a}\\sqrt3\\ \\text{cm}^2`),
          ],
          R`Przekrój jest kwadratem o boku $${a}$, więc jego pole to $${a}^2=${a * a}$ cm$^2$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        return task(
          R`Sześcian o krawędzi $${a}$ przecięto płaszczyzną przechodzącą przez przekątną podstawy i krawędź boczną. Pole przekroju wynosi:`,
          math(`${a * a}\\sqrt2\\ \\text{cm}^2`),
          [
            math(`${a * a}\\ \\text{cm}^2`),
            math(`2${a * a}\\ \\text{cm}^2`),
            math(`${a * a}\\sqrt3\\ \\text{cm}^2`),
          ],
          R`Przekrój jest prostokątem o bokach $${a}$ i $${a}\sqrt2$, więc $P=${a}\cdot${a}\sqrt2=${a * a}\sqrt2$ cm$^2$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 6);
        const h = int(rng, 3, 10);
        return task(
          R`Walec ma promień podstawy $${r}$ i wysokość $${h}$. Pole przekroju osiowego wynosi:`,
          `${2 * r * h} cm²`,
          [`${r * h} cm²`, `${4 * r * h} cm²`, `${r * h + 1} cm²`],
          R`Przekrój osiowy to prostokąt o bokach $${2 * r}$ i $${h}$, więc $P=2\cdot${r}\cdot${h}=${2 * r * h}$ cm$^2$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 6);
        const h = int(rng, 3, 10);
        return task(
          R`Stożek ma promień podstawy $${r}$ i wysokość $${h}$. Pole przekroju przechodzącego przez wierzchołek i średnicę podstawy wynosi:`,
          `${r * h} cm²`,
          [`${2 * r * h} cm²`, `${r * h / 2} cm²`, `${Math.PI * r * h} cm²`],
          R`Przekrój jest trójkątem o podstawie $${2 * r}$ i wysokości $${h}$, więc $P=\frac12\cdot${2 * r}\cdot${h}=${r * h}$ cm$^2$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 8);
        return task(
          R`Kulę o promieniu $${r}$ przecięto płaszczyzną przechodzącą przez jej środek. Pole otrzymanego przekroju wynosi:`,
          math(`${r * r}\\pi\\ \\text{cm}^2`),
          [math(`${2 * r * r}\\pi\\ \\text{cm}^2`), math(`${r}\\pi\\ \\text{cm}^2`), `${r * r} cm²`],
          R`Przekrój to koło wielkie o promieniu $${r}$, więc $P=\pi\cdot${r}^2=${r * r}\pi$ cm$^2$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 8);
        return task(
          R`Sześcian o krawędzi $${a}$ przecięto płaszczyzną przechodzącą przez trzy wierzchołki, z których żadne dwa nie leżą na wspólnej krawędzi. Pole przekroju wynosi:`,
          math(`${fracStr(a * a, 2)}\\sqrt3\\ \\text{cm}^2`),
          [
            math(`${a * a}\\sqrt3\\ \\text{cm}^2`),
            math(`${fracStr(a * a, 2)}\\sqrt2\\ \\text{cm}^2`),
            math(`${a * a}\\ \\text{cm}^2`),
          ],
          R`Przekrój jest trójkątem równobocznym o boku $${a}\sqrt2$, więc $P=\frac{\sqrt3}{4}\cdot2${a * a}=${fracStr(a * a, 2)}\sqrt3$ cm$^2$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "bryly_podobne",
    topicName: "Bryły podobne",
    gens: [
      (rng) => {
        const k = int(rng, 2, 5);
        return task(
          R`Dwie bryły są podobne w skali $${k}$. Ile razy objętość większej bryły jest większa od objętości mniejszej?`,
          num(k ** 3),
          [num(k ** 2), num(k), num(k ** 3 + 1)],
          R`W skali $k$ objętości zmieniają się jak $k^3$, więc wynik to $${k}^3=${k ** 3}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        return task(
          R`Dwie bryły podobne mają skalę podobieństwa $${k}$. Ile razy pole powierzchni większej bryły jest większe?`,
          num(k ** 2),
          [num(k), num(k ** 3), num(k ** 2 + 1)],
          R`Pola powierzchni zmieniają się jak kwadrat skali: $${k}^2=${k ** 2}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 4);
        const a = int(rng, 2, 6);
        return task(
          R`Krawędź sześcianu o długości $${a}$ zwiększono $${k}$ razy. Objętość nowego sześcianu jest większa:`,
          `${k ** 3} razy`,
          [`${k ** 2} razy`, `${k} razy`, `${k ** 3 - 1} razy`],
          R`Objętość sześcianu to $a^3$, więc po zwiększeniu krawędzi $${k}$ razy rośnie $${k}^3=${k ** 3}$ razy.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 4);
        const r = int(rng, 2, 5);
        return task(
          R`Promień kuli o długości $${r}$ zwiększono $${k}$ razy. Objętość nowej kuli jest większa:`,
          `${k ** 3} razy`,
          [`${k ** 2} razy`, `${k} razy`, `${k ** 3 - 1} razy`],
          R`Objętość kuli jest proporcjonalna do $r^3$, więc wzrost promienia $${k}$ razy daje wzrost objętości $${k ** 3}$ razy.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 4);
        return task(
          R`Stosunek objętości dwóch brył podobnych wynosi $${k ** 3}:1$. Stosunek ich odpowiadających sobie długości wynosi:`,
          `${k}:1`,
          [`${k ** 2}:1`, `${k ** 3}:1`, `1:${k}`],
          R`Objętości są w stosunku $k^3$, więc długości są w stosunku $k=${k}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        return task(
          R`Stosunek pól powierzchni dwóch brył podobnych wynosi $${k ** 2}:1$. Stosunek ich objętości wynosi:`,
          `${k ** 3}:1`,
          [`${k ** 2}:1`, `${k}:1`, `1:${k ** 3}`],
          R`Pola są w stosunku $k^2$, więc skala to $${k}$, a objętości są w stosunku $${k}^3=${k ** 3}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 5);
        return task(
          R`Dwie bryły podobne mają objętości w stosunku $1:${k ** 3}$. Skala podobieństwa mniejszej bryły do większej wynosi:`,
          `1:${k}`,
          [`1:${k ** 2}`, `1:${k ** 3}`, `${k}:1`],
          R`$V_1:V_2=1:k^3$, więc skala długości to $1:k=1:${k}$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "walce_stozki_kule",
    topicName: "Walec, stożek i kula",
    gens: [
      (rng) => {
        const r = int(rng, 2, 5);
        const h = int(rng, 3, 8);
        return task(
          R`Walec ma promień podstawy $${r}$ cm i wysokość $${h}$ cm. Jego objętość wynosi:`,
          math(`${r * r * h}\\pi\\ \\text{cm}^3`),
          [math(`${r * r * h + 1}\pi\ \text{cm}^3`), math(`${r * r * h + r}\pi\ \text{cm}^3`), `${r * r * h} cm³`],
          R`$V=\pi r^2h=\pi\cdot${r}^2\cdot${h}=${r * r * h}\pi$ cm$^3$.`,
        );
      },
      (rng) => {
        const r = pick(rng, [3, 6]);
        const h = int(rng, 2, 6);
        return task(
          R`Stożek ma promień podstawy $${r}$ cm i wysokość $${h}$ cm. Jego objętość wynosi:`,
          math(`${(r * r * h) / 3}\\pi\\ \\text{cm}^3`),
          [math(`${r * r * h}\\pi\\ \\text{cm}^3`), math(`${(2 * r * r * h) / 3}\\pi\\ \\text{cm}^3`), `${(r * r * h) / 3} cm³`],
          R`$V=\frac13\pi r^2h=\frac13\pi\cdot${r}^2\cdot${h}=${fracStr(r * r * h, 3)}\pi$ cm$^3$.`,
        );
      },
      (rng) => {
        const r = pick(rng, [3, 4, 6]);
        const coeff = fracStr(4 * r ** 3, 3);
        return task(
          R`Kula ma promień $${r}$ cm. Jej objętość wynosi:`,
          math(`${piCoeff(coeff)}\\ \\text{cm}^3`),
          [
            math(`${fracStr(4 * r ** 2, 3)}\\pi\\ \\text{cm}^3`),
            math(`${fracStr(2 * r ** 3, 3)}\\pi\\ \\text{cm}^3`),
            math(`${piCoeff(coeff)}\\ \\text{cm}^2`),
          ],
          R`$V=\frac43\pi r^3=\frac43\pi\cdot${r}^3=${piCoeff(coeff)}$ cm$^3$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 8);
        return task(
          R`Kula ma promień $${r}$ cm. Jej pole powierzchni wynosi:`,
          math(`${4 * r * r}\\pi\\ \\text{cm}^2`),
          [math(`${2 * r * r}\\pi\\ \\text{cm}^2`), math(`${r * r}\\pi\\ \\text{cm}^2`), math(`${8 * r * r}\\pi\\ \\text{cm}^2`)],
          R`$P=4\pi r^2=4\pi\cdot${r}^2=${4 * r * r}\pi$ cm$^2$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 6);
        const h = int(rng, 3, 9);
        return task(
          R`Walec ma promień podstawy $${r}$ cm i wysokość $${h}$ cm. Pole powierzchni bocznej wynosi:`,
          math(`${2 * r * h}\\pi\\ \\text{cm}^2`),
          [math(`${r * h}\\pi\\ \\text{cm}^2`), math(`${2 * r * h}\\pi\\ \\text{cm}^3`), `${2 * r * h} cm²`],
          R`$P_b=2\pi rh=2\pi\cdot${r}\cdot${h}=${2 * r * h}\pi$ cm$^2$.`,
        );
      },
      (rng) => {
        const [r, h, l] = pick(rng, [
          [3, 4, 5],
          [6, 8, 10],
          [5, 12, 13],
        ]);
        return task(
          R`Stożek ma promień podstawy $${r}$ cm i wysokość $${h}$ cm. Pole powierzchni bocznej wynosi:`,
          math(`${r * l}\\pi\\ \\text{cm}^2`),
          [math(`${r * h}\\pi\\ \\text{cm}^2`), math(`${2 * r * l}\\pi\\ \\text{cm}^2`), math(`${l * l}\\pi\\ \\text{cm}^2`)],
          R`Tworząca to $l=\sqrt{${r}^2+${h}^2}=${l}$ cm, więc $P_b=\pi rl=\pi\cdot${r}\cdot${l}=${r * l}\pi$ cm$^2$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 5);
        const h = int(rng, 3, 8);
        return task(
          R`Walec ma promień podstawy $${r}$ cm i wysokość $${h}$ cm. Pole powierzchni całkowitej wynosi:`,
          math(`${2 * r * (r + h)}\\pi\\ \\text{cm}^2`),
          [
            math(`${2 * r * h}\\pi\\ \\text{cm}^2`),
            math(`${r * (r + h) + 1}\\pi\\ \\text{cm}^2`),
            math(`${2 * r * (r + h)}\\pi\\ \\text{cm}^3`),
          ],
          R`$P_c=2\pi r(r+h)=2\pi\cdot${r}\cdot(${r}+${h})=${2 * r * (r + h)}\pi$ cm$^2$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "rownanie_okregu",
    topicName: "Równanie okręgu",
    gens: [
      (rng) => {
        const a = pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4]);
        const b = int(rng, -4, 4);
        const r = int(rng, 2, 6);
        return task(
          R`Środek okręgu o równaniu ${math(circleEq(a, b, r))} to punkt:`,
          `(${a},${b})`,
          [`(${-a},${b})`, `(${a + 1},${b})`, `(${a},${b + 1})`],
          R`W równaniu ${math(circleEq(a, b, r))} środek to $(${a},${b})$, a promień wynosi $${r}$.`,
        );
      },
      (rng) => {
        const a = pick(rng, [-3, -2, -1, 1, 2, 3]);
        const b = pick(rng, [-3, -2, -1, 1, 2, 3].filter((value) => value !== a));
        const r = int(rng, 2, 6);
        const correct = math(circleEq(a, b, r));
        return task(
          R`Okrąg ma środek $(${a},${b})$ i promień $${r}$. Jego równanie ma postać:`,
          correct,
          [
            math(circleEq(-a, -b, r)),
            math(circleEq(a, b, r * r)),
            math(circleEq(a + 1, b, r)),
          ],
          R`Równanie okręgu to $(x-a)^2+(y-b)^2=r^2$, czyli ${correct}.`,
        );
      },
      (rng) => {
        const a = pick(rng, [-4, -3, -2, 2, 3, 4]);
        const b = pick(rng, [-4, -3, -2, 2, 3, 4]);
        const r = int(rng, 2, 5);
        const D = -2 * a;
        const E = -2 * b;
        const F = a * a + b * b - r * r;
        const equation = `x^2+y^2${D > 0 ? "+" : ""}${D}x${E > 0 ? "+" : ""}${E}y${F > 0 ? `+${F}` : F < 0 ? `${F}` : ""}=0`;
        return task(
          R`Środek okręgu o równaniu ${math(equation)} to punkt:`,
          `(${a},${b})`,
          [`(${-a},${b})`, `(${a},${-b})`, `(${D},${E})`],
          R`W równaniu $x^2+y^2+Dx+Ey+F=0$ środek ma współrzędne $(-\frac{D}{2},-\frac{E}{2})=(${a},${b})$.`,
        );
      },
      (rng) => {
        const a = pick(rng, [-3, -2, -1, 0, 1, 2, 3]);
        const b = pick(rng, [-3, -2, -1, 0, 1, 2, 3]);
        const r = int(rng, 2, 6);
        return task(
          R`Czy punkt $(${a + r},${b})$ należy do okręgu ${math(circleEq(a, b, r))}?`,
          "tak",
          ["nie", "tylko dla dodatnich współrzędnych", "nie można ustalić"],
          R`Punkt $(${a + r},${b})$ leży w odległości $${r}$ od środka $(${a},${b})$, więc należy do okręgu.`,
        );
      },
      (rng) => {
        const a = int(rng, -4, 4);
        const b = int(rng, -4, 4);
        const r = int(rng, 2, 6);
        return task(
          R`Średnicą okręgu jest odcinek o końcach $(${a - r},${b})$ i $(${a + r},${b})$. Promień tego okręgu wynosi:`,
          num(r),
          [num(2 * r), num(r * r), num(a + r)],
          R`Środek to środek odcinka $(${a},${b})$, a promień to połowa długości średnicy: $\frac{${2 * r}}{2}=${r}$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 7);
        return task(
          R`Okrąg o promieniu $${r}$ jest styczny do obu osi układu współrzędnych, a jego środek leży w pierwszej ćwiartce. Środek tego okręgu to:`,
          `(${r},${r})`,
          [`(${-r},${r})`, `(${r},${-r})`, "(0,0)"],
          R`Styczność do obu osi oznacza, że odległości środka od osi są równe promieniowi. W I ćwiartce środek to $(${r},${r})$.`,
        );
      },
      (rng) => {
        const r = int(rng, 2, 9);
        return task(
          R`Okrąg ma równanie $x^2+y^2=${r * r}$. Jego promień wynosi:`,
          num(r),
          [num(r * r), num(2 * r), num(r / 2)],
          R`Równanie $x^2+y^2=r^2$ opisuje okrąg o środku $(0,0)$ i promieniu $${r}$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "odleglosc_punktu_od_prostej",
    topicName: "Odległość punktu od prostej",
    gens: [
      (rng) => {
        const x0 = int(rng, -4, 4);
        const y0 = int(rng, -4, 4);
        const d = int(rng, 1, 6);
        const C = -3 * x0 - 4 * y0 + 5 * d;
        const correct = num(d);
        return task(
          R`Oblicz odległość punktu $P=(${x0},${y0})$ od prostej ${math(lineEquation(3, 4, C))}.`,
          correct,
          [num(d + 1), num(5 * d), num(d / 5)],
          R`$d=\frac{|3\cdot${x0}+4\cdot${y0}${C >= 0 ? "+" : ""}${C}|}{\sqrt{3^2+4^2}}=\frac{${5 * d}}{5}=${d}$.`,
        );
      },
      (rng) => {
        const d = int(rng, 1, 8);
        const C = 5 * d;
        return task(
          R`Odległość początku układu współrzędnych od prostej ${math(lineEquation(3, 4, -C))} wynosi:`,
          num(d),
          [num(5 * d), num(d + 1), num(d / 5)],
          R`$d=\frac{|C|}{\sqrt{3^2+4^2}}=\frac{${C}}{5}=${d}$.`,
        );
      },
      (rng) => {
        const c1 = int(rng, -6, 6);
        let c2 = c1 + 5 * int(rng, 1, 4);
        if (c2 === c1) c2 = c1 + 5;
        const distance = Math.abs(c2 - c1) / 5;
        return task(
          R`Odległość między prostymi równoległymi ${math(lineEquation(3, 4, c1))} i ${math(lineEquation(3, 4, c2))} wynosi:`,
          num(distance),
          [num(Math.abs(c2 - c1)), num(distance + 1), num(distance / 5)],
          R`Dla prostych $Ax+By+C_1=0$ i $Ax+By+C_2=0$ odległość to $\frac{|C_1-C_2|}{\sqrt{A^2+B^2}}=\frac{${Math.abs(c2 - c1)}}{5}=${distance}$.`,
        );
      },
      (rng) => {
        const x0 = int(rng, -5, 5);
        const y0 = int(rng, -5, 5);
        return task(
          R`Odległość punktu $P=(${x0},${y0})$ od osi $OX$ wynosi:`,
          num(Math.abs(y0)),
          [num(Math.abs(x0)), num(Math.abs(y0) + 1), num(Math.hypot(x0, y0))],
          R`Odległość od osi $OX$ to wartość bezwzględna współrzędnej $y$: $|${y0}|=${Math.abs(y0)}$.`,
        );
      },
      (rng) => {
        const y0 = int(rng, -4, 4);
        const d = int(rng, 2, 7);
        const lineY = y0 + d;
        return task(
          R`Odległość punktu $P=(0,${y0})$ od prostej $y=${lineY}$ wynosi:`,
          num(d),
          [num(Math.abs(y0)), num(d + 1), num(2 * d)],
          R`Prosta jest pozioma, więc odległość to $|${y0}-${lineY}|=${d}$.`,
        );
      },
      (rng) => {
        const x0 = int(rng, -3, 3);
        const y0 = int(rng, -3, 3);
        const d = int(rng, 1, 5);
        const C = -5 * x0 - 12 * y0 + 13 * d;
        return task(
          R`Odległość punktu $P=(${x0},${y0})$ od prostej ${math(lineEquation(5, 12, C))} wynosi:`,
          num(d),
          [num(d + 2), num(13 * d), num(d / 13)],
          R`Mianownik to $\sqrt{5^2+12^2}=13$, a licznik jest równy $${13 * d}$, więc $d=${d}$.`,
        );
      },
    ],
  },
  {
    category: "geometria",
    categoryName: "Geometria",
    topic: "wektory",
    topicName: "Wektory",
    gens: [
      (rng) => {
        const x1 = int(rng, -5, 5);
        const y1 = int(rng, -5, 5);
        const dx = int(rng, -6, 6);
        const dy = int(rng, -6, 6);
        if (dx === 0 && dy === 0) return null;
        if (dx === dy || dx === -dy) return null;
        const x2 = x1 + dx;
        const y2 = y1 + dy;
        return task(
          R`Dane są punkty $A=(${x1},${y1})$ i $B=(${x2},${y2})$. Współrzędne wektora $\vec{AB}$ to:`,
          `[${dx},${dy}]`,
          [`[${-dx},${-dy}]`, `[${x2 + x1},${y2 + y1}]`, `[${dy},${dx}]`],
          R`$\vec{AB}=[${x2},${y2}]-[${x1},${y1}]=[${dx},${dy}]$.`,
        );
      },
      (rng) => {
        const k = int(rng, 1, 5);
        const dx = 3 * k;
        const dy = 4 * k;
        return task(
          R`Długość wektora $[${dx},${dy}]$ wynosi:`,
          num(5 * k),
          [num(7 * k), num(5 * k + 1), num(dx * dy)],
          R`$|\vec{u}|=\sqrt{${dx}^2+${dy}^2}=\sqrt{${dx * dx + dy * dy}}=${5 * k}$.`,
        );
      },
      (rng) => {
        const a1 = int(rng, -5, 5);
        const a2 = int(rng, -5, 5);
        const b1 = int(rng, -5, 5);
        const b2 = int(rng, -5, 5);
        if ((a1 === 0 && a2 === 0) || (b1 === 0 && b2 === 0)) return null;
        return task(
          R`Dane są wektory $\vec{u}=[${a1},${a2}]$ i $\vec{v}=[${b1},${b2}]$. Współrzędne wektora $\vec{u}+\vec{v}$ to:`,
          `[${a1 + b1},${a2 + b2}]`,
          [`[${a1 - b1},${a2 - b2}]`, `[${a1 * b1},${a2 * b2}]`, `[${a1 + b1 + 1},${a2 + b2}]`],
          R`Dodajemy odpowiednie współrzędne: $[${a1},${a2}]+[${b1},${b2}]=[${a1 + b1},${a2 + b2}]$.`,
        );
      },
      (rng) => {
        const a1 = int(rng, -5, 5);
        const a2 = int(rng, -5, 5);
        const b1 = int(rng, -5, 5);
        const b2 = int(rng, -5, 5);
        if ((a1 === 0 && a2 === 0) || (b1 === 0 && b2 === 0)) return null;
        const dot = a1 * b1 + a2 * b2;
        return task(
          R`Oblicz iloczyn skalarny wektorów $\vec{u}=[${a1},${a2}]$ i $\vec{v}=[${b1},${b2}]$.`,
          num(dot),
          [num(a1 * b2 + a2 * b1), num(dot + 1), num(a1 * b1 - a2 * b2)],
          R`$\vec{u}\circ\vec{v}=(${a1})(${b1})+(${a2})(${b2})=${dot}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, 2, 5);
        const c = pick(rng, [2, 3, 4, 6]);
        const m = (-a * c) / b;
        if (!Number.isInteger(m)) return null;
        return task(
          R`Wektory $\vec{u}=[${a},${b}]$ i $\vec{v}=[${c},m]$ są prostopadłe. Współczynnik $m$ jest równy:`,
          num(m),
          [num(-m), num(a * c), num(b * c)],
          R`Iloczyn skalarny wektorów prostopadłych jest zerem: $${a}\cdot${c}+${b}\cdot m=0$, więc $m=${m}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, 1, 5);
        const k = int(rng, 2, 4);
        return task(
          R`Wektory $\vec{u}=[${a},${b}]$ i $\vec{v}=[${a * k},m]$ są równoległe. Współczynnik $m$ jest równy:`,
          num(b * k),
          [num(b + k), num(a * k), num(b * k + 1)],
          R`Wektory równoległe mają proporcjonalne współrzędne: $\frac{${a * k}}{${a}}=\frac{m}{${b}}=${k}$, więc $m=${b * k}$.`,
        );
      },
      (rng) => {
        const x1 = 2 * int(rng, -3, 3);
        const y1 = 2 * int(rng, -3, 3);
        const x2 = 2 * int(rng, -3, 3);
        const y2 = 2 * int(rng, -3, 3);
        return task(
          R`Środek odcinka o końcach $A=(${x1},${y1})$ i $B=(${x2},${y2})$ ma współrzędne:`,
          `(${(x1 + x2) / 2},${(y1 + y2) / 2})`,
          [`(${x1 + x2},${y1 + y2})`, `(${(x2 - x1) / 2},${(y2 - y1) / 2})`, `(${(x1 + x2) / 2 + 1},${(y1 + y2) / 2})`],
          R`Środek to średnia współrzędnych: $\left(\frac{${x1}+${x2}}{2},\frac{${y1}+${y2}}{2}\right)=(${(x1 + x2) / 2},${(y1 + y2) / 2})$.`,
        );
      },
    ],
  },
];

/** Prawdopodobieństwo w schemacie Bernoulliego dla p = pNum/pDen. */
function bernoulli(n, k, pNum, pDen) {
  const numerator =
    binom(n, k) * pNum ** k * (pDen - pNum) ** (n - k);
  const denominator = pDen ** n;
  return math(fracStr(numerator, denominator));
}

const KOMBINATORYKA = [
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "regula_mnozenia",
    topicName: "Reguła mnożenia i dodawania",
    gens: [
      (rng) => {
        const m = int(rng, 3, 8);
        const n = int(rng, 3, 8);
        return task(
          R`W stołówce są $${m}$ rodzaje zup i $${n}$ rodzaje drugich dań. Na ile sposobów można wybrać zestaw złożony z jednej zupy i jednego dania?`,
          num(m * n),
          [num(m + n), num(m * n + m), num(m * n - 1)],
          R`Wybieramy zupę ($${m}$ sposobów) i danie ($${n}$ sposobów), więc $${m}\cdot${n}=${m * n}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 3, 6);
        return task(
          R`Tworzymy liczby dwucyfrowe z cyfr $1,2,\ldots,${k}$, przy czym cyfry mogą się powtarzać. Ile takich liczb można utworzyć?`,
          num(k * k),
          [num(k * (k - 1)), num(2 * k), num(k * k + k)],
          R`Cyfrę dziesiątek wybieramy na $${k}$ sposobów, a cyfrę jedności także na $${k}$ sposobów: $${k}\cdot${k}=${k * k}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 3, 6);
        return task(
          R`Kod składa się z trzech liter wybieranych ze zbioru $${k}$ liter, przy czym litery mogą się powtarzać. Ile jest takich kodów?`,
          num(k ** 3),
          [num(3 * k), num(k * k), num(k ** 3 + k)],
          R`Każdą z trzech pozycji wybieramy na $${k}$ sposobów: $${k}^3=${k ** 3}$.`,
        );
      },
      (rng) => {
        const length = int(rng, 3, 5);
        return task(
          R`Kod PIN składa się z $${length}$ cyfr (od $0$ do $9$). Ile jest różnych kodów?`,
          num(10 ** length),
          [num(9 * 10 ** (length - 1)), num(10 ** (length - 1)), num(10 ** length - 1)],
          R`Każdą z $${length}$ pozycji wybieramy na $10$ sposobów: $10^{${length}}=${10 ** length}$.`,
        );
      },
      (rng) => {
        const shirts = int(rng, 2, 5);
        const trousers = int(rng, 2, 5);
        const shoes = int(rng, 2, 4);
        return task(
          R`Marcin ma $${shirts}$ koszule, $${trousers}$ pary spodni i $${shoes}$ pary butów. Na ile sposobów może się ubrać, wybierając po jednej rzeczy z każdego rodzaju?`,
          num(shirts * trousers * shoes),
          [num(shirts + trousers + shoes), num(shirts * trousers), num(shirts * trousers * shoes + 1)],
          R`Mnożymy liczby możliwości: $${shirts}\cdot${trousers}\cdot${shoes}=${shirts * trousers * shoes}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 4, 8);
        return task(
          R`Ile można utworzyć trzyliterowych kodów z $${k}$ różnych liter, jeśli litery nie mogą się powtarzać?`,
          num(k * (k - 1) * (k - 2)),
          [num(k ** 3), num(k * (k - 1)), num(k * (k - 1) * (k - 2) + k)],
          R`Pierwszą literę wybieramy na $${k}$ sposobów, drugą na $${k - 1}$, trzecią na $${k - 2}$: $${k}\cdot${k - 1}\cdot${k - 2}=${k * (k - 1) * (k - 2)}$.`,
        );
      },
      (rng) => {
        const m = int(rng, 2, 4);
        const n = int(rng, 2, 4);
        return task(
          R`Na ile najkrótszych dróg można przejść po kratce z punktu $A$ do punktu $B$, jeśli trzeba przesunąć się o $${m}$ odcinków w prawo i $${n}$ odcinków w górę?`,
          num(binom(m + n, m)),
          [num(m + n), num(m * n), num(binom(m + n, m) + 1)],
          R`Wybieramy $${m}$ ruchów w prawo spośród $${m + n}$ ruchów: $\binom{${m + n}}{${m}}=${binom(m + n, m)}$.`,
        );
      },
      (rng) => {
        const m = int(rng, 3, 7);
        const n = int(rng, 2, 5);
        return task(
          R`W sklepie jest $${m}$ rodzajów herbaty i $${n}$ rodzaje kawy. Na ile sposobów można kupić jeden napój (herbatę albo kawę)?`,
          num(m + n),
          [num(m * n), num(m + n + 1), num(m - n)],
          R`Wybieramy jeden napój z rozłącznych grup, więc stosujemy regułę dodawania: $${m}+${n}=${m + n}$.`,
        );
      },
    ],
  },
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "permutacje",
    topicName: "Permutacje",
    gens: [
      (rng) => {
        const n = int(rng, 4, 7);
        return task(
          R`Na ile sposobów można ustawić w rzędzie $${n}$ różnych osób?`,
          num(factorial(n)),
          [num(factorial(n - 1)), num(n * n), num(factorial(n) + factorial(n - 1))],
          R`Ustawiamy $${n}$ różnych elementów, więc liczba permutacji to $${n}!=${factorial(n)}$.`,
        );
      },
      (rng) => {
        const [word, value, formula] = pick(rng, [
          ["ANANAS", 60, R`\frac{6!}{3!\cdot2!}=60`],
          ["BANANA", 60, R`\frac{6!}{3!\cdot2!}=60`],
          ["LALKA", 30, R`\frac{5!}{2!\cdot2!}=30`],
          ["KOTEK", 60, R`\frac{5!}{2!}=60`],
        ]);
        return task(
          R`Ile różnych permutacji liter można utworzyć z wyrazu ${word}?`,
          num(value),
          [num(value * 2), num(factorial(word.length)), num(value + 10)],
          R`W wyrazie ${word} litery się powtarzają. Liczba różnych permutacji to $${formula}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 7);
        return task(
          R`Na ile sposobów można posadzić $${n}$ osób przy okrągłym stole, jeśli liczą się tylko sąsiedztwa (obroty uznajemy za ten sam układ)?`,
          num(factorial(n - 1)),
          [num(factorial(n)), num(n * (n - 1)), num(factorial(n - 1) + 1)],
          R`Przy okrągłym stole liczba permutacji cyklicznych to $(n-1)!$, czyli $${n - 1}!=${factorial(n - 1)}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 6);
        return task(
          R`Na ile sposobów można ustawić w rzędzie $${n}$ osób, jeśli pewna dwójka ma stać obok siebie?`,
          num(2 * factorial(n - 1)),
          [num(factorial(n - 1)), num(factorial(n)), num(2 * factorial(n))],
          R`Traktujemy parę jak jeden blok: $${n - 1}$ obiektów można ustawić na $(${n}-1)!$ sposobów, a wewnątrz bloku para na $2$ sposoby. Razem $2\cdot${n - 1}!=${2 * factorial(n - 1)}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 7);
        return task(
          R`Na ile sposobów można ustawić $${n}$ osób w rzędzie, jeśli jedna ustalona osoba ma stać na pierwszym miejscu?`,
          num(factorial(n - 1)),
          [num(factorial(n)), num(n * (n - 1)), num(factorial(n - 1) + n)],
          R`Pierwsze miejsce jest zajęte, więc pozostałe $${n - 1}$ osób ustawiamy na $${n - 1}!=${factorial(n - 1)}$ sposobów.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 9);
        return task(
          R`Ile wynosi $\frac{${n}!}{(${n}-1)!}$?`,
          num(n),
          [num(n - 1), num(n * (n - 1)), num(factorial(n))],
          R`$\frac{${n}!}{(${n}-1)!}=${n}$, bo $${n}!=${n}\cdot(${n}-1)!$.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 6);
        return task(
          R`Na półce stoi $${n}$ różnych książek. Na ile sposobów można je ustawić w kolejności?`,
          num(factorial(n)),
          [num(n * (n - 1)), num(factorial(n - 1)), num(factorial(n) + 1)],
          R`Każde ustawienie to permutacja $${n}$ książek: $${n}!=${factorial(n)}$.`,
        );
      },
    ],
  },
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "kombinacje",
    topicName: "Kombinacje",
    gens: [
      (rng) => {
        const n = int(rng, 5, 10);
        const k = int(rng, 2, 4);
        if (k >= n) return null;
        const value = binom(n, k);
        return task(
          R`Ile wynosi $\binom{${n}}{${k}}$?`,
          num(value),
          [num(value + 1), num(n * k), num(binom(n, k - 1))],
          R`$\binom{${n}}{${k}}=\frac{${n}!}{${k}!(${n - k})!}=${value}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 5, 12);
        const value = (n * (n - 1)) / 2;
        return task(
          R`Na ile sposobów można wybrać $2$ osoby spośród $${n}$?`,
          num(value),
          [num(n * (n - 1)), num(n * 2), num(value + n)],
          R`Kolejność nie ma znaczenia, więc $\binom{${n}}{2}=\frac{${n}\cdot${n - 1}}{2}=${value}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 6, 12);
        const value = binom(n, 3);
        return task(
          R`Na ile sposobów można wybrać $3$ osoby spośród $${n}$ do komisji?`,
          num(value),
          [num(n * (n - 1) * (n - 2)), num(binom(n, 2)), num(value + 1)],
          R`$\binom{${n}}{3}=\frac{${n}\cdot${n - 1}\cdot${n - 2}}{6}=${value}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 5, 10);
        const value = (n * (n - 1)) / 2;
        return task(
          R`Na spotkaniu jest $${n}$ osób. Każde dwie osoby podają sobie rękę dokładnie raz. Ile uścisków dłoni będzie na spotkaniu?`,
          num(value),
          [num(n * (n - 1)), num(n), num(value + n)],
          R`Każdy uścisk to wybór $2$ osób spośród $${n}$: $\binom{${n}}{2}=${value}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 5, 9);
        return task(
          R`Ile wynosi $\binom{${n}}{${n - 1}}$?`,
          num(n),
          [num(n - 1), num(n * (n - 1)), num(binom(n, 2))],
          R`$\binom{${n}}{${n - 1}}=\binom{${n}}{1}=${n}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 4, 8);
        const value = binom(n, 2);
        return task(
          R`Mamy $${n}$ różnych kolorów farb. Na ile sposobów można wybrać $2$ kolory?`,
          num(value),
          [num(n * 2), num(n * (n - 1)), num(value + n)],
          R`Kolejność kolorów nie ma znaczenia: $\binom{${n}}{2}=${value}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 6, 10);
        const k = int(rng, 2, 3);
        const value = binom(n, k);
        return task(
          R`Ile podzbiorów $${k}$-elementowych ma zbiór $${n}$-elementowy?`,
          num(value),
          [num(value + n), num(n ** k), num(binom(n, k - 1))],
          R`Liczba podzbiorów to $\binom{${n}}{${k}}=${value}$.`,
        );
      },
    ],
  },
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "prawdopodobienstwo_warunkowe",
    topicName: "Prawdopodobieństwo warunkowe",
    gens: [
      (rng) => {
        const k = int(rng, 2, 5);
        const countAll = 7 - k;
        let countEven = 0;
        for (let face = k; face <= 6; face += 1) {
          if (face % 2 === 0) countEven += 1;
        }
        const correct = math(fracStr(countEven, countAll));
        return task(
          R`Rzucamy kostką. Wiadomo, że wypadła liczba oczek co najmniej $${k}$. Prawdopodobieństwo, że wypadła liczba parzysta, wynosi:`,
          correct,
          [
            math(fracStr(countEven + 1, countAll)),
            math(fracStr(Math.max(countEven - 1, 0), countAll)),
            math(fracStr(countAll, 6)),
          ],
          R`Warunek ogranicza przestrzeń do $${countAll}$ wyników: $${k},${k + 1},\ldots,6$. Wśród nich parzystych jest $${countEven}$, więc $P=\frac{${countEven}}{${countAll}}=${fracStr(countEven, countAll)}$.`,
        );
      },
      (rng) => {
        const suits = ["kier", "karo", "pik", "trefl"];
        const ranks = ["as", "król", "dama", "walet", "dziesiątka"];
        const mode = int(rng, 0, 2);
        if (mode === 0) {
          const suit = pick(rng, suits);
          const rank = pick(rng, ranks);
          return task(
            R`Wiadomo, że wylosowana z talii $52$ kart karta jest w kolorze ${suit}. Prawdopodobieństwo, że jest to ${rank}, wynosi:`,
            math(fracStr(1, 13)),
            [math(fracStr(1, 26)), math(fracStr(1, 52)), math(fracStr(1, 4))],
            R`W kolorze ${suit} jest $13$ kart, a tylko jedna z nich to ${rank}. Dlatego $P=\frac{1}{13}$.`,
          );
        }
        if (mode === 1) {
          const suit = pick(rng, suits);
          return task(
            R`Wiadomo, że wylosowana karta jest figurą (walet, dama lub król). Prawdopodobieństwo, że jest to ${suit}, wynosi:`,
            math(fracStr(1, 4)),
            [math(fracStr(1, 13)), math(fracStr(3, 13)), math(fracStr(1, 12))],
            R`Figur jest $12$ (po $3$ w każdym kolorze), a w kolorze ${suit} są $3$ figury. $P=\frac{3}{12}=\frac14$.`,
          );
        }
        const rank = pick(rng, ranks);
        return task(
          R`Wiadomo, że wylosowana karta jest czerwona (kier lub karo). Prawdopodobieństwo, że jest to ${rank}, wynosi:`,
          math(fracStr(1, 13)),
          [math(fracStr(1, 26)), math(fracStr(1, 52)), math(fracStr(1, 2))],
          R`Czerwonych kart jest $26$, a po jednej karcie każdej rangi w każdym z dwóch czerwonych kolorów. $P=\frac{2}{26}=\frac{1}{13}$.`,
        );
      },
      (rng) => {
        const white = int(rng, 3, 6);
        const black = int(rng, 2, 5);
        const correct = math(fracStr(white - 1, white + black - 1));
        return task(
          R`W urnie jest $${white}$ kul białych i $${black}$ czarnych. Losujemy kolejno dwie kule bez zwracania. Wiadomo, że pierwsza była biała. Prawdopodobieństwo, że druga też jest biała, wynosi:`,
          correct,
          [
            math(fracStr(white, white + black)),
            math(fracStr(white - 1, white + black)),
            math(fracStr(black, white + black + 1)),
          ],
          R`Po wyjęciu białej kuli zostaje $${white - 1}$ białych i $${white + black - 1}$ kul razem, więc $P=\frac{${white - 1}}{${white + black - 1}}$.`,
        );
      },
      (rng) => {
        const girls = int(rng, 8, 15);
        const boys = int(rng, 8, 15);
        const girlsMath = int(rng, 3, Math.min(girls, 7));
        const boysMath = int(rng, 2, Math.min(boys, 6));
        const correct = math(fracStr(girlsMath, girlsMath + boysMath));
        return task(
          R`W klasie jest $${girls}$ dziewcząt i $${boys}$ chłopców. Matematykę lubi $${girlsMath}$ dziewcząt i $${boysMath}$ chłopców. Losujemy osobę, która lubi matematykę. Prawdopodobieństwo, że to dziewczyna, wynosi:`,
          correct,
          [
            math(fracStr(girls, girls + boys)),
            math(fracStr(boysMath, girlsMath + boysMath)),
            math(fracStr(girlsMath, girlsMath + boysMath + 1)),
          ],
          R`Osób lubiących matematykę jest $${girlsMath}+${boysMath}=${girlsMath + boysMath}$, w tym $${girlsMath}$ dziewcząt. $P=\frac{${girlsMath}}{${girlsMath + boysMath}}=${fracStr(girlsMath, girlsMath + boysMath)}$.`,
        );
      },
      (rng) => {
        const qDen = pick(rng, [40, 60, 80]);
        const fractions = [
          [1, 2],
          [1, 4],
          [1, 5],
          [2, 5],
        ];
        const [pNum, pDen] = pick(rng, fractions);
        const pPercent = (qDen * pNum) / pDen;
        const correct = math(fracStr(pNum, pDen));
        return task(
          R`Wiadomo, że $P(A\cap B)=${pPercent}\%$ oraz $P(B)=${qDen}\%$. Prawdopodobieństwo warunkowe $P(A|B)$ wynosi:`,
          correct,
          [
            math(fracStr(pDen, pNum)),
            math(fracStr(pPercent + 20, 100)),
            math(fracStr(qDen - pPercent, 100)),
          ],
          R`$P(A|B)=\frac{P(A\cap B)}{P(B)}=\frac{${pPercent}\%}{${qDen}\%}=${fracStr(pNum, pDen)}$.`,
        );
      },
      (rng) => {
        const threshold = int(rng, 7, 9);
        const target = int(rng, threshold + 1, 11);
        let all = 0;
        let good = 0;
        for (let a = 1; a <= 6; a += 1) {
          for (let b = 1; b <= 6; b += 1) {
            if (a + b > threshold) all += 1;
            if (a + b === target) good += 1;
          }
        }
        const correct = math(fracStr(good, all));
        return task(
          R`Rzucamy dwiema kostkami. Wiadomo, że suma oczek jest większa od $${threshold}$. Prawdopodobieństwo, że suma wynosi dokładnie $${target}$, jest równe:`,
          correct,
          [
            math(fracStr(good, 36)),
            math(fracStr(target - 1, 36)),
            math(fracStr(all, 36)),
          ],
          R`Sum większych od $${threshold}$ jest $${all}$, a sumę $${target}$ otrzymujemy na $${good}$ sposoby. Szukane prawdopodobieństwo to $\frac{${good}}{${all}}$.`,
        );
      },
    ],
  },
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "schemat_bernoulliego",
    topicName: "Schemat Bernoulliego",
    gens: [
      (rng) => {
        const n = int(rng, 3, 5);
        const k = int(rng, 1, n - 1);
        return task(
          R`Rzucamy $${n}$ razy monetą. Prawdopodobieństwo wyrzucenia dokładnie $${k}$ orłów wynosi:`,
          bernoulli(n, k, 1, 2),
          [
            bernoulli(n, k, 1, 3),
            math(fracStr(k, 2 ** n)),
            math(fracStr(binom(n, k), 2 ** n + 1)),
          ],
          R`$P=\binom{${n}}{${k}}\left(\frac12\right)^{${k}}\left(\frac12\right)^{${n - k}}=\frac{${binom(n, k)}}{${2 ** n}}=${fracStr(binom(n, k), 2 ** n)}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 2, 4);
        return task(
          R`Rzucamy $${n}$ razy kostką. Prawdopodobieństwo otrzymania dokładnie jednej szóstki wynosi:`,
          bernoulli(n, 1, 1, 6),
          [bernoulli(n, 0, 1, 6), bernoulli(n, 2, 1, 6), math(fracStr(1, 6))],
          R`$P=\binom{${n}}{1}\cdot\frac16\cdot\left(\frac56\right)^{${n - 1}}=\frac{${n}\cdot5^{${n - 1}}}{6^{${n}}}=${fracStr(n * 5 ** (n - 1), 6 ** n)}$.`,
        );
      },
      (rng) => {
        const pPairs = [
          [3, 4],
          [2, 3],
          [1, 4],
        ];
        const [pNum, pDen] = pick(rng, pPairs);
        const n = 3;
        const k = int(rng, 1, 2);
        return task(
          R`Strzelec trafia do celu z prawdopodobieństwem $\frac{${pNum}}{${pDen}}$. Oddaje $${n}$ niezależne strzały. Prawdopodobieństwo dokładnie $${k}$ trafień wynosi:`,
          bernoulli(n, k, pNum, pDen),
          [
            bernoulli(n, 0, pNum, pDen),
            math(fracStr(pNum, pDen)),
            math(fracStr(pDen - pNum, pDen)),
            num(0),
          ],
          R`$P=\binom{${n}}{${k}}\left(\frac{${pNum}}{${pDen}}\right)^{${k}}\left(\frac{${pDen - pNum}}{${pDen}}\right)^{${n - k}}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 2, 4);
        const succ = 2 ** n - 1;
        return task(
          R`Rzucamy $${n}$ razy monetą. Prawdopodobieństwo otrzymania co najmniej jednego orła wynosi:`,
          math(fracStr(succ, 2 ** n)),
          [
            math(fracStr(1, 2 ** n)),
            math(fracStr(n, 2 ** n)),
            math(fracStr(1, n + 1)),
          ],
          R`Zdarzenie przeciwne to same reszki, o prawdopodobieństwie $\frac{1}{${2 ** n}}$. Dlatego szukane prawdopodobieństwo to $1-\frac{1}{${2 ** n}}=\frac{${succ}}{${2 ** n}}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 2, 4);
        const k = int(rng, 1, n - 1);
        return task(
          R`Rzucamy $${n}$ razy kostką. Prawdopodobieństwo otrzymania dokładnie $${k}$ szóstek wynosi:`,
          bernoulli(n, k, 1, 6),
          [
            bernoulli(n, k, 1, 3),
            bernoulli(n, 0, 1, 6),
            math(fracStr(binom(n, k), 6 ** n)),
          ],
          R`$P=\binom{${n}}{${k}}\left(\frac16\right)^{${k}}\left(\frac56\right)^{${n - k}}=${fracStr(binom(n, k) * 5 ** (n - k), 6 ** n)}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 2, 4);
        const pPairs = [
          [1, 3],
          [1, 4],
          [2, 5],
        ];
        const [pNum, pDen] = pick(rng, pPairs);
        return task(
          R`Prawdopodobieństwo sukcesu w jednej próbie wynosi $\frac{${pNum}}{${pDen}}$. Wykonujemy $${n}$ niezależnych prób. Prawdopodobieństwo braku sukcesu wynosi:`,
          bernoulli(n, 0, pNum, pDen),
          [
            num(1),
            num(0),
            math(fracStr(pNum, pDen)),
          ],
          R`Brak sukcesu oznacza $${n}$ porażek: $\left(\frac{${pDen - pNum}}{${pDen}}\right)^{${n}}=${fracStr((pDen - pNum) ** n, pDen ** n)}$.`,
        );
      },
      (rng) => {
        const n = int(rng, 2, 4);
        const pPairs = [
          [1, 2],
          [1, 3],
          [3, 4],
        ];
        const [pNum, pDen] = pick(rng, pPairs);
        return task(
          R`Prawdopodobieństwo sukcesu wynosi $\frac{${pNum}}{${pDen}}$. W $${n}$ niezależnych próbach prawdopodobieństwo samych sukcesów wynosi:`,
          bernoulli(n, n, pNum, pDen),
          [
            math(fracStr(pNum, pDen)),
            math(fracStr(pDen - pNum, pDen + 1)),
            math(fracStr(pNum, pDen ** n + 1)),
          ],
          R`Wszystkie $${n}$ próby muszą zakończyć się sukcesem: $\left(\frac{${pNum}}{${pDen}}\right)^{${n}}=${fracStr(pNum ** n, pDen ** n)}$.`,
        );
      },
    ],
  },
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "srednia_wazona",
    topicName: "Średnia ważona",
    gens: [
      (rng) => {
        const values = [int(rng, 2, 6), int(rng, 2, 6), int(rng, 2, 6)];
        const weights = [int(rng, 1, 3), int(rng, 1, 3), int(rng, 1, 3)];
        const sum = values[0] * weights[0] + values[1] * weights[1] + values[2] * weights[2];
        const totalWeight = weights[0] + weights[1] + weights[2];
        const correct = math(fracStr(sum, totalWeight));
        return task(
          R`Oblicz średnią ważoną wartości $${values[0]}$, $${values[1]}$ i $${values[2]}$ z wagami odpowiednio $${weights[0]}$, $${weights[1]}$ i $${weights[2]}$.`,
          correct,
          [
            math(fracStr(sum + 1, totalWeight)),
            math(fracStr(sum - 1, totalWeight)),
            math(fracStr(sum, totalWeight + 1)),
          ],
          R`$\bar{x}_w=\frac{${values[0]}\cdot${weights[0]}+${values[1]}\cdot${weights[1]}+${values[2]}\cdot${weights[2]}}{${totalWeight}}=${fracStr(sum, totalWeight)}$.`,
        );
      },
      (rng) => {
        const grades = [int(rng, 2, 5), int(rng, 2, 5), int(rng, 3, 5)];
        const weights = [int(rng, 1, 3), int(rng, 1, 3), int(rng, 1, 3)];
        const sum = grades[0] * weights[0] + grades[1] * weights[1] + grades[2] * weights[2];
        const totalWeight = weights[0] + weights[1] + weights[2];
        return task(
          R`Oceny ucznia to $${grades[0]}$ (waga $${weights[0]}$), $${grades[1]}$ (waga $${weights[1]}$) i $${grades[2]}$ (waga $${weights[2]}$). Średnia ważona tych ocen wynosi:`,
          math(fracStr(sum, totalWeight)),
          [
            math(fracStr(sum + 1, totalWeight)),
            math(fracStr(sum - 1, totalWeight)),
            math(fracStr(sum, totalWeight + 1)),
          ],
          R`$\bar{x}_w=\frac{${grades[0]}\cdot${weights[0]}+${grades[1]}\cdot${weights[1]}+${grades[2]}\cdot${weights[2]}}{${totalWeight}}=${fracStr(sum, totalWeight)}$.`,
        );
      },
      (rng) => {
        const w1 = int(rng, 1, 3);
        const w2 = int(rng, 1, 3);
        const w3 = int(rng, 1, 3);
        const mean = int(rng, 3, 5);
        const v1 = int(rng, 2, 6);
        const v2 = int(rng, 2, 6);
        const totalWeight = w1 + w2 + w3;
        const missing = mean * totalWeight - v1 * w1 - v2 * w2;
        if (missing % w3 !== 0) return null;
        const v3 = missing / w3;
        if (v3 < 1 || v3 > 6) return null;
        return task(
          R`Średnia ważona trzech wartości wynosi $${mean}$. Dwie z nich to $${v1}$ (waga $${w1}$) i $${v2}$ (waga $${w2}$). Trzecia wartość ma wagę $${w3}$. Ile wynosi trzecia wartość?`,
          num(v3),
          [num(v3 + 1), num(mean), num(v3 - 1)],
          R`$(${v1}\cdot${w1}+${v2}\cdot${w2}+x\cdot${w3})/${totalWeight}=${mean}$, więc $x=${v3}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 5);
        if (b === a) return null;
        return task(
          R`$60\%$ uczniów pewnej grupy ma średnią ocen $${a}$, a pozostałe $40\%$ - średnią $${b}$. Średnia ocen całej grupy wynosi:`,
          math(fracStr(3 * a + 2 * b, 5)),
          [
            math(fracStr(a + b, 2)),
            math(fracStr(3 * a + 2 * b, 10)),
            math(fracStr(2 * a + 3 * b, 5)),
          ],
          R`Średnia ważona z wagami $0{,}6$ i $0{,}4$: $0{,}6\cdot${a}+0{,}4\cdot${b}=${fracStr(3 * a + 2 * b, 5)}$.`,
        );
      },
      (rng) => {
        const n1 = int(rng, 4, 10);
        const n2 = int(rng, 4, 10);
        const a1 = int(rng, 2, 5);
        const a2 = int(rng, 2, 5);
        const sum = n1 * a1 + n2 * a2;
        return task(
          R`W grupie $${n1}$ osób średnia wieku wynosi $${a1}$ lat, a w grupie $${n2}$ osób - $${a2}$ lata. Średnia wieku wszystkich $${n1 + n2}$ osób wynosi:`,
          math(fracStr(sum, n1 + n2)),
          [
            math(fracStr(sum + 1, n1 + n2)),
            math(fracStr(sum - 1, n1 + n2)),
            math(fracStr(sum, n1 + n2 + 1)),
          ],
          R`$\bar{x}=\frac{${n1}\cdot${a1}+${n2}\cdot${a2}}{${n1 + n2}}=${fracStr(sum, n1 + n2)}$.`,
        );
      },
      (rng) => {
        const n1 = int(rng, 5, 10);
        const n2 = int(rng, 5, 10);
        const a1 = int(rng, 2, 5);
        const a2 = a1 + pick(rng, [-2, -1, 1, 2]);
        if (a2 < 1 || a2 > 6) return null;
        const left = n1 * a1;
        const right = n2 * a2;
        const correct = left > right ? "grupa pierwsza" : "grupa druga";
        return task(
          R`Grupa pierwsza liczy $${n1}$ osób i ma średnią $${a1}$. Grupa druga liczy $${n2}$ osób i ma średnią $${a2}$. W której grupie suma wszystkich wartości jest większa?`,
          correct,
          ["grupa pierwsza", "grupa druga", "sumy są równe", "nie można porównać"].filter(
            (value) => value !== correct,
          ),
          R`Suma w pierwszej grupie to $${n1}\cdot${a1}=${left}$, a w drugiej $${n2}\cdot${a2}=${right}$. Większa jest w grupie: ${correct}.`,
        );
      },
    ],
  },
  {
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "odchylenie_standardowe",
    topicName: "Odchylenie standardowe",
    gens: [
      (rng) => {
        const a = int(rng, 1, 5);
        const d = int(rng, 1, 4);
        const data = [a, a + d, a + 2 * d, a + 3 * d];
        const mean = a + 1.5 * d;
        const variance = (5 * d * d) / 4;
        const sd = Math.sqrt(variance);
        return task(
          R`Oblicz odchylenie standardowe danych $${data.join(", ")}$.`,
          num(round2(sd)),
          [num(round2(variance)), num(round2(sd + 1)), num(round2(sd / 2))],
          R`Średnia to $${num(mean)}$, wariancja $${num(variance)}$, więc odchylenie standardowe $\sigma=\sqrt{${num(variance)}}\approx${num(round2(sd))}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        const d = pick(rng, [3, 6, 9]);
        const data = [a, a + d, a + 2 * d];
        const variance = (2 * d * d) / 3;
        return task(
          R`Oblicz wariancję danych $${data.join(", ")}$.`,
          num(variance),
          [num(variance + 1), num(2 * variance), num(d * d)],
          R`Średnia to $${a + d}$, a wariancja $\frac{(${data[0]}-${a + d})^2+0^2+(${data[2]}-${a + d})^2}{3}=\frac{${2 * d * d}}{3}=${variance}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const count = int(rng, 3, 6);
        const data = Array.from({ length: count }, () => a);
        return task(
          R`Oblicz odchylenie standardowe danych: $${data.join(", ")}$.`,
          "0",
          [num(a), "1", num(round2(a / 2))],
          R`Wszystkie wartości są równe $${a}$, więc odchylenia od średniej są zerowe, a odchylenie standardowe wynosi $0$.`,
        );
      },
      () => {
        const data = [2, 4, 6, 8];
        const mean = 5;
        const variance =
          data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length;
        return task(
          R`Oblicz wariancję danych $${data.join(", ")}$.`,
          num(variance),
          [num(variance + 1), num(Math.sqrt(variance)), num(2 * variance)],
          R`Średnia to $5$. Wariancja to $\frac{(2-5)^2+(4-5)^2+(6-5)^2+(8-5)^2}{4}=\frac{20}{4}=5$.`,
        );
      },
      (rng) => {
        const sd = int(rng, 2, 6);
        return task(
          R`Odchylenie standardowe pewnych danych wynosi $${sd}$. Wariancja tych danych jest równa:`,
          num(sd * sd),
          [num(sd), num(2 * sd), num(sd * sd + 1)],
          R`Wariancja to kwadrat odchylenia standardowego: $\sigma^2=${sd}^2=${sd * sd}$.`,
        );
      },
      (rng) => {
        const m = int(rng, 3, 9);
        const data = [m - 2, m - 1, m, m + 1, m + 2];
        return task(
          R`Oblicz odchylenie standardowe danych $${data.join(", ")}$.`,
          num(round2(Math.SQRT2)),
          ["2", "1", num(round2(Math.SQRT2 + 1))],
          R`Średnia to $${m}$, a wariancja $\frac{4+1+0+1+4}{5}=2$. Odchylenie standardowe to $\sqrt2\approx1{,}41$.`,
        );
      },
    ],
  },
];

const OPTYMALIZACJA = [
  {
    category: "optymalizacja",
    categoryName: "Optymalizacja",
    topic: "granice_funkcji",
    topicName: "Granice funkcji",
    gens: [
      (rng) => {
        const a = int(rng, -3, 3);
        const b = int(rng, -4, 4);
        const c = int(rng, -6, 6);
        const value = a * a + b * a + c;
        return task(
          R`Oblicz $\lim_{x\to${a}}\left(x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}\right)$.`,
          num(value),
          [num(value + 1), num(a * a + b + c), num(c)],
          R`Wielomian jest ciągły, więc wystarczy podstawić $x=${a}$: $${a}^2${b >= 0 ? "+" : ""}${b}\cdot${a}${c >= 0 ? "+" : ""}${c}=${value}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        return task(
          R`Oblicz $\lim_{x\to${a}}\frac{x^2-${a * a}}{x-${a}}$.`,
          num(2 * a),
          [num(a), num(a * a), num(2 * a + 1)],
          R`Licznik to $(x-${a})(x+${a})$, więc po skróceniu granica wynosi $${a}+${a}=${2 * a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = a + int(rng, 2, 5);
        const correct = num(b - a);
        return task(
          R`Oblicz $\lim_{x\to${a}}\frac{x^2-${a + b}x+${a * b}}{x-${a}}$.`,
          correct,
          [num(a + b), num(a - b), num(b)],
          R`Licznik to $(x-${a})(x-${b})$, więc po skróceniu zostaje $x-${b}$, a granica to $${a}-${b}=${b - a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, 2, 6);
        const polynomial = polyStr([1, b - a, -a * b]);
        return task(
          R`Oblicz $\lim_{x\to${a}}\frac{${polynomial}}{x-${a}}$.`,
          num(a + b),
          [num(b - a), num(a * b), num(a + b + 1)],
          R`Licznik to $(x-${a})(x+${b})$, więc granica wynosi $${a}+${b}=${a + b}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        let d = int(rng, 1, 5);
        if (d === a) d = a === 5 ? 4 : a + 1;
        const correct = math(fracStr(a, d));
        return task(
          R`Oblicz $\lim_{x\to\infty}\frac{${a}x^2+2x-1}{${d}x^2-x+3}$.`,
          correct,
          [math(fracStr(d, a)), num(a + d), "0"],
          R`Stopnie licznika i mianownika są równe, więc granica to iloraz współczynników przy $x^2$: $\frac{${a}}{${d}}=${fracStr(a, d)}$.`,
        );
      },
      (rng) => {
        const k = pick(rng, [2, 3, 4, 5]);
        const a = k * k;
        return task(
          R`Oblicz $\lim_{x\to${a}}\frac{\sqrt{x}-${k}}{x-${a}}$.`,
          math(fracStr(1, 2 * k)),
          [math(fracStr(1, k)), math(fracStr(2, k)), num(2 * k)],
          R`$\frac{\sqrt{x}-${k}}{x-${a}}=\frac{1}{\sqrt{x}+${k}}$, więc granica to $\frac{1}{${k}+${k}}=\frac{1}{${2 * k}}$.`,
        );
      },
      (rng) => {
        const k = int(rng, 2, 7);
        return task(
          R`Oblicz $\lim_{x\to0}\frac{x^2+${k}x}{x}$.`,
          num(k),
          [num(k + 1), num(k * k), "0"],
          R`Dla $x\ne0$ ułamek równa się $x+${k}$, więc granica wynosi $${k}$.`,
        );
      },
    ],
  },
  {
    category: "optymalizacja",
    categoryName: "Optymalizacja",
    topic: "pochodna",
    topicName: "Pochodna funkcji",
    gens: [
      (rng) => {
        const a = int(rng, -3, 3);
        const b = int(rng, -5, 5);
        const c = int(rng, -6, 6);
        const x0 = int(rng, -3, 3);
        const value = 3 * x0 * x0 + 2 * a * x0 + b;
        return task(
          R`Funkcja $f(x)=${polyStr([1, a, b, c])}$. Oblicz $f'(${x0})$.`,
          num(value),
          [num(value + 1), num(3 * x0 * x0 + a * x0 + b), num(value - 1)],
          R`$f'(x)=${polyStr([3, 2 * a, b])}$, więc $f'(${x0})=${value}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, -5, 5);
        const c = int(rng, -5, 5);
        const correct = math(linear(2 * a, b));
        return task(
          R`Funkcja $f(x)=${polyStr([a, b, c])}$. Pochodna $f'(x)$ jest równa:`,
          correct,
          [
            math(linear(2 * a, b + 1)),
            math(linear(2 * a + 1, b)),
            math(linear(a, b)),
          ],
          R`Pochodna $${a}x^2$ to $${2 * a}x$, pochodna $${b}x$ to $${b}$, a stała $${c}$ ma pochodną $0$. Zatem $f'(x)=${linear(2 * a, b)}$.`,
        );
      },
      (rng) => {
        const x0 = int(rng, 2, 5);
        return task(
          R`Funkcja $f(x)=\frac1x$. Oblicz $f'(${x0})$.`,
          math(fracStr(-1, x0 * x0)),
          [math(fracStr(1, x0 * x0)), math(fracStr(-1, x0)), num(-x0)],
          R`$f'(x)=-\frac{1}{x^2}$, więc $f'(${x0})=-\frac{1}{${x0 * x0}}$.`,
        );
      },
      (rng) => {
        const k = pick(rng, [2, 3, 4, 5]);
        const x0 = k * k;
        return task(
          R`Funkcja $f(x)=\sqrt{x}$. Oblicz $f'(${x0})$.`,
          math(fracStr(1, 2 * k)),
          [math(fracStr(1, k)), math(fracStr(1, 2 * x0)), num(2 * k)],
          R`$f'(x)=\frac{1}{2\sqrt{x}}$, więc $f'(${x0})=\frac{1}{2\cdot${k}}=\frac{1}{${2 * k}}$.`,
        );
      },
      (rng) => {
        const x0 = int(rng, 1, 5);
        const a = int(rng, 1, 4);
        const value = 2 * x0 - a;
        return task(
          R`Jaki jest współczynnik kierunkowy stycznej do wykresu $f(x)=x^2-${a}x$ w punkcie o odciętej $x=${x0}$?`,
          num(value),
          [num(2 * x0 + a), num(x0 * x0 - a * x0), num(value + 1)],
          R`$f'(x)=2x-${a}$, więc $f'(${x0})=${value}$. To właśnie współczynnik kierunkowy stycznej.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        return task(
          R`Dla jakiego $x$ pochodna funkcji $f(x)=x^2-${2 * a}x$ jest równa zero?`,
          num(a),
          [num(2 * a), num(-a), num(a * a)],
          R`$f'(x)=2x-${2 * a}$, więc $2x-${2 * a}=0$ daje $x=${a}$.`,
        );
      },
      (rng) => {
        const x0 = int(rng, 1, 3);
        const value = 4 * x0 ** 3 - 4 * x0;
        return task(
          R`Funkcja $f(x)=x^4-2x^2$. Oblicz $f'(${x0})$.`,
          num(value),
          [num(4 * x0 ** 3 - 2 * x0), num(value + 1), num(4 * x0 - 4)],
          R`$f'(x)=4x^3-4x$, więc $f'(${x0})=4\cdot${x0 ** 3}-4\cdot${x0}=${value}$.`,
        );
      },
    ],
  },
  {
    category: "optymalizacja",
    categoryName: "Optymalizacja",
    topic: "monotonicznosc_i_ekstrema",
    topicName: "Monotoniczność i ekstrema",
    gens: [
      (rng) => {
        const a = int(rng, 1, 6);
        return task(
          R`Funkcja $f(x)=x^2-${2 * a}x$ ma minimum w punkcie o odciętej:`,
          num(a),
          [num(2 * a), num(-a), num(a * a)],
          R`$f'(x)=2x-${2 * a}$, więc $f'(x)=0$ dla $x=${a}$. Parabola ma ramiona w górę, więc jest to minimum.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 6);
        return task(
          R`Funkcja $f(x)=-x^2+${2 * a}x$ ma maksimum w punkcie o odciętej:`,
          num(a),
          [num(-a), num(2 * a), num(a * a)],
          R`$f'(x)=-2x+${2 * a}$, więc $f'(x)=0$ dla $x=${a}$. Ramiona paraboli są skierowane w dół, więc jest to maksimum.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const correct = `x=-${a}`;
        return task(
          R`Funkcja $f(x)=x^3-${3 * a * a}x$ ma maksimum lokalne dla:`,
          correct,
          [`x=${a}`, "x=0", `x=${3 * a * a}`],
          R`$f'(x)=3x^2-${3 * a * a}=3(x-${a})(x+${a})$. Pochodna zmienia znak z dodatniego na ujemny w $x=-${a}$, więc tam jest maksimum.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 5);
        const correct = math(R`(-\infty,-${a})\cup(${a},\infty)`);
        return task(
          R`Funkcja $f(x)=x^3-${3 * a * a}x$ jest rosnąca w przedziale:`,
          correct,
          [
            math(R`(-${a},${a})`),
            math(R`(${a},\infty)`),
            math(R`(-\infty,${a})`),
          ],
          R`$f'(x)=3x^2-${3 * a * a}=3(x-${a})(x+${a})$. Pochodna jest dodatnia dla $x<-${a}$ oraz $x>${a}$.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const askMax = rng() > 0.5;
        const correct = askMax ? "x=0" : `x=${2 * a}`;
        return task(
          R`Funkcja $f(x)=x^3-${3 * a}x^2+1$ ma ${askMax ? "maksimum" : "minimum"} lokalne dla:`,
          correct,
          askMax
            ? [`x=${2 * a}`, `x=${a}`, "brak"]
            : ["x=0", `x=${a}`, "brak"],
          R`$f'(x)=3x^2-${6 * a}x=3x(x-${2 * a})$. Pochodna zmienia znak w $x=0$ i $x=${2 * a}$: w $x=0$ jest maksimum, a w $x=${2 * a}$ minimum.`,
        );
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, -5, 5);
        const value = b - a * a;
        return task(
          R`Funkcja $f(x)=${polyStr([1, 2 * a, b])}$ ma najmniejszą wartość równą:`,
          num(value),
          [num(b), num(b + a * a), num(-b)],
          R`$f'(x)=2x+${2 * a}$, więc minimum jest w $x=-${a}$, a $f(-${a})=${value}$.`,
        );
      },
      (rng) => {
        const a = pick(rng, [1, 2, 3, -1, -2, -3]);
        const count = a > 0 ? 0 : 2;
        return task(
          R`Ile ekstremów ma funkcja $f(x)=${polyStr([1, 0, a])}$?`,
          num(count),
          ["1", "3", num(count === 0 ? 2 : 0)],
          R`$f'(x)=3x^2${a > 0 ? "+" : ""}${a}$. Dla $a=${a}$ pochodna ${a > 0 ? "jest zawsze dodatnia, więc ekstremów nie ma" : "ma dwa miejsca zerowe i zmienia znak, więc są dwa ekstrema"}.`,
        );
      },
    ],
  },
];

const TOPICS = [
  ...LICZBY,
  ...ALGEBRA_A,
  ...ALGEBRA_B,
  ...FUNKCJE,
  ...CIAGI,
  ...TRYGONOMETRIA,
  ...GEOMETRIA_A,
  ...KOMBINATORYKA,
  ...OPTYMALIZACJA,
];

/* ------------------------------------------------------------------ */
/* Zapis                                                               */
/* ------------------------------------------------------------------ */

function validateBundle(bundle) {
  if (bundle.tasks.length !== 20) {
    throw new Error(`${bundle.topic}: ${bundle.tasks.length} zadań zamiast 20`);
  }
  const contents = new Set();
  for (const task of bundle.tasks) {
    if (!task.content || task.content.length < 15) {
      throw new Error(`${bundle.topic}: pusta treść`);
    }
    if (contents.has(task.content)) {
      throw new Error(`${bundle.topic}: powtórzona treść: ${task.content}`);
    }
    contents.add(task.content);
    if (new Set(task.options).size !== 4) {
      throw new Error(`${bundle.topic}: opcje nie są unikalne`);
    }
    if (!task.options.includes(task.correct_answer)) {
      throw new Error(`${bundle.topic}: brak poprawnej odpowiedzi w opcjach`);
    }
    if (task.options.some((option) => typeof option !== "string" || !option.trim())) {
      throw new Error(`${bundle.topic}: pusta opcja`);
    }
    if (task.explanation.trim().length < 20) {
      throw new Error(`${bundle.topic}: zbyt krótkie wyjaśnienie`);
    }
    if (task.xp_reward !== 10 + task.difficulty * 4) {
      throw new Error(`${bundle.topic}: złe xp_reward`);
    }
    if (![1, 2, 3].includes(task.difficulty)) {
      throw new Error(`${bundle.topic}: zła trudność`);
    }
  }
  const difficulties = bundle.tasks.map((task) => task.difficulty);
  if (difficulties.filter((d) => d === 1).length !== 7) {
    throw new Error(`${bundle.topic}: zły rozkład trudności (1)`);
  }
  if (difficulties.filter((d) => d === 2).length !== 7) {
    throw new Error(`${bundle.topic}: zły rozkład trudności (2)`);
  }
  if (difficulties.filter((d) => d === 3).length !== 6) {
    throw new Error(`${bundle.topic}: zły rozkład trudności (3)`);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let totalTasks = 0;
let totalBytes = 0;

for (const topic of TOPICS) {
  const bundle = buildTopic({ ...topic, exam_type: "matura_podstawowa" });
  validateBundle(bundle);

  const file = path.join(
    OUT_DIR,
    `matura_podstawowa__${topic.category}__${topic.topic}.json`,
  );
  const json = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(file, json, "utf8");

  totalTasks += bundle.tasks.length;
  totalBytes += Buffer.byteLength(json);
  console.log(`✓ ${path.basename(file)} (${bundle.tasks.length} zadań)`);
}

if (TOPICS.length !== 38) {
  throw new Error(`Oczekiwano 38 tematów, wygenerowano ${TOPICS.length}`);
}

console.log(
  `\nZapisano ${TOPICS.length} plików, ${totalTasks} zadań (${(totalBytes / 1024).toFixed(1)} kB) w ${OUT_DIR}`,
);
