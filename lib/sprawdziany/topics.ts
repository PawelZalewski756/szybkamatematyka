import {
  frac,
  gcd,
  int,
  numericQuestion,
  pick,
  shuffle,
  textQuestion,
  num,
} from "@/lib/sprawdziany/helpers";
import type {
  QuestionTemplate,
  Rng,
  SprawdzianTopic,
  TemplateLevel,
} from "@/lib/sprawdziany/types";

const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

function sup(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUP[Number(d)])
    .join("");
}

function spaced(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function tpl(
  id: string,
  level: TemplateLevel,
  generate: QuestionTemplate["generate"],
  classes?: readonly number[],
): QuestionTemplate {
  return { id, level, generate, classes };
}

const unit = (u: string) => (n: number) => `${num(n)} ${u}`;
const xEq = (n: number) => `x = ${n}`;

function termX(c: number): string {
  if (c === 1) return "x";
  if (c === -1) return "-x";
  return `${c}x`;
}

function linear(c1: number, c0: number): string {
  return `${termX(c1)} ${c0 >= 0 ? "+" : "-"} ${Math.abs(c0)}`;
}

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [6, 8, 10],
] as const;

function triple(rng: Rng) {
  const [a, b, c] = pick(rng, TRIPLES);
  const k = a === 6 ? 1 : int(rng, 1, 3);
  return { a: a * k, b: b * k, c: c * k };
}

const ulamki: SprawdzianTopic = {
  id: "ulamki",
  label: "Ułamki",
  description: "Dodawanie, mnożenie i dzielenie ułamków, zadania tekstowe.",
  classes: [7, 8],
  templates: [
    tpl("ulamki-suma", 2, (rng) => {
      const d1 = pick(rng, [2, 3, 4, 5, 6, 8]);
      let d2 = pick(rng, [2, 3, 4, 5, 6, 8]);
      if (d2 === d1) d2 = d1 === 2 ? 3 : 2;
      const p1 = int(rng, 1, d1 - 1);
      const p2 = int(rng, 1, d2 - 1);
      const n = p1 * d2 + p2 * d1;
      const d = d1 * d2;
      return textQuestion(rng, {
        prompt: `Oblicz: ${p1}/${d1} + ${p2}/${d2}`,
        correct: frac(n, d),
        wrongs: [frac(p1 + p2, d1 + d2), frac(p1 + p2, d), frac(n + 1, d)],
        fillers: [frac(n, d + 1), frac(n + d, d)],
        explanation: `Wspólny mianownik to ${d}: ${p1 * d2}/${d} + ${p2 * d1}/${d} = ${n}/${d} = ${frac(n, d)}. Nie wolno dodawać mianowników.`,
      });
    }),
    tpl("ulamki-iloczyn", 1, (rng) => {
      const d1 = int(rng, 2, 9);
      const d2 = int(rng, 2, 9);
      const p1 = int(rng, 1, d1 - 1);
      const p2 = int(rng, 1, d2 - 1);
      return textQuestion(rng, {
        prompt: `Oblicz: ${p1}/${d1} · ${p2}/${d2}`,
        correct: frac(p1 * p2, d1 * d2),
        wrongs: [
          frac(p1 * d2, d1 * p2),
          frac(p1 + p2, d1 * d2),
          frac(p1 * p2, d1 + d2),
        ],
        fillers: [frac(p1 * p2 + 1, d1 * d2), frac(p1 * p2, d1 * d2 + 1)],
        explanation: `Mnożymy liczniki i mianowniki: ${p1 * p2}/${d1 * d2} = ${frac(p1 * p2, d1 * d2)}.`,
      });
    }),
    tpl("ulamki-iloraz", 3, (rng) => {
      const d1 = int(rng, 2, 9);
      const d2 = int(rng, 2, 9);
      const p1 = int(rng, 1, d1 - 1);
      const p2 = int(rng, 1, d2 - 1);
      return textQuestion(rng, {
        prompt: `Oblicz: ${p1}/${d1} : ${p2}/${d2}`,
        correct: frac(p1 * d2, d1 * p2),
        wrongs: [
          frac(p1 * p2, d1 * d2),
          frac(d1 * p2, p1 * d2),
          frac(p1 * d2, d1 * d2),
        ],
        fillers: [frac(p1 * d2 + 1, d1 * p2), frac(p1 * d2, d1 * p2 + 1)],
        explanation: `Dzielenie zamieniamy na mnożenie przez odwrotność: ${p1}/${d1} · ${d2}/${p2} = ${frac(p1 * d2, d1 * p2)}.`,
      });
    }),
    tpl("ulamki-tekstowe", 2, (rng) => {
      const q1 = int(rng, 3, 8);
      let q2 = int(rng, 3, 8);
      if (q2 === q1) q2 = q1 === 8 ? 3 : q1 + 1;
      const d = q1 * q2;
      const rest = d - q1 - q2;
      return textQuestion(rng, {
        prompt: `Ania zjadła 1/${q1} tortu, a Basia 1/${q2} tortu. Jaka część tortu została?`,
        correct: frac(rest, d),
        wrongs: [frac(q1 + q2, d), frac(1, q1 + q2), frac(rest + 1, d)],
        fillers: [frac(rest, d + 1)],
        explanation: `Zjedzono 1/${q1} + 1/${q2} = ${frac(q1 + q2, d)} tortu, więc zostało 1 - ${frac(q1 + q2, d)} = ${frac(rest, d)}.`,
      });
    }),
  ],
};

const procenty: SprawdzianTopic = {
  id: "procenty",
  label: "Procenty",
  description: "Procent z liczby, obniżki, podwyżki, jaki to procent.",
  classes: [7, 8],
  templates: [
    tpl("procenty-z-liczby", 1, (rng) => {
      const pct = pick(rng, [10, 20, 25, 30, 40, 50, 5, 15]);
      const step = 100 / gcd(pct, 100);
      const base = step * int(rng, 1, 12);
      const value = (base * pct) / 100;
      return numericQuestion(rng, {
        prompt: `Ile to jest ${pct}% liczby ${base}?`,
        correct: value,
        wrongs: [base - value, (base * pct) / 10, base + value],
        explanation: `${pct}% z ${base} = ${pct}/100 · ${base} = ${value}.`,
      });
    }),
    tpl("procenty-obnizka", 2, (rng) => {
      const pct = pick(rng, [10, 20, 25, 50]);
      const price = 20 * int(rng, 2, 20);
      const disc = (price * pct) / 100;
      return numericQuestion(rng, {
        prompt: `Bluza kosztowała ${price} zł. Cenę obniżono o ${pct}%. Ile kosztuje po obniżce?`,
        correct: price - disc,
        wrongs: [disc, price + disc, price - pct],
        format: unit("zł"),
        explanation: `Obniżka to ${pct}% z ${price} = ${disc} zł, więc nowa cena: ${price} - ${disc} = ${price - disc} zł.`,
      });
    }),
    tpl("procenty-jaki-procent", 2, (rng) => {
      const pct = pick(rng, [10, 20, 25, 40, 50, 75]);
      const total = 20 * int(rng, 1, 10);
      const part = (total * pct) / 100;
      return numericQuestion(rng, {
        prompt: `W klasie jest ${total} uczniów, a ${part} z nich nosi okulary. Jaki procent klasy nosi okulary?`,
        correct: pct,
        wrongs: [100 - pct, pct / 2, pct * 2],
        deltas: [5, -5, 10, -10, 15],
        format: (n) => `${num(n)}%`,
        explanation: `${part}/${total} = ${frac(part, total)} = ${pct}/100, czyli ${pct}%.`,
      });
    }),
    tpl("procenty-przed-podwyzka", 3, (rng) => {
      const pct = pick(rng, [10, 20, 25, 50]);
      const old = 20 * int(rng, 2, 15);
      const now = (old * (100 + pct)) / 100;
      return numericQuestion(rng, {
        prompt: `Po podwyżce o ${pct}% rower kosztuje ${now} zł. Ile kosztował przed podwyżką?`,
        correct: old,
        wrongs: [
          Math.round((now * (100 - pct)) / 100),
          now - pct,
          (now * pct) / 100,
        ],
        format: unit("zł"),
        deltas: [10, -10, 20, -20, 5],
        explanation: `${now} zł to ${100 + pct}% starej ceny, więc stara cena: ${now} : ${(100 + pct) / 100} = ${old} zł. Nie odejmujemy ${pct}% od nowej ceny.`,
      });
    }),
  ],
};

const rownania: SprawdzianTopic = {
  id: "rownania",
  label: "Równania",
  description:
    "Równania liniowe, z nawiasami, układy równań, zadania tekstowe.",
  classes: [7, 8],
  templates: [
    tpl("rownania-proste", 1, (rng) => {
      const a = int(rng, 2, 9);
      const x = int(rng, -5, 9);
      const b = int(rng, -9, 12) || 4;
      const c = a * x + b;
      const swapped = (c + b) / a;
      return numericQuestion(rng, {
        prompt: `Rozwiąż równanie: ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${c}`,
        correct: x,
        wrongs: [-x, x + 1, Number.isInteger(swapped) ? swapped : x + 2],
        format: xEq,
        explanation: `${a}x = ${c} ${b >= 0 ? "-" : "+"} ${Math.abs(b)} = ${c - b}, więc x = ${c - b} : ${a} = ${x}.`,
      });
    }),
    tpl("rownania-obie-strony", 2, (rng) => {
      const x = int(rng, -4, 8);
      const c = int(rng, 1, 4);
      const a = c + int(rng, 1, 5);
      const b = int(rng, -6, 8);
      const d = b + (a - c) * x;
      return numericQuestion(rng, {
        prompt: `Rozwiąż równanie: ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${c}x ${d >= 0 ? "+" : "-"} ${Math.abs(d)}`,
        correct: x,
        wrongs: [-x, x + 1, x - 1],
        format: xEq,
        explanation: `Niewiadome na lewo: ${a - c}x = ${d} ${b >= 0 ? "-" : "+"} ${Math.abs(b)} = ${d - b}, więc x = ${x}.`,
      });
    }),
    tpl("rownania-nawiasy", 2, (rng) => {
      const a = int(rng, 2, 6);
      const x = int(rng, 1, 8);
      const b = int(rng, 1, 7);
      const c = a * (x + b);
      return numericQuestion(rng, {
        prompt: `Rozwiąż równanie: ${a}(x + ${b}) = ${c}`,
        correct: x,
        wrongs: [c / a + b, c / a, x + 1],
        format: xEq,
        explanation: `Dzielimy przez ${a}: x + ${b} = ${c / a}, stąd x = ${x}.`,
      });
    }),
    tpl("rownania-kolejne-liczby", 3, (rng) => {
      const n = int(rng, 4, 30);
      const sum = 3 * n + 3;
      return numericQuestion(rng, {
        prompt: `Suma trzech kolejnych liczb naturalnych jest równa ${sum}. Jaka jest najmniejsza z tych liczb?`,
        correct: n,
        wrongs: [n + 1, n + 2, sum / 3 + 1],
        explanation: `Liczby: x, x+1, x+2. Równanie 3x + 3 = ${sum} daje x = ${n}.`,
      });
    }),
    tpl(
      "rownania-uklad",
      3,
      (rng) => {
        const y = int(rng, 1, 8);
        const x = y + int(rng, 1, 8);
        return numericQuestion(rng, {
          prompt: `Rozwiąż układ równań: x + y = ${x + y} oraz x - y = ${x - y}. Ile wynosi x?`,
          correct: x,
          wrongs: [y, x + y, x - y],
          format: xEq,
          explanation: `Dodajemy równania stronami: 2x = ${2 * x}, więc x = ${x} (a y = ${y}).`,
        });
      },
      [8],
    ),
  ],
};

const potegi: SprawdzianTopic = {
  id: "potegi-pierwiastki",
  label: "Potęgi i pierwiastki",
  description: "Działania na potęgach, pierwiastki, notacja wykładnicza.",
  classes: [7, 8],
  templates: [
    tpl("potegi-iloczyn", 1, (rng) => {
      const b = pick(rng, [2, 3]);
      const m = int(rng, 1, 3);
      const n = int(rng, 1, 3);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${b}${sup(m)} · ${b}${sup(n)}`,
        correct: b ** (m + n),
        wrongs: [b ** (m * n), b ** m + b ** n, b ** (m + n) / b],
        explanation: `Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki: ${b}${sup(m + n)} = ${b ** (m + n)}.`,
      });
    }),
    tpl("potegi-iloraz", 2, (rng) => {
      const b = pick(rng, [2, 3, 5]);
      const n = int(rng, 1, 3);
      const m = n + int(rng, 1, 3);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${b}${sup(m)} : ${b}${sup(n)}`,
        correct: b ** (m - n),
        wrongs: [b ** (m - n + 1), b ** m - b ** n, b ** m],
        explanation: `Przy dzieleniu odejmujemy wykładniki: ${b}${sup(m - n)} = ${b ** (m - n)}.`,
      });
    }),
    tpl(
      "pierwiastki-suma",
      1,
      (rng) => {
        const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
        const A = pick(rng, squares);
        const B = pick(rng, squares);
        const a = Math.sqrt(A);
        const b = Math.sqrt(B);
        const plus = rng() < 0.5;
        return numericQuestion(rng, {
          prompt: `Oblicz: √${A} ${plus ? "+" : "-"} √${B}`,
          correct: plus ? a + b : a - b,
          wrongs: [
            a * b,
            plus ? a - b : a + b,
            Math.sqrt(Math.abs(plus ? A + B : A - B)),
          ],
          explanation: `√${A} = ${a}, √${B} = ${b}, więc wynik to ${a} ${plus ? "+" : "-"} ${b} = ${plus ? a + b : a - b}.`,
        });
      },
      [8],
    ),
    tpl("potegi-znaki", 2, (rng) => {
      const k = int(rng, 2, 5);
      return numericQuestion(rng, {
        prompt: `Oblicz: (-${k})³ + ${k}²`,
        correct: -(k ** 3) + k ** 2,
        wrongs: [k ** 3 + k ** 2, -(k ** 3) - k ** 2, k ** 3 - k ** 2],
        explanation: `(-${k})³ = -${k ** 3} (nieparzysty wykładnik zachowuje minus), ${k}² = ${k ** 2}. Razem: ${-(k ** 3) + k ** 2}.`,
      });
    }),
    tpl("potegi-notacja", 2, (rng) => {
      const a = int(rng, 1, 9);
      const b = int(rng, 1, 9);
      const e = int(rng, 3, 7);
      const value = (a * 10 + b) * 10 ** (e - 1);
      const mant = `${a},${b}`;
      return textQuestion(rng, {
        prompt: `Liczbę ${spaced(value)} zapisano w notacji wykładniczej. Który zapis jest poprawny?`,
        correct: `${mant} · 10${sup(e)}`,
        wrongs: [
          `${mant} · 10${sup(e + 1)}`,
          `${mant} · 10${sup(e - 1)}`,
          `${a}${b} · 10${sup(e - 1)}`,
        ],
        explanation: `W notacji wykładniczej mantysa jest liczbą od 1 do 10: ${spaced(value)} = ${mant} · 10${sup(e)}.`,
      });
    }),
  ],
};

const poleObwod: SprawdzianTopic = {
  id: "pola-obwody",
  label: "Pola i obwody",
  description: "Prostokąt, trójkąt, trapez, romb, koło.",
  classes: [7, 8],
  templates: [
    tpl("pola-prostokat", 2, (rng) => {
      const a = int(rng, 3, 12);
      const b = int(rng, 2, 10);
      return numericQuestion(rng, {
        prompt: `Obwód prostokąta wynosi ${2 * (a + b)} cm, a jeden z jego boków ma ${a} cm. Ile wynosi pole tego prostokąta?`,
        correct: a * b,
        wrongs: [a + b, 2 * (a + b), a * (a + b)],
        format: unit("cm²"),
        explanation: `Półobwód: ${a + b}, więc drugi bok to ${a + b} - ${a} = ${b} cm. Pole = ${a} · ${b} = ${a * b} cm².`,
      });
    }),
    tpl("pola-trojkat", 1, (rng) => {
      const a = 2 * int(rng, 2, 10);
      const h = int(rng, 3, 12);
      return numericQuestion(rng, {
        prompt: `Podstawa trójkąta ma ${a} cm, a wysokość opuszczona na tę podstawę ${h} cm. Oblicz pole trójkąta.`,
        correct: (a * h) / 2,
        wrongs: [a * h, a + h, (a * h) / 4],
        format: unit("cm²"),
        explanation: `P = ½ · a · h = ½ · ${a} · ${h} = ${(a * h) / 2} cm².`,
      });
    }),
    tpl("pola-trapez", 2, (rng) => {
      const a = int(rng, 4, 14);
      const b = a - 2 * int(rng, 1, 2);
      const h = int(rng, 3, 10);
      return numericQuestion(rng, {
        prompt: `Podstawy trapezu mają długości ${a} cm i ${b} cm, a wysokość wynosi ${h} cm. Oblicz pole trapezu.`,
        correct: ((a + b) * h) / 2,
        wrongs: [(a + b) * h, a * h, a + b + h],
        format: unit("cm²"),
        explanation: `P = ½ · (a + b) · h = ½ · (${a} + ${b}) · ${h} = ${((a + b) * h) / 2} cm².`,
      });
    }),
    tpl("pola-romb", 2, (rng) => {
      const e = 2 * int(rng, 2, 8);
      const f = int(rng, 3, 12);
      return numericQuestion(rng, {
        prompt: `Przekątne rombu mają długości ${e} cm i ${f} cm. Oblicz pole rombu.`,
        correct: (e * f) / 2,
        wrongs: [e * f, e + f, 2 * (e + f)],
        format: unit("cm²"),
        explanation: `P = ½ · e · f = ½ · ${e} · ${f} = ${(e * f) / 2} cm².`,
      });
    }),
    tpl("pola-kolo", 2, (rng) => {
      const r = int(rng, 3, 9);
      return textQuestion(rng, {
        prompt: `Oblicz pole koła o promieniu ${r} cm. Wynik podaj z użyciem π.`,
        correct: `${r * r}π cm²`,
        wrongs: [`${2 * r}π cm²`, `${2 * r * r}π cm²`, `${r}π cm²`],
        explanation: `P = π · r² = π · ${r}² = ${r * r}π cm². Wzór 2πr to obwód.`,
      });
    }),
    tpl("pola-obwod-kola", 2, (rng) => {
      const d = 2 * int(rng, 2, 9);
      return textQuestion(rng, {
        prompt: `Średnica koła ma ${d} cm. Oblicz obwód koła. Wynik podaj z użyciem π.`,
        correct: `${d}π cm`,
        wrongs: [`${d * d}π cm`, `${d / 2}π cm`, `${2 * d}π cm`],
        explanation: `Obwód = π · d = ${d}π cm.`,
      });
    }),
  ],
};

const pitagoras: SprawdzianTopic = {
  id: "pitagoras",
  label: "Twierdzenie Pitagorasa",
  description: "Przeciwprostokątna, przyprostokątna, przekątne.",
  classes: [8],
  templates: [
    tpl("pitagoras-przeciwprostokatna", 1, (rng) => {
      const { a, b, c } = triple(rng);
      return numericQuestion(rng, {
        prompt: `Przyprostokątne trójkąta prostokątnego mają długości ${a} cm i ${b} cm. Ile wynosi długość przeciwprostokątnej?`,
        correct: c,
        wrongs: [a + b, b - a, c + 1],
        format: unit("cm"),
        explanation: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, więc c = ${c} cm.`,
      });
    }),
    tpl("pitagoras-przyprostokatna", 2, (rng) => {
      const { a, b, c } = triple(rng);
      return numericQuestion(rng, {
        prompt: `Przeciwprostokątna trójkąta prostokątnego ma ${c} cm, a jedna z przyprostokątnych ${a} cm. Oblicz długość drugiej przyprostokątnej.`,
        correct: b,
        wrongs: [c - a, c + a, c - a + 1],
        format: unit("cm"),
        explanation: `b² = ${c}² - ${a}² = ${c * c} - ${a * a} = ${b * b}, więc b = ${b} cm.`,
      });
    }),
    tpl("pitagoras-przekatna-prostokata", 2, (rng) => {
      const { a, b, c } = triple(rng);
      return numericQuestion(rng, {
        prompt: `Boki prostokąta mają długości ${a} cm i ${b} cm. Ile wynosi długość przekątnej tego prostokąta?`,
        correct: c,
        wrongs: [a + b, 2 * (a + b), a * b],
        format: unit("cm"),
        explanation: `Przekątna jest przeciwprostokątną trójkąta o przyprostokątnych ${a} i ${b}: d² = ${a * a + b * b}, d = ${c} cm.`,
      });
    }),
    tpl("pitagoras-przekatna-kwadratu", 2, (rng) => {
      const a = int(rng, 2, 12);
      return textQuestion(rng, {
        prompt: `Bok kwadratu ma długość ${a} cm. Oblicz długość przekątnej kwadratu.`,
        correct: `${a}√2 cm`,
        wrongs: [`${a}√3 cm`, `${2 * a} cm`, `${a * a}√2 cm`],
        explanation: `Przekątna kwadratu: d = a√2 = ${a}√2 cm.`,
      });
    }),
    tpl("pitagoras-czy-prostokatny", 3, (rng) => {
      const { a, b, c } = triple(rng);
      const fmt = (x: number, y: number, z: number) => `${x}, ${y}, ${z}`;
      return textQuestion(rng, {
        prompt:
          "Który z trójkątów o podanych długościach boków jest prostokątny?",
        correct: fmt(a, b, c),
        wrongs: [fmt(a, b, c + 1), fmt(a, b + 1, c), fmt(a + 1, b, c)],
        explanation: `Sprawdzamy, czy ${a}² + ${b}² = ${c}²: ${a * a} + ${b * b} = ${c * c}. Dla pozostałych zestawów równość nie zachodzi.`,
      });
    }),
  ],
};

const bryly: SprawdzianTopic = {
  id: "bryly",
  label: "Bryły",
  description:
    "Objętość i pole powierzchni sześcianu, prostopadłościanu, ostrosłupa.",
  classes: [7, 8],
  templates: [
    tpl("bryly-szescian-v", 1, (rng) => {
      const a = int(rng, 2, 9);
      return numericQuestion(rng, {
        prompt: `Oblicz objętość sześcianu o krawędzi ${a} cm.`,
        correct: a ** 3,
        wrongs: [a * a, 3 * a, 6 * a * a],
        format: unit("cm³"),
        explanation: `V = a³ = ${a}³ = ${a ** 3} cm³.`,
      });
    }),
    tpl("bryly-szescian-pc", 2, (rng) => {
      const a = int(rng, 2, 9);
      return numericQuestion(rng, {
        prompt: `Oblicz pole powierzchni całkowitej sześcianu o krawędzi ${a} cm.`,
        correct: 6 * a * a,
        wrongs: [a ** 3, 4 * a * a, 12 * a],
        format: unit("cm²"),
        explanation: `Sześcian ma 6 jednakowych ścian: P = 6a² = 6 · ${a * a} = ${6 * a * a} cm².`,
      });
    }),
    tpl("bryly-prostopadloscian-v", 1, (rng) => {
      const a = int(rng, 2, 9);
      const b = int(rng, 2, 9);
      const c = int(rng, 2, 9);
      return numericQuestion(rng, {
        prompt: `Wymiary prostopadłościanu to ${a} cm, ${b} cm i ${c} cm. Oblicz jego objętość.`,
        correct: a * b * c,
        wrongs: [a * b + c, a + b + c, 2 * (a * b + b * c + a * c)],
        format: unit("cm³"),
        explanation: `V = a · b · c = ${a} · ${b} · ${c} = ${a * b * c} cm³.`,
      });
    }),
    tpl("bryly-prostopadloscian-pc", 2, (rng) => {
      const a = int(rng, 2, 9);
      const b = int(rng, 2, 9);
      const c = int(rng, 2, 9);
      const pc = 2 * (a * b + b * c + a * c);
      return numericQuestion(rng, {
        prompt: `Wymiary prostopadłościanu to ${a} cm, ${b} cm i ${c} cm. Oblicz pole jego powierzchni całkowitej.`,
        correct: pc,
        wrongs: [a * b * c, a * b + b * c + a * c, 2 * (a + b + c)],
        format: unit("cm²"),
        explanation: `P = 2(ab + bc + ac) = 2(${a * b} + ${b * c} + ${a * c}) = ${pc} cm².`,
      });
    }),
    tpl(
      "bryly-ostroslup",
      2,
      (rng) => {
        const a = int(rng, 2, 9);
        const k = int(rng, 1, 5);
        const h = 3 * k;
        return numericQuestion(rng, {
          prompt: `Podstawą ostrosłupa jest kwadrat o boku ${a} cm, a wysokość ostrosłupa wynosi ${h} cm. Oblicz objętość.`,
          correct: a * a * k,
          wrongs: [a * a * h, (a * a * h) / 2, a * h],
          format: unit("cm³"),
          explanation: `V = ⅓ · Pp · H = ⅓ · ${a * a} · ${h} = ${a * a * k} cm³.`,
        });
      },
      [8],
    ),
    tpl("bryly-litry", 3, (rng) => {
      const dims = [20, 30, 40, 50, 60];
      const a = pick(rng, dims);
      const b = pick(rng, dims);
      const c = pick(rng, dims);
      const litres = (a * b * c) / 1000;
      return numericQuestion(rng, {
        prompt: `Akwarium ma kształt prostopadłościanu o wymiarach ${a} cm × ${b} cm × ${c} cm. Ile litrów wody się w nim zmieści? (1 l = 1 dm³)`,
        correct: litres,
        wrongs: [litres * 10, litres * 100, litres / 10],
        format: unit("l"),
        explanation: `${a} cm = ${a / 10} dm, ${b} cm = ${b / 10} dm, ${c} cm = ${c / 10} dm. V = ${a / 10} · ${b / 10} · ${c / 10} = ${litres} dm³ = ${litres} l.`,
      });
    }),
  ],
};

const statystyka: SprawdzianTopic = {
  id: "statystyka-prawdopodobienstwo",
  label: "Statystyka i prawdopodobieństwo",
  description: "Średnia, mediana, prawdopodobieństwo.",
  classes: [8],
  templates: [
    tpl("stat-srednia", 1, (rng) => {
      const avg = int(rng, 5, 20);
      const devs = [
        int(rng, -4, 4),
        int(rng, -4, 4),
        int(rng, -4, 4),
        int(rng, -4, 4),
      ];
      devs.push(-devs.reduce((s, d) => s + d, 0));
      const nums = shuffle(
        rng,
        devs.map((d) => avg + d),
      );
      return numericQuestion(rng, {
        prompt: `Oblicz średnią arytmetyczną liczb: ${nums.join(", ")}.`,
        correct: avg,
        wrongs: [Math.max(...nums), Math.min(...nums), nums[2]],
        explanation: `Suma liczb to ${nums.reduce((s, n) => s + n, 0)}, a liczb jest 5, więc średnia: ${avg}.`,
      });
    }),
    tpl("stat-brakujaca", 2, (rng) => {
      const three = [int(rng, 3, 15), int(rng, 3, 15), int(rng, 3, 15)];
      const sum = three.reduce((s, n) => s + n, 0);
      const m = Math.ceil((sum + 2) / 4) + int(rng, 0, 3);
      const w = 4 * m - sum;
      return numericQuestion(rng, {
        prompt: `Średnia arytmetyczna czterech liczb wynosi ${m}. Trzy z nich to ${three.join(", ")}. Jaka jest czwarta liczba?`,
        correct: w,
        wrongs: [m, 4 * m, m * 3 - sum],
        explanation: `Suma wszystkich liczb: 4 · ${m} = ${4 * m}. Czwarta liczba: ${4 * m} - ${sum} = ${w}.`,
      });
    }),
    tpl("stat-mediana", 2, (rng) => {
      const count = pick(rng, [5, 6]);
      const set = new Set<number>();
      while (set.size < count) set.add(int(rng, 1, 30));
      const data = shuffle(rng, [...set]);
      const sorted = [...data].sort((x, y) => x - y);
      const median =
        count % 2
          ? sorted[(count - 1) / 2]
          : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
      const mean = data.reduce((s, n) => s + n, 0) / count;
      return numericQuestion(rng, {
        prompt: `Wyznacz medianę liczb: ${data.join(", ")}.`,
        correct: median,
        wrongs: [
          data[Math.floor(count / 2)],
          Number(mean.toFixed(2)),
          sorted[count - 1],
        ],
        deltas: [1, -1, 2, -2],
        explanation: `Po uporządkowaniu: ${sorted.join(", ")}. ${count % 2 ? "Mediana to środkowa liczba" : "Mediana to średnia dwóch środkowych liczb"}: ${num(median)}.`,
      });
    }),
    tpl("prawdopodobienstwo-urna", 2, (rng) => {
      const r = int(rng, 2, 6);
      const b = int(rng, 2, 6);
      const g = int(rng, 1, 5);
      const t = r + b + g;
      return textQuestion(rng, {
        prompt: `W pudełku jest ${r} kul czerwonych, ${b} niebieskich i ${g} zielonych. Losujemy jedną kulę. Jakie jest prawdopodobieństwo wylosowania kuli czerwonej?`,
        correct: frac(r, t),
        wrongs: [frac(r, t - r), frac(1, t), frac(t - r, t)],
        fillers: [frac(r + 1, t), frac(r, t + 1)],
        explanation: `Wszystkich kul jest ${t}, korzystnych ${r}, więc P = ${r}/${t} = ${frac(r, t)}.`,
      });
    }),
    tpl("prawdopodobienstwo-kostka", 1, (rng) => {
      const events = [
        { label: "parzysta liczba oczek", count: 3 },
        { label: "liczba oczek większa niż 4", count: 2 },
        { label: "liczba oczek podzielna przez 3", count: 2 },
        { label: "liczba oczek będąca liczbą pierwszą", count: 3 },
        { label: "liczba oczek mniejsza niż 3", count: 2 },
        { label: "liczba oczek nie większa niż 5", count: 5 },
      ];
      const e = pick(rng, events);
      return textQuestion(rng, {
        prompt: `Rzucamy jeden raz sześcienną kostką do gry. Jakie jest prawdopodobieństwo zdarzenia: wypadła ${e.label}?`,
        correct: frac(e.count, 6),
        wrongs: [frac(e.count, 5), frac(e.count + 1, 6), frac(1, e.count)],
        fillers: [frac(e.count, 7), frac(e.count - 1, 6)],
        explanation: `Wszystkich wyników jest 6, sprzyjających ${e.count}, więc P = ${e.count}/6 = ${frac(e.count, 6)}.`,
      });
    }),
  ],
};

const tekstowe: SprawdzianTopic = {
  id: "zadania-tekstowe",
  label: "Zadania tekstowe i proporcje",
  description: "Proporcjonalność, prędkość i droga, skala mapy, wiek.",
  classes: [7, 8],
  templates: [
    tpl("tekstowe-proporcja", 1, (rng) => {
      const u = int(rng, 3, 12);
      const a = int(rng, 2, 6);
      const b = int(rng, 7, 15);
      return numericQuestion(rng, {
        prompt: `${a} kg jabłek kosztuje ${a * u} zł. Ile zapłacimy za ${b} kg tych jabłek?`,
        correct: b * u,
        wrongs: [a * u + b - a, a * u * b, u + b],
        format: unit("zł"),
        explanation: `1 kg kosztuje ${a * u} : ${a} = ${u} zł, więc ${b} kg kosztuje ${b} · ${u} = ${b * u} zł.`,
      });
    }),
    tpl("tekstowe-droga", 2, (rng) => {
      const v = 10 * int(rng, 4, 10);
      const t = pick(rng, [1.5, 2.5, 3.5, 2, 3]);
      return numericQuestion(rng, {
        prompt: `Samochód jedzie ze stałą prędkością ${v} km/h. Jaką drogę pokona w ciągu ${num(t)} h?`,
        correct: v * t,
        wrongs: [v + t, v / t, v * t * 2],
        format: unit("km"),
        deltas: [10, -10, 20, -20, 5],
        explanation: `s = v · t = ${v} · ${num(t)} = ${num(v * t)} km.`,
      });
    }),
    tpl("tekstowe-skala", 2, (rng) => {
      const scale = pick(rng, [25000, 50000, 100000]);
      const step = scale === 100000 ? 1 : scale === 50000 ? 2 : 4;
      const cm = step * int(rng, 1, 6) * (scale === 100000 ? 2 : 1);
      const km = (cm * scale) / 100000;
      return numericQuestion(rng, {
        prompt: `Na mapie w skali 1 : ${spaced(scale)} odległość między dwoma miastami wynosi ${cm} cm. Ile kilometrów dzieli te miasta w rzeczywistości?`,
        correct: km,
        wrongs: [km * 10, km * 100, km / 10],
        format: unit("km"),
        explanation: `${cm} cm · ${spaced(scale)} = ${spaced(cm * scale)} cm = ${num(km)} km (100 000 cm = 1 km).`,
      });
    }),
    tpl("tekstowe-odwrotna", 2, (rng) => {
      const w1 = pick(rng, [2, 3, 4, 6]);
      let w2 = pick(rng, [3, 4, 5, 6, 8, 9, 12]);
      if (w2 === w1) w2 += 1;
      const k = int(rng, 1, 3);
      const d = w2 * k;
      return numericQuestion(rng, {
        prompt: `Pracę wykonywaną przez ${w1} pracowników można skończyć w ${d} dni. Ile dni zajmie ta sama praca ${w2} pracownikom, jeśli każdy pracuje tak samo szybko? Podaj liczbę dni.`,
        correct: w1 * k,
        wrongs: [d, (d * w2) / w1, d + w2 - w1],
        explanation: `To proporcjonalność odwrotna: łączna praca to ${w1} · ${d} = ${w1 * d} osobodni. Dla ${w2} pracowników: ${w1 * d} : ${w2} = ${w1 * k} dni.`,
      });
    }),
    tpl("tekstowe-wiek", 3, (rng) => {
      const o = int(rng, 8, 20);
      const k = int(rng, 2, 8);
      const s = 2 * o + k;
      return numericQuestion(rng, {
        prompt: `Marek jest o ${k} lat starszy od Oli. Razem mają ${s} lat. Ile lat ma Ola?`,
        correct: o,
        wrongs: [s / 2, s - k, o + k],
        explanation: `Ola: x, Marek: x + ${k}. Równanie: 2x + ${k} = ${s}, stąd x = ${o}.`,
      });
    }),
  ],
};

const algebra: SprawdzianTopic = {
  id: "wyrazenia-algebraiczne",
  label: "Wyrażenia algebraiczne",
  description: "Upraszczanie, wartość wyrażenia, wzory skróconego mnożenia.",
  classes: [7, 8],
  templates: [
    tpl("algebra-redukcja", 1, (rng) => {
      const a = int(rng, 2, 8);
      const c = int(rng, 2, 6);
      const b = int(rng, 2, 9);
      const minus = rng() < 0.5;
      let d = int(rng, 2, 9);
      if (minus ? d === b : d === -b || d === b) d += 1;
      const signedD = minus ? -d : d;
      return textQuestion(rng, {
        prompt: `Uprość wyrażenie: ${a}x - ${b} + ${c}x ${minus ? "-" : "+"} ${d}`,
        correct: linear(a + c, -b + signedD),
        wrongs: [
          linear(a + c, b + signedD),
          linear(a * c, -b + signedD),
          linear(a + c, -b - signedD),
        ],
        fillers: [linear(a + c + 1, -b + signedD)],
        explanation: `Wyrazy z x: ${a}x + ${c}x = ${a + c}x. Liczby: -${b} ${minus ? "-" : "+"} ${d} = ${-b + signedD}. Wynik: ${linear(a + c, -b + signedD)}.`,
      });
    }),
    tpl("algebra-upraszczanie", 2, (rng) => {
      const k = int(rng, 2, 5);
      const b = int(rng, 1, 6);
      let m = int(rng, -4, 4);
      if (m === 0 || m === -k) m = 1;
      const coef = k + m;
      return textQuestion(rng, {
        prompt: `Uprość wyrażenie: ${k}(x + ${b}) ${m >= 0 ? "+" : "-"} ${Math.abs(m)}x`,
        correct: linear(coef, k * b),
        wrongs: [linear(coef, b), linear(k * m, k * b), linear(coef, -k * b)],
        fillers: [linear(k - m, k * b), linear(coef, k + b)],
        explanation: `Mnożymy przez nawias: ${k}x + ${k * b} ${m >= 0 ? "+" : "-"} ${Math.abs(m)}x = ${linear(coef, k * b)}.`,
      });
    }),
    tpl("algebra-wartosc", 2, (rng) => {
      const a = int(rng, 1, 4);
      const b = int(rng, 1, 5);
      const t = int(rng, 1, 4);
      return numericQuestion(rng, {
        prompt: `Oblicz wartość wyrażenia ${a}x² - ${b}x dla x = -${t}.`,
        correct: a * t * t + b * t,
        wrongs: [a * t * t - b * t, -a * t * t - b * t, (a * t) ** 2 + b * t],
        explanation: `${a}·(-${t})² - ${b}·(-${t}) = ${a * t * t} + ${b * t} = ${a * t * t + b * t}. Kwadrat liczby ujemnej jest dodatni.`,
      });
    }),
    tpl("algebra-kwadrat-sumy", 2, (rng) => {
      const a = int(rng, 2, 7);
      const minus = rng() < 0.5;
      const s = minus ? "-" : "+";
      return textQuestion(rng, {
        prompt: `Które wyrażenie jest równe (x ${s} ${a})²?`,
        correct: `x² ${s} ${2 * a}x + ${a * a}`,
        wrongs: [
          `x² ${s} ${a * a}`,
          `x² ${s} ${a}x + ${a * a}`,
          `x² ${s} ${2 * a}x + ${a}`,
        ],
        explanation: `(a ${s} b)² = a² ${s} 2ab + b², czyli x² ${s} ${2 * a}x + ${a * a}.`,
      });
    }),
    tpl("algebra-roznica-kwadratow", 3, (rng) => {
      const a = int(rng, 2, 9);
      return textQuestion(rng, {
        prompt: `Które wyrażenie jest równe (x - ${a})(x + ${a})?`,
        correct: `x² - ${a * a}`,
        wrongs: [`x² + ${a * a}`, `x² - ${2 * a}x + ${a * a}`, `x² - ${a}`],
        explanation: `(a - b)(a + b) = a² - b², więc wynik to x² - ${a * a}.`,
      });
    }),
  ],
};

const liczbyWymierne: SprawdzianTopic = {
  id: "liczby-wymierne",
  label: "Liczby ujemne i działania",
  description:
    "Liczby ujemne, wartość bezwzględna, ułamki dziesiętne, kolejność działań.",
  classes: [7],
  templates: [
    tpl("wymierne-kolejnosc", 1, (rng) => {
      const a = int(rng, 2, 15);
      const b = int(rng, 2, 9);
      const c = int(rng, 2, 9);
      const d = int(rng, 1, 12);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${a} + ${b} · ${c} - ${d}`,
        correct: a + b * c - d,
        wrongs: [(a + b) * c - d, a + b * (c - d), a + b * c + d],
        explanation: `Najpierw mnożenie: ${b} · ${c} = ${b * c}. Potem ${a} + ${b * c} - ${d} = ${a + b * c - d}.`,
      });
    }),
    tpl("wymierne-roznica-ujemnych", 1, (rng) => {
      const x = int(rng, 1, 12) * (rng() < 0.5 ? -1 : 1);
      const y = -int(rng, 1, 12);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${x} - (${y})`,
        correct: x - y,
        wrongs: [x + y, -(x + y), y - x],
        explanation: `Odjęcie liczby ujemnej to dodanie liczby przeciwnej: ${x} - (${y}) = ${x} + ${-y} = ${x - y}.`,
      });
    }),
    tpl("wymierne-iloczyn", 2, (rng) => {
      const a = int(rng, 2, 6);
      const b = int(rng, 2, 6);
      const c = int(rng, 2, 6);
      const d = int(rng, 2, 6);
      return numericQuestion(rng, {
        prompt: `Oblicz: (-${a}) · (-${b}) + ${c} · (-${d})`,
        correct: a * b - c * d,
        wrongs: [-(a * b) - c * d, a * b + c * d, -(a * b) + c * d],
        explanation: `(-${a}) · (-${b}) = ${a * b} (minus razy minus daje plus), ${c} · (-${d}) = ${-c * d}. Razem: ${a * b - c * d}.`,
      });
    }),
    tpl("wymierne-modul", 2, (rng) => {
      const a = int(rng, 2, 15);
      const b = int(rng, 1, 8);
      const c = b + int(rng, 1, 8);
      return numericQuestion(rng, {
        prompt: `Oblicz: |-${a}| - |${b} - ${c}|`,
        correct: a - (c - b),
        wrongs: [a + (c - b), a - (b - c), -a - (c - b)],
        explanation: `|-${a}| = ${a}, |${b} - ${c}| = |${b - c}| = ${c - b}. Wynik: ${a} - ${c - b} = ${a - (c - b)}.`,
      });
    }),
    tpl("wymierne-dziesietne", 2, (rng) => {
      const y = pick(rng, [0.2, 0.5, 0.4, 0.25, 0.3]);
      const k = int(rng, 3, 15);
      const x = Math.round(y * k * 100) / 100;
      return numericQuestion(rng, {
        prompt: `Oblicz: ${num(x)} : ${num(y)}`,
        correct: k,
        wrongs: [k * 10, k / 10, k * 100],
        explanation: `Mnożymy obie liczby przez 100 (lub 10), by pozbyć się przecinków: ${num(x * 100)} : ${num(y * 100)} = ${k}.`,
      });
    }),
  ],
};

const katy: SprawdzianTopic = {
  id: "katy-trojkaty",
  label: "Kąty i trójkąty",
  description:
    "Suma kątów w trójkącie i wielokącie, kąty przyległe, kąt zewnętrzny.",
  classes: [7],
  templates: [
    tpl("katy-trzeci", 1, (rng) => {
      const a = int(rng, 30, 80);
      const b = int(rng, 30, 70);
      const deg = (n: number) => `${n}°`;
      return numericQuestion(rng, {
        prompt: `W trójkącie dwa kąty mają miary ${a}° i ${b}°. Jaką miarę ma trzeci kąt?`,
        correct: 180 - a - b,
        wrongs: [180 - a, a + b, 360 - a - b],
        format: deg,
        deltas: [5, -5, 10, -10],
        explanation: `Suma kątów w trójkącie to 180°, więc trzeci kąt: 180° - ${a}° - ${b}° = ${180 - a - b}°.`,
      });
    }),
    tpl("katy-przylegle", 1, (rng) => {
      const a = pick(rng, [20, 35, 40, 55, 65, 70, 110, 125, 140, 155]);
      return numericQuestion(rng, {
        prompt: `Kąt α ma miarę ${a}°. Jaką miarę ma kąt przyległy do kąta α?`,
        correct: 180 - a,
        wrongs: [a, 360 - a, 180 + a],
        format: (n) => `${n}°`,
        deltas: [10, -10, 20, -20],
        explanation: `Kąty przyległe dają razem 180°, więc 180° - ${a}° = ${180 - a}°.`,
      });
    }),
    tpl("katy-rownoramienny", 2, (rng) => {
      const w = 2 * int(rng, 10, 50);
      return numericQuestion(rng, {
        prompt: `W trójkącie równoramiennym kąt między ramionami ma miarę ${w}°. Jaką miarę ma kąt przy podstawie?`,
        correct: (180 - w) / 2,
        wrongs: [180 - w, w / 2, 90 - w],
        format: (n) => `${n}°`,
        deltas: [5, -5, 10, -10],
        explanation: `Kąty przy podstawie są równe. Razem mają 180° - ${w}° = ${180 - w}°, więc każdy ma ${(180 - w) / 2}°.`,
      });
    }),
    tpl("katy-wielokat", 2, (rng) => {
      const n = int(rng, 5, 9);
      return numericQuestion(rng, {
        prompt: `Ile wynosi suma kątów wewnętrznych wielokąta wypukłego o ${n} bokach?`,
        correct: (n - 2) * 180,
        wrongs: [n * 180, (n - 1) * 180, (n - 3) * 180],
        format: (n2) => `${n2}°`,
        deltas: [180, -180],
        explanation: `Wielokąt o n bokach dzieli się na n - 2 trójkątów: (${n} - 2) · 180° = ${(n - 2) * 180}°.`,
      });
    }),
    tpl("katy-zewnetrzny", 3, (rng) => {
      const a = int(rng, 30, 80);
      const b = int(rng, 30, 70);
      return numericQuestion(rng, {
        prompt: `Dwa kąty wewnętrzne trójkąta mają miary ${a}° i ${b}°. Jaką miarę ma kąt zewnętrzny trójkąta przy trzecim wierzchołku?`,
        correct: a + b,
        wrongs: [180 - a - b, 180 - a, 360 - a - b],
        format: (n) => `${n}°`,
        deltas: [5, -5, 10, -10],
        explanation: `Trzeci kąt wewnętrzny: 180° - ${a}° - ${b}° = ${180 - a - b}°. Kąt zewnętrzny jest do niego przyległy: 180° - ${180 - a - b}° = ${a + b}° (to suma dwóch pozostałych kątów).`,
      });
    }),
  ],
};

const wspolrzedne: SprawdzianTopic = {
  id: "uklad-wspolrzednych",
  label: "Układ współrzędnych",
  description:
    "Ćwiartki, symetria względem osi, odległości i pola figur w układzie.",
  classes: [7],
  templates: [
    tpl("wspolrzedne-cwiartka", 1, (rng) => {
      const x = int(rng, 1, 8) * (rng() < 0.5 ? -1 : 1);
      const y = int(rng, 1, 8) * (rng() < 0.5 ? -1 : 1);
      const names = [
        "I ćwiartka",
        "II ćwiartka",
        "III ćwiartka",
        "IV ćwiartka",
      ];
      const idx = x > 0 ? (y > 0 ? 0 : 3) : y > 0 ? 1 : 2;
      return textQuestion(rng, {
        prompt: `Punkt A = (${x}, ${y}) leży w:`,
        correct: names[idx],
        wrongs: names.filter((_, i) => i !== idx),
        explanation: `Pierwsza współrzędna jest ${x > 0 ? "dodatnia" : "ujemna"}, a druga ${y > 0 ? "dodatnia" : "ujemna"}, więc punkt leży w ćwiartce: ${names[idx]}.`,
      });
    }),
    tpl("wspolrzedne-symetria", 2, (rng) => {
      let x = int(rng, 1, 8) * (rng() < 0.5 ? -1 : 1);
      const y = int(rng, 1, 8) * (rng() < 0.5 ? -1 : 1);
      if (Math.abs(x) === Math.abs(y)) x = x > 0 ? x + 1 : x - 1;
      return textQuestion(rng, {
        prompt: `Punkt A = (${x}, ${y}). Jakie współrzędne ma punkt symetryczny do A względem osi OX?`,
        correct: `(${x}, ${-y})`,
        wrongs: [`(${-x}, ${y})`, `(${-x}, ${-y})`, `(${y}, ${x})`],
        explanation: `Symetria względem osi OX zmienia znak drugiej współrzędnej: (${x}, ${-y}).`,
      });
    }),
    tpl("wspolrzedne-odleglosc", 2, (rng) => {
      const x1 = -int(rng, 1, 8);
      const x2 = int(rng, 1, 8);
      const y = int(rng, -6, 6);
      return numericQuestion(rng, {
        prompt: `Punkty A = (${x1}, ${y}) i B = (${x2}, ${y}) leżą w jednej linii poziomej. Ile wynosi odległość między nimi (w jednostkach osi)?`,
        correct: x2 - x1,
        wrongs: [Math.abs(x1 + x2), x2, Math.abs(x1)],
        explanation: `Odległość to różnica pierwszych współrzędnych: ${x2} - (${x1}) = ${x2 - x1}.`,
      });
    }),
    tpl("wspolrzedne-pole", 3, (rng) => {
      const x1 = -int(rng, 1, 5);
      const x2 = int(rng, 1, 6);
      const y1 = -int(rng, 1, 4);
      const y2 = int(rng, 1, 5);
      const w = x2 - x1;
      const h = y2 - y1;
      return numericQuestion(rng, {
        prompt: `Przeciwległe wierzchołki prostokąta o bokach równoległych do osi układu to A = (${x1}, ${y1}) i C = (${x2}, ${y2}). Oblicz pole prostokąta (w jednostkach kwadratowych).`,
        correct: w * h,
        wrongs: [x2 * y2, w + h, 2 * (w + h)],
        explanation: `Boki mają długości ${x2} - (${x1}) = ${w} oraz ${y2} - (${y1}) = ${h}. Pole: ${w} · ${h} = ${w * h}.`,
      });
    }),
  ],
};

const dzialaniaPodstawowe: SprawdzianTopic = {
  id: "dzialania-podstawowe",
  label: "Działania na liczbach",
  description: "Kolejność działań, mnożenie, dzielenie z resztą, zaokrąglanie.",
  classes: [4, 5, 6],
  templates: [
    tpl("dzialania-kolejnosc", 1, (rng) => {
      const a = int(rng, 10, 60);
      const b = int(rng, 2, 9);
      const c = int(rng, 2, 9);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${a} + ${b} · ${c}`,
        correct: a + b * c,
        wrongs: [(a + b) * c, a * b + c, a + b + c],
        explanation: `Mnożenie wykonujemy przed dodawaniem: ${b} · ${c} = ${b * c}, potem ${a} + ${b * c} = ${a + b * c}.`,
      });
    }),
    tpl("dzialania-nawiasy", 1, (rng) => {
      const a = int(rng, 10, 40);
      const b = int(rng, 2, 9);
      const c = int(rng, 2, 9);
      return numericQuestion(rng, {
        prompt: `Oblicz: (${a} - ${b}) · ${c}`,
        correct: (a - b) * c,
        wrongs: [a - b * c, a * c - b, (a + b) * c],
        explanation: `Najpierw nawias: ${a} - ${b} = ${a - b}, potem ${a - b} · ${c} = ${(a - b) * c}.`,
      });
    }),
    tpl("dzialania-reszta", 2, (rng) => {
      const d = int(rng, 3, 9);
      const q = int(rng, 4, 15);
      const r = int(rng, 1, d - 1);
      const n = d * q + r;
      return numericQuestion(rng, {
        prompt: `Jaka jest reszta z dzielenia ${n} przez ${d}?`,
        correct: r,
        wrongs: [q, d - r, r + d],
        deltas: [1, -1, 2, -2, 3],
        explanation: `${n} = ${d} · ${q} + ${r}, więc reszta wynosi ${r}.`,
      });
    }),
    tpl("dzialania-zaokraglanie", 2, (rng) => {
      const n = int(rng, 1200, 9800) + int(rng, 1, 9);
      const rounded = Math.round(n / 100) * 100;
      return numericQuestion(rng, {
        prompt: `Zaokrąglij liczbę ${spaced(n)} do setek.`,
        correct: rounded,
        wrongs: [
          Math.floor(n / 100) * 100,
          Math.round(n / 10) * 10,
          Math.ceil(n / 1000) * 1000,
        ],
        format: spaced,
        deltas: [100, -100, 200, -200, 1000],
        explanation: `Patrzymy na cyfrę dziesiątek: ${n} zaokrąglone do setek to ${spaced(rounded)}.`,
      });
    }),
    tpl("dzialania-pisemne", 3, (rng) => {
      const a = int(rng, 120, 480);
      const b = int(rng, 12, 48);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${a} · ${b}`,
        correct: a * b,
        wrongs: [a * b + 100, a * b - 100, a * (b - 10)],
        format: spaced,
        deltas: [10, -10, 20, -20, 1000],
        explanation: `${a} · ${b} = ${a} · ${b - (b % 10)} + ${a} · ${b % 10} = ${a * (b - (b % 10))} + ${a * (b % 10)} = ${a * b}.`,
      });
    }),
  ],
};

const ulamkiProste: SprawdzianTopic = {
  id: "ulamki-proste",
  label: "Ułamki zwykłe i dziesiętne",
  description: "Skracanie, dodawanie, ułamek z liczby, ułamki dziesiętne.",
  classes: [5, 6],
  templates: [
    tpl("ulamki-proste-dodawanie", 1, (rng) => {
      const d = int(rng, 5, 12);
      const a = int(rng, 1, d - 2);
      const b = int(rng, 1, d - 1 - a);
      return textQuestion(rng, {
        prompt: `Oblicz: ${a}/${d} + ${b}/${d}`,
        correct: frac(a + b, d),
        wrongs: [`${a + b}/${2 * d}`, frac(a * b, d), frac(a + b, d + d - 1)],
        fillers: [frac(a + b + 1, d), frac(a + b + 2, d)],
        explanation: `Mianowniki są takie same, więc dodajemy liczniki: (${a} + ${b})/${d} = ${a + b}/${d}${frac(a + b, d) !== `${a + b}/${d}` ? ` = ${frac(a + b, d)}` : ""}.`,
      });
    }),
    tpl("ulamki-proste-z-liczby", 2, (rng) => {
      const d = pick(rng, [3, 4, 5, 6, 8]);
      const n = int(rng, 1, d - 1);
      const k = int(rng, 2, 9);
      const total = d * k;
      return numericQuestion(rng, {
        prompt: `Oblicz ${n}/${d} liczby ${total}.`,
        correct: n * k,
        wrongs: [k, total - n * k, n * total],
        explanation: `Dzielimy ${total} przez ${d}: ${k}, a potem mnożymy przez ${n}: ${n * k}.`,
      });
    }),
    tpl("ulamki-proste-mieszana", 2, (rng) => {
      const d = int(rng, 3, 9);
      const w = int(rng, 1, 5);
      const n = int(rng, 1, d - 1);
      const top = w * d + n;
      return textQuestion(rng, {
        prompt: `Zamień ułamek niewłaściwy ${top}/${d} na liczbę mieszaną.`,
        correct: `${w} ${n}/${d}`,
        wrongs: [`${w + 1} ${n}/${d}`, `${w} ${d}/${n}`, `${n} ${w}/${d}`],
        fillers: [`${w - 1 || w + 2} ${n}/${d}`],
        explanation: `${top} : ${d} = ${w} reszty ${n}, więc ${top}/${d} = ${w} ${n}/${d}.`,
      });
    }),
    tpl("ulamki-proste-dziesietne", 2, (rng) => {
      const a = int(rng, 11, 99) / 10;
      const b = int(rng, 11, 99) / 10;
      return numericQuestion(rng, {
        prompt: `Oblicz: ${num(a)} + ${num(b)}`,
        correct: Math.round((a + b) * 10) / 10,
        wrongs: [
          Math.round((a + b) * 10) / 100,
          Math.round((a - b) * 10) / 10,
          Math.round((a + b) * 100) / 10,
        ],
        deltas: [0.1, -0.1, 1, -1],
        explanation: `Przecinek pod przecinkiem: ${num(a)} + ${num(b)} = ${num(Math.round((a + b) * 10) / 10)}.`,
      });
    }),
    tpl("ulamki-proste-mnozenie10", 1, (rng) => {
      const a = int(rng, 12, 99) / 10;
      const p = pick(rng, [10, 100]);
      return numericQuestion(rng, {
        prompt: `Oblicz: ${num(a)} · ${p}`,
        correct: a * p,
        wrongs: [a / p, a * p * 10, a + p],
        explanation: `Mnożenie przez ${p} przesuwa przecinek o ${p === 10 ? "jedno" : "dwa"} miejsce w prawo: ${num(a * p)}.`,
      });
    }),
  ],
};

const geometriaPodstawy: SprawdzianTopic = {
  id: "geometria-podstawy",
  label: "Obwody i pola",
  description: "Obwód i pole prostokąta, kwadratu i trójkąta.",
  classes: [4, 5, 6],
  templates: [
    tpl("geo-obwod-prostokata", 1, (rng) => {
      const a = int(rng, 3, 15);
      const b = a + int(rng, 1, 9);
      return numericQuestion(rng, {
        prompt: `Prostokąt ma boki ${a} cm i ${b} cm. Oblicz jego obwód.`,
        correct: 2 * (a + b),
        wrongs: [a * b, a + b, 2 * a * b],
        format: unit("cm"),
        explanation: `Obwód: 2 · (${a} + ${b}) = ${2 * (a + b)} cm.`,
      });
    }),
    tpl("geo-pole-prostokata", 1, (rng) => {
      const a = int(rng, 3, 15);
      const b = a + int(rng, 1, 9);
      return numericQuestion(rng, {
        prompt: `Prostokąt ma boki ${a} cm i ${b} cm. Oblicz jego pole.`,
        correct: a * b,
        wrongs: [2 * (a + b), a + b, 2 * a * b],
        format: unit("cm²"),
        explanation: `Pole: ${a} · ${b} = ${a * b} cm².`,
      });
    }),
    tpl("geo-kwadrat-z-obwodu", 2, (rng) => {
      const a = int(rng, 3, 14);
      return numericQuestion(rng, {
        prompt: `Obwód kwadratu wynosi ${4 * a} cm. Oblicz jego pole.`,
        correct: a * a,
        wrongs: [4 * a, 2 * a, 4 * a * a],
        format: unit("cm²"),
        explanation: `Bok: ${4 * a} : 4 = ${a} cm. Pole: ${a} · ${a} = ${a * a} cm².`,
      });
    }),
    tpl(
      "geo-pole-trojkata",
      2,
      (rng) => {
        const a = 2 * int(rng, 2, 10);
        const h = int(rng, 3, 12);
        return numericQuestion(rng, {
          prompt: `Trójkąt ma podstawę ${a} cm i wysokość ${h} cm. Oblicz jego pole.`,
          correct: (a * h) / 2,
          wrongs: [a * h, a + h, (a + h) / 2],
          format: unit("cm²"),
          explanation: `Pole trójkąta: (${a} · ${h}) : 2 = ${(a * h) / 2} cm².`,
        });
      },
      [5, 6],
    ),
    tpl("geo-brakujacy-bok", 3, (rng) => {
      const a = int(rng, 3, 12);
      const b = int(rng, 4, 15);
      return numericQuestion(rng, {
        prompt: `Pole prostokąta wynosi ${a * b} cm², a jeden bok ma ${a} cm. Ile wynosi obwód tego prostokąta?`,
        correct: 2 * (a + b),
        wrongs: [a * b, a + b, 2 * b],
        format: unit("cm"),
        explanation: `Drugi bok: ${a * b} : ${a} = ${b} cm. Obwód: 2 · (${a} + ${b}) = ${2 * (a + b)} cm.`,
      });
    }),
  ],
};

const miaryICzas: SprawdzianTopic = {
  id: "miary-i-czas",
  label: "Jednostki, czas i pieniądze",
  description: "Zamiana jednostek, obliczenia na czasie i zadania z cenami.",
  classes: [4, 5, 6],
  templates: [
    tpl("miary-km-m", 1, (rng) => {
      const km = int(rng, 2, 9);
      const m = int(rng, 1, 9) * 100;
      return numericQuestion(rng, {
        prompt: `Zamień ${km} km ${m} m na metry.`,
        correct: km * 1000 + m,
        wrongs: [km * 100 + m, km * 10000 + m, km + m],
        format: unit("m"),
        deltas: [100, -100, 1000, -1000],
        explanation: `${km} km = ${km * 1000} m, więc razem ${km * 1000 + m} m.`,
      });
    }),
    tpl("miary-czas", 2, (rng) => {
      const h = int(rng, 1, 5);
      const m = int(rng, 5, 55);
      const add = int(rng, 20, 110);
      const total = h * 60 + m + add;
      const fmt = (t: number) =>
        `${Math.floor(t / 60) % 24}:${String(t % 60).padStart(2, "0")}`;
      return textQuestion(rng, {
        prompt: `Film zaczął się o ${h}:${String(m).padStart(2, "0")} i trwał ${add} minut. O której się skończył?`,
        correct: fmt(total),
        wrongs: [fmt(total + 10), fmt(total - 10), fmt(h * 60 + m + add + 60)],
        fillers: [fmt(total + 20), fmt(total - 20)],
        explanation: `${h}:${String(m).padStart(2, "0")} + ${add} min = ${fmt(total)}.`,
      });
    }),
    tpl("miary-kg-g", 2, (rng) => {
      const kg = int(rng, 1, 9);
      const g = int(rng, 1, 9) * 50;
      return numericQuestion(rng, {
        prompt: `Ile gramów to ${kg} kg ${g} g?`,
        correct: kg * 1000 + g,
        wrongs: [kg * 100 + g, kg * 10000 + g, kg + g],
        format: unit("g"),
        deltas: [50, -50, 1000, -1000],
        explanation: `${kg} kg = ${kg * 1000} g, więc razem ${kg * 1000 + g} g.`,
      });
    }),
    tpl("miary-zakupy", 3, (rng) => {
      const price = int(rng, 3, 12);
      const n = int(rng, 3, 8);
      const pay = Math.ceil((price * n + 1) / 10) * 10;
      return numericQuestion(rng, {
        prompt: `Kupiono ${n} zeszytów po ${price} zł. Ile reszty otrzymasz, płacąc ${pay} zł?`,
        correct: pay - price * n,
        wrongs: [price * n, pay - price, pay + price * n],
        format: unit("zł"),
        explanation: `Koszt: ${n} · ${price} = ${price * n} zł. Reszta: ${pay} - ${price * n} = ${pay - price * n} zł.`,
      });
    }),
  ],
};

export const SPRAWDZIAN_TOPICS: readonly SprawdzianTopic[] = [
  dzialaniaPodstawowe,
  ulamkiProste,
  geometriaPodstawy,
  miaryICzas,
  liczbyWymierne,
  ulamki,
  procenty,
  rownania,
  algebra,
  potegi,
  katy,
  poleObwod,
  wspolrzedne,
  pitagoras,
  bryly,
  statystyka,
  tekstowe,
];
