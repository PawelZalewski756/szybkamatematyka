/**
 * Generator zadań dla nowych tematów egzaminu ósmoklasisty (drzewo CKE).
 *
 *   node scripts/generateCompleteE8Tasks.mjs
 *
 * Dla każdego tematu z listy zapisuje data/tasks-cache/8_klasa__<kategoria>__<temat>.json
 * z dokładnie 20 zadaniami. Wszystko jest deterministyczne: ziarno zależy od
 * tematu i numeru zadania, a poprawna odpowiedź jest zawsze wyliczana z parametrów.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT_DIR = path.resolve(process.cwd(), "data/tasks-cache");
const MODEL = "complete-e8-v1";

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

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

/** Wypisuje liczbę całkowitą intVal / 10^pow w zapisie dziesiętnym z przecinkiem. */
function decStr(intVal, pow) {
  const sign = intVal < 0 ? "-" : "";
  const digits = String(Math.abs(intVal)).padStart(pow + 1, "0");
  const whole = digits.slice(0, digits.length - pow);
  let frac = pow ? digits.slice(digits.length - pow) : "";
  frac = frac.replace(/0+$/, "");
  return sign + whole + (frac ? `,${frac}` : "");
}

function numStr(value) {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded).replace(".", ",");
}

function lin(m, c) {
  const coef = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (c === 0) return coef;
  return `${coef} ${c > 0 ? "+" : "-"} ${Math.abs(c)}`;
}

function xy(m, n) {
  const first = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  const absN = Math.abs(n);
  const second = absN === 1 ? "y" : `${absN}y`;
  return `${first} ${n >= 0 ? "+" : "-"} ${second}`;
}

function poly2(a, b, c) {
  let out = a === 1 ? "x^2" : a === -1 ? "-x^2" : `${a}x^2`;
  if (b !== 0) {
    const abs = Math.abs(b);
    const coef = abs === 1 ? "x" : `${abs}x`;
    out += ` ${b > 0 ? "+" : "-"} ${coef}`;
  }
  if (c !== 0) out += ` ${c > 0 ? "+" : "-"} ${Math.abs(c)}`;
  return out;
}

function options(rng, correct, wrongs) {
  const list = [String(correct)];
  for (const candidate of wrongs) {
    const text = String(candidate);
    if (!list.includes(text)) list.push(text);
  }
  let step = 1;
  while (list.length < 4) {
    const base = String(correct);
    const match = /^(-?\d+(?:,\d+)?)(\s*[^\d].*)?$/.exec(base);
    if (!match) {
      throw new Error(
        `Za mało dystraktorów dla odpowiedzi "${base}": ${JSON.stringify(wrongs)}`,
      );
    }
    const numeric = Number(match[1].replace(",", "."));
    const suffix = match[2] ?? "";
    const candidate = `${numStr(numeric + step)}${suffix}`;
    if (!list.includes(candidate)) list.push(candidate);
    step += 1;
    if (step > 60) throw new Error(`Nie udało się dobrać opcji dla "${base}"`);
  }
  return shuffle(rng, list.slice(0, 4));
}

const DAYS = [
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
  "niedziela",
];

const SOLID_EDGES = {
  sześcian: 12,
  prostopadłościan: 12,
  "graniastosłup trójkątny": 9,
  "graniastosłup czworokątny": 12,
  "ostrosłup czworokątny": 8,
  "ostrosłup trójkątny": 6,
};

const TOPICS = [
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "liczby_naturalne",
    categoryName: "Liczby i działania",
    topicName: "Liczby naturalne i zapis dziesiątkowy",
    gens: [
      (rng) => {
        const n =
          1000 * int(rng, 2, 9) +
          100 * int(rng, 0, 9) +
          10 * int(rng, 1, 9) +
          int(rng, 0, 9);
        const h = Math.floor(n / 100) % 10;
        return {
          content: `W liczbie $${n}$ cyfra w rzędzie setek to:`,
          correct: String(h),
          wrongs: [String((h + 1) % 10), String((h + 2) % 10), String((h + 3) % 10)],
          explanation: `Cyfrę setek odczytujemy jako trzecią cyfrę od prawej. W liczbie $${n}$ jest nią $${h}$.`,
        };
      },
      (rng) => {
        const digits = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
        const [b, c, d] = digits;
        const a = int(rng, 2, 9);
        const n = a * 1000 + b * 100 + c * 10 + d;
        return {
          content: `Liczba $${n}$ zapisana w postaci sumy składników to:`,
          correct: `${a * 1000} + ${b * 100} + ${c * 10} + ${d}`,
          wrongs: [
            `${a * 1000} + ${b * 10} + ${c * 100} + ${d}`,
            `${a * 100} + ${b * 1000} + ${c * 10} + ${d}`,
            `${a * 1000} + ${b * 100} + ${c} + ${d * 10}`,
          ],
          explanation: `Cyfra tysięcy to $${a}$, setek - $${b}$, dziesiątek - $${c}$, jedności - $${d}$. Dlatego $${n} = ${a * 1000} + ${b * 100} + ${c * 10} + ${d}$.`,
        };
      },
      (rng) => {
        const digits = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
        const desc = [...digits].sort((x, y) => y - x);
        const asc = [...digits].sort((x, y) => x - y);
        const swappedA = [desc[1], desc[0], desc[2], desc[3]].join("");
        const swappedB = [desc[0], desc[2], desc[1], desc[3]].join("");
        return {
          content: `Największa liczba czterocyfrowa, którą można zapisać za pomocą cyfr $${digits.join(", ")}$ (każdej dokładnie raz), to:`,
          correct: desc.join(""),
          wrongs: [asc.join(""), swappedA, swappedB],
          explanation: `Aby liczba była największa, na początku stawiamy największą cyfrę, potem kolejne coraz mniejsze. Daje to $${desc.join("")}$.`,
        };
      },
      (rng) => {
        const base = int(rng, 12, 92);
        const r = int(rng, 12, 88);
        const n = base * 100 + r;
        const up = r >= 50;
        const correct = up ? (base + 1) * 100 : base * 100;
        return {
          content: `Zaokrąglij liczbę $${n}$ do pełnych setek.`,
          correct: String(correct),
          wrongs: [String(n), String(correct - 100), String(correct + 100)],
          explanation: `Cyfra dziesiątek to $${Math.floor(r / 10)}$, więc zaokrąglamy ${up ? "w górę" : "w dół"}. Wynik to $${correct}$.`,
        };
      },
      (rng) => {
        const b = int(rng, 1200, 4800);
        const a = b + int(rng, 150, 2900);
        const diff = a - b;
        return {
          content: `O ile większa jest liczba $${a}$ od liczby $${b}$?`,
          correct: String(diff),
          wrongs: [String(diff + 10), String(diff - 10), String(diff + 100)],
          explanation: `Odejmujemy mniejszą liczbę od większej: $${a} - ${b} = ${diff}$.`,
        };
      },
      (rng) => {
        const n = int(rng, 1200, 9800);
        const sum = String(n)
          .split("")
          .reduce((acc, ch) => acc + Number(ch), 0);
        return {
          content: `Suma cyfr liczby $${n}$ wynosi:`,
          correct: String(sum),
          wrongs: [String(sum + 1), String(sum - 1), String(sum + 2)],
          explanation: `Dodajemy wszystkie cyfry liczby: $${String(n).split("").join(" + ")} = ${sum}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "dzialania_pisemne",
    categoryName: "Liczby i działania",
    topicName: "Działania pisemne",
    gens: [
      (rng) => {
        const a = int(rng, 123, 897);
        const b = int(rng, 118, 879);
        const sum = a + b;
        return {
          content: `Oblicz: $${a} + ${b} =$`,
          correct: String(sum),
          wrongs: [String(sum - 10), String(sum + 10), String(sum - 100)],
          explanation: `Dodajemy pisemnie: jedności do jedności, dziesiątki do dziesiątek, setki do setek, pamiętając o przeniesieniu. $${a} + ${b} = ${sum}$.`,
        };
      },
      (rng) => {
        const b = int(rng, 118, 489);
        const a = b + int(rng, 130, 460);
        const diff = a - b;
        return {
          content: `Oblicz: $${a} - ${b} =$`,
          correct: String(diff),
          wrongs: [String(diff + 10), String(diff - 10), String(diff + 100)],
          explanation: `Odejmujemy pisemnie, pożyczając jedną dziesiątkę lub setkę, gdy trzeba. $${a} - ${b} = ${diff}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 12, 98);
        const b = int(rng, 3, 9);
        const product = a * b;
        return {
          content: `Oblicz: $${a} \\cdot ${b} =$`,
          correct: String(product),
          wrongs: [String(product + b), String(product - b), String(product + 10)],
          explanation: `Mnożymy osobno dziesiątki i jedności: $${a} \\cdot ${b} = (${Math.floor(a / 10)} \\cdot 10 + ${a % 10}) \\cdot ${b} = ${product}$.`,
        };
      },
      (rng) => {
        const b = int(rng, 7, 12);
        const q = int(rng, 12, 40);
        const r = int(rng, 1, b - 1);
        const a = b * q + r;
        return {
          content: `Ile wynosi reszta z dzielenia $${a}$ przez $${b}$?`,
          correct: String(r),
          wrongs: [String(r + 1), String(b - r), String(q)],
          explanation: `$${a} = ${b} \\cdot ${q} + ${r}$, a reszta $${r}$ jest mniejsza od dzielnika $${b}$.`,
        };
      },
      (rng) => {
        const b = int(rng, 6, 11);
        const q = int(rng, 11, 45);
        const a = b * q;
        return {
          content: `Ile wynosi iloraz $${a} : ${b}$?`,
          correct: String(q),
          wrongs: [String(q + 1), String(q - 1), String(q + 10)],
          explanation: `Dzielimy pisemnie: $${b}$$ mieści się w $${a}$ dokładnie $${q}$ razy, bez reszty.`,
        };
      },
      (rng) => {
        const a = int(rng, 13, 49);
        const b = int(rng, 11, 29);
        const product = a * b;
        return {
          content: `Oblicz: $${a} \\cdot ${b} =$`,
          correct: String(product),
          wrongs: [String(product + 10), String(product - a), String(product + a)],
          explanation: `Rozbijamy drugi czynnik: $${a} \\cdot ${b} = ${a} \\cdot ${Math.floor(b / 10) * 10} + ${a} \\cdot ${b % 10} = ${product}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "nwd_i_nww",
    categoryName: "Liczby i działania",
    topicName: "NWD i NWW",
    gens: [
      (rng) => {
        const g = pick(rng, [2, 3, 4, 5, 6]);
        const [p, q] = pick(rng, [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [4, 5],
          [5, 6],
          [4, 7],
          [5, 7],
        ]);
        const a = g * p;
        const b = g * q;
        return {
          content: `Oblicz największy wspólny dzielnik liczb $${a}$ i $${b}$.`,
          correct: String(g),
          wrongs: [String(g + 1), String(g + 2), String(Math.min(a, b))],
          explanation: `$${a} = ${g} \\cdot ${p}$ i $${b} = ${g} \\cdot ${q}$, a liczby $${p}$ i $${q}$ są względnie pierwsze. Wspólny czynnik to $${g}$, więc $\\operatorname{NWD}(${a}, ${b}) = ${g}$.`,
        };
      },
      (rng) => {
        const g = pick(rng, [2, 3, 4, 5, 6]);
        const [p, q] = pick(rng, [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [5, 6],
          [4, 7],
        ]);
        const L = lcm(g * p, g * q);
        return {
          content: `Oblicz najmniejszą wspólną wielokrotność liczb $${g * p}$ i $${g * q}$.`,
          correct: String(L),
          wrongs: [String((g * p * (g * q)) / 1), String(L + g), String(L - g)],
          explanation: `Rozkładamy liczby na czynniki: $${g * p} = ${g} \\cdot ${p}$, $${g * q} = ${g} \\cdot ${q}$. NWW to iloczyn wszystkich czynników z największymi wykładnikami: $${g} \\cdot ${p} \\cdot ${q} = ${L}$.`,
        };
      },
      (rng) => {
        const g = pick(rng, [3, 4, 5, 6]);
        const [p, q] = pick(rng, [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [4, 5],
          [5, 7],
        ]);
        const a = g * p;
        const b = g * q;
        const L = g * p * q;
        return {
          content: `Autobus jednej linii odjeżdża co $${a}$ minut, a drugi co $${b}$ minut. Oba odjechały jednocześnie o 8:00. Po ilu minutach znów odjadą jednocześnie?`,
          correct: String(L),
          wrongs: [String(a + b), String(L + g), String(L - g)],
          explanation: `Czas do wspólnego odjazdu to NWW liczb $${a}$ i $${b}$. $${a} = ${g} \\cdot ${p}$, $${b} = ${g} \\cdot ${q}$, więc NWW $= ${g} \\cdot ${p} \\cdot ${q} = ${L}$ minut.`,
        };
      },
      (rng) => {
        const g = pick(rng, [4, 5, 6, 7]);
        const [p, q] = pick(rng, [
          [2, 3],
          [3, 4],
          [2, 5],
          [5, 6],
          [4, 7],
        ]);
        const a = g * p;
        const b = g * q;
        return {
          content: `Kwiaciarka ma $${a}$ róż i $${b}$ tulipanów. Chce przygotować jak najwięcej jednakowych bukietów i wykorzystać wszystkie kwiaty. Ile bukietów powstanie?`,
          correct: String(g),
          wrongs: [String(g * p * q), String(g + 1), String(p * q)],
          explanation: `Liczba bukietów musi dzielić i $${a}$, i $${b}$, więc szukamy NWD. $\\operatorname{NWD}(${a}, ${b}) = ${g}$, czyli powstaną $${g}$$ bukiety.`,
        };
      },
      (rng) => {
        const g = pick(rng, [2, 3, 4, 5, 6]);
        const [p, q] = pick(rng, [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [5, 7],
        ]);
        const a = g * p;
        const b = g * q;
        return {
          content: `Prostokąt o bokach $${a}$ cm i $${b}$ cm chcemy wyłożyć jednakowymi kwadratowymi płytkami o największym możliwym boku. Jaki jest bok płytki?`,
          correct: `${g} cm`,
          wrongs: [`${g * p * q} cm`, `${g + 1} cm`, `${p * q} cm`],
          explanation: `Bok płytki musi dzielić oba wymiary, więc szukamy NWD. $\\operatorname{NWD}(${a}, ${b}) = ${g}$, zatem bok płytki ma $${g}$ cm.`,
        };
      },
      (rng) => {
        const g = pick(rng, [2, 3, 4]);
        const [p, q, r] = pick(rng, [
          [2, 3, 5],
          [2, 3, 7],
          [3, 4, 5],
          [2, 5, 7],
        ]);
        const a = g * p;
        const b = g * q;
        const c = g * r;
        const L = g * p * q * r;
        return {
          content: `Oblicz najmniejszą wspólną wielokrotność liczb $${a}$, $${b}$ i $${c}$.`,
          correct: String(L),
          wrongs: [String(a * b * c), String(L + g), String(L - g)],
          explanation: `Rozkłady to $${a} = ${g} \\cdot ${p}$, $${b} = ${g} \\cdot ${q}$, $${c} = ${g} \\cdot ${r}$. NWW $= ${g} \\cdot ${p} \\cdot ${q} \\cdot ${r} = ${L}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "zaokraglanie_i_szacowanie",
    categoryName: "Liczby i działania",
    topicName: "Zaokrąglanie i szacowanie",
    gens: [
      (rng) => {
        const k = int(rng, 2, 58);
        const t = pick(rng, [1, 2, 3, 4, 6, 7, 8, 9]);
        const rounded = t >= 5 ? k + 1 : k;
        return {
          content: `Zaokrąglij liczbę $${decStr(k * 10 + t, 1)}$ do liczby całkowitej.`,
          correct: String(rounded),
          wrongs: [String(rounded + 1), String(rounded - 1), String(k)],
          explanation: `Cyfra po przecinku to $${t}$, więc ${t >= 5 ? "zaokrąglamy w górę" : "zaokrąglamy w dół"}. Wynik: $${rounded}$.`,
        };
      },
      (rng) => {
        const k = int(rng, 1, 48);
        const t = int(rng, 1, 9);
        const h = pick(rng, [1, 2, 3, 4, 6, 7, 8, 9]);
        const tenths = Math.round((k * 100 + t * 10 + h) / 10) * 10;
        return {
          content: `Zaokrąglij liczbę $${decStr(k * 100 + t * 10 + h, 2)}$ do jednego miejsca po przecinku.`,
          correct: decStr(tenths, 2),
          wrongs: [
            decStr(Math.floor((k * 100 + t * 10 + h) / 10) * 10, 2),
            decStr(k * 100, 2),
            decStr(tenths + 10, 2),
          ],
          explanation: `Patrzymy na cyfrę setnych, czyli $${h}$. Stąd zaokrąglenie do dziesiątych to $${decStr(tenths, 2)}$.`,
        };
      },
      (rng) => {
        const tens = int(rng, 11, 92);
        const u = pick(rng, [1, 2, 3, 4, 6, 7, 8, 9]);
        const n = tens * 10 + u;
        const rounded = u >= 5 ? (tens + 1) * 10 : tens * 10;
        return {
          content: `Zaokrąglij liczbę $${n}$ do pełnych dziesiątek.`,
          correct: String(rounded),
          wrongs: [String(n), String(tens * 10), String(rounded + 10)],
          explanation: `Cyfra jedności to $${u}$, więc zaokrąglamy ${u >= 5 ? "w górę" : "w dół"}. Wynik to $${rounded}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 8);
        const b = int(rng, 2, 8);
        const c = int(rng, 2, 8);
        const n1 = a * 100 - 2;
        const n2 = b * 100 + 3;
        const n3 = c * 100 - 3;
        const approx = (a + b + c) * 100;
        return {
          content: `Oszacuj sumę $${n1} + ${n2} + ${n3}$, zaokrąglając każdy składnik do pełnych setek.`,
          correct: String(approx),
          wrongs: [String(n1 + n2 + n3), String(approx - 100), String(approx + 100)],
          explanation: `Po zaokrągleniu mamy $${a * 100} + ${b * 100} + ${c * 100} = ${approx}$. Dokładna suma to $${n1 + n2 + n3}$, więc oszacowanie jest bliskie.`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 8);
        const b = int(rng, 2, 8);
        const x = a * 10 - 1;
        const y = b * 10 + 1;
        const approx = a * b * 100;
        return {
          content: `Oszacuj iloczyn $${x} \\cdot ${y}$, zaokrąglając oba czynniki do pełnych dziesiątek.`,
          correct: String(approx),
          wrongs: [String(x * y), String(approx - 100), String(approx + 100)],
          explanation: `$${x} \\approx ${a * 10}$ i $${y} \\approx ${b * 10}$, więc $${x} \\cdot ${y} \\approx ${a * 10} \\cdot ${b * 10} = ${approx}$.`,
        };
      },
      (rng) => {
        const base = int(rng, 20, 90) * 10;
        const n = base + 3;
        return {
          content: `Która z liczb po zaokrągleniu do pełnych dziesiątek daje $${base}$?`,
          correct: String(n),
          wrongs: [String(base - 6), String(base + 7), String(base - 9)],
          explanation: `Do $${base}$ zaokrąglają się liczby od $${base - 5}$ do $${base + 4}$. Tylko $${n}$ należy do tego przedziału.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "ulamki_dziesietne",
    categoryName: "Liczby i działania",
    topicName: "Ułamki dziesiętne",
    gens: [
      (rng) => {
        const a = int(rng, 12, 89);
        const b = int(rng, 105, 899);
        const suma = a * 10 + b;
        return {
          content: `Oblicz: $${decStr(a, 1)} + ${decStr(b, 2)}$`,
          correct: decStr(suma, 2),
          wrongs: [
            decStr(suma + 10, 2),
            decStr(suma - 10, 2),
            decStr(suma + 100, 2),
          ],
          explanation: `Dopisujemy zero, aby obie liczby miały tyle samo miejsc po przecinku: $${decStr(a * 10, 2)} + ${decStr(b, 2)} = ${decStr(suma, 2)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 30, 98);
        const b = int(rng, 105, a * 10 - 50);
        const roznica = a * 10 - b;
        return {
          content: `Oblicz: $${decStr(a, 1)} - ${decStr(b, 2)}$`,
          correct: decStr(roznica, 2),
          wrongs: [
            decStr(roznica + 10, 2),
            decStr(roznica - 10, 2),
            decStr(roznica + 100, 2),
          ],
          explanation: `Ustawiamy przecinki w jednej kolumnie: $${decStr(a * 10, 2)} - ${decStr(b, 2)} = ${decStr(roznica, 2)}$.`,
        };
      },
      (rng) => {
        const v = int(rng, 12, 98);
        const factor = pick(rng, [100, 1000]);
        return {
          content: `Oblicz: $${decStr(v, 1)} \\cdot ${factor}$`,
          correct: decStr(v * factor, 1),
          wrongs: [
            decStr(v, 1),
            decStr(v * factor, 2),
            decStr(v * factor * 10, 1),
          ],
          explanation: `Mnożenie przez $${factor}$ przesuwa przecinek o $${String(factor).length - 1}$ miejsca w prawo. Wynik: $${decStr(v * factor, 1)}$.`,
        };
      },
      (rng) => {
        const value = int(rng, 120, 980);
        const divisor = pick(rng, [10, 100, 1000]);
        const pow = String(divisor).length - 1;
        return {
          content: `Oblicz: $${value} : ${divisor}$`,
          correct: decStr(value, pow),
          wrongs: [
            decStr(value * divisor, 0),
            decStr(value, pow + 1),
            decStr(value, Math.max(0, pow - 1)),
          ],
          explanation: `Dzielenie przez $${divisor}$ przesuwa przecinek o $${pow}$ ${pow === 1 ? "miejsce" : "miejsca"} w lewo. Wynik: $${decStr(value, pow)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 11, 49);
        const b = int(rng, 2, 9);
        const product = a * b;
        return {
          content: `Oblicz: $${decStr(a, 1)} \\cdot ${decStr(b, 1)}$`,
          correct: decStr(product, 2),
          wrongs: [
            decStr(product, 1),
            decStr(product, 0),
            decStr(product, 3),
          ],
          explanation: `Mnożymy jak liczby naturalne: $${a} \\cdot ${b} = ${product}$, a następnie wstawiamy przecinek dwa miejsca od prawej. Wynik: $${decStr(product, 2)}$.`,
        };
      },
      (rng) => {

        const fractions = [
          [1, 2, "0,5", ["0,05", "5", "1,5"]],
          [1, 4, "0,25", ["0,52", "2,5", "0,5"]],
          [3, 4, "0,75", ["0,57", "7,5", "0,7"]],
          [1, 5, "0,2", ["0,02", "2", "0,5"]],
          [3, 5, "0,6", ["0,06", "6", "0,3"]],
          [1, 8, "0,125", ["0,152", "1,25", "0,25"]],
          [3, 8, "0,375", ["0,357", "3,75", "0,125"]],
          [7, 20, "0,35", ["0,53", "3,5", "0,7"]],
          [9, 25, "0,36", ["0,63", "3,6", "0,9"]],
          [1, 20, "0,05", ["0,5", "0,005", "5"]],
        ];
        const [num, den, decimal, wrongs] = pick(rng, fractions);
        return {
          content: `Zapisz ułamek $\\dfrac{${num}}{${den}}$ w postaci dziesiętnej.`,
          correct: decimal,
          wrongs,
          explanation: `Rozszerzamy ułamek do mianownika $10$, $100$ lub $1000$: $\\dfrac{${num}}{${den}} = ${decimal}$.`,
        };
      },
      (rng) => {
        const pool = shuffle(rng, [601, 610, 619, 691, 709, 719, 790, 799, 700]);
        const values = pool.slice(0, 4);
        const max = Math.max(...values);
        return {
          content: `Która z tych liczb jest największa: $${values.map((v) => decStr(v, 3)).join("$, $")}$?`,
          correct: decStr(max, 3),
          wrongs: values.filter((v) => v !== max).map((v) => decStr(v, 3)),
          explanation: `Porównujemy liczby, uzupełniając miejsca po przecinku zerami. Największa to $${decStr(max, 3)}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "skala",
    categoryName: "Obliczenia praktyczne",
    topicName: "Skala i plan",
    gens: [
      (rng) => {
        const k = pick(rng, [100, 200, 500, 1000, 2000, 5000]);
        const l = int(rng, 2, 9);
        const meters = (l * k) / 100;
        return {
          content: `Na planie w skali $1:${k}$ odcinek ma $${l}$ cm. Ile metrów ma ten odcinek w rzeczywistości?`,
          correct: `${meters} m`,
          wrongs: [`${meters * 10} m`, `${numStr(meters / 10)} m`, `${l * k} m`],
          explanation: `$${l}$ cm $\\cdot ${k} = ${l * k}$ cm $= ${meters}$ m, bo $1$ m $= 100$ cm.`,
        };
      },
      (rng) => {
        const k = pick(rng, [500, 1000, 2000, 5000]);
        const unit = k / 100;
        const t = int(rng, 2, 9);
        const meters = unit * t;
        return {
          content: `Odcinek w terenie ma $${meters}$ m. Jaką długość ma na planie w skali $1:${k}$?`,
          correct: `${t} cm`,
          wrongs: [`${t + 1} cm`, `${t + 2} cm`, `${meters} cm`],
          explanation: `$${meters}$ m $= ${meters * 100}$ cm, a $${meters * 100} : ${k} = ${t}$ cm.`,
        };
      },
      (rng) => {
        const map = int(rng, 2, 8);
        const k = pick(rng, [100, 200, 500, 1000, 2000]);
        const real = (map * k) / 100;
        return {
          content: `Odcinek o długości $${real}$ m w terenie ma na planie $${map}$ cm. Jaka jest skala tego planu?`,
          correct: `1:${k}`,
          wrongs: [
            `1:${k * 10}`,
            `1:${k / 2}`,
            `1:${real * 100}`,
          ],
          explanation: `$${real}$ m $= ${real * 100}$ cm. Skala to $${real * 100} : ${map} = ${k}$, czyli $1:${k}$.`,
        };
      },
      (rng) => {
        const k = 1000;
        const a = int(rng, 2, 8);
        const b = int(rng, 2, 8);
        return {
          content: `Prostokąt na planie w skali $1:${k}$ ma boki $${a}$ cm i $${b}$ cm. Jakie jest jego pole w rzeczywistości (w m$^2$)?`,
          correct: `${a * b * 100} m²`,
          wrongs: [`${a * b * 10} m²`, `${a * b * 1000} m²`, `${a * b} m²`],
          explanation: `$1$ cm na planie to $10$ m w terenie. Boki mają $${a * 10}$ m i $${b * 10}$ m, więc pole $= ${a * 10} \\cdot ${b * 10} = ${a * b * 100}$ m$^2$.`,
        };
      },
      (rng) => {
        const k = pick(rng, [100000, 200000, 500000, 1000000]);
        const l = int(rng, 2, 8);
        const km = (l * k) / 100000;
        return {
          content: `Na mapie w skali $1:${k}$ odległość między miastami wynosi $${l}$ cm. Ile to kilometrów?`,
          correct: `${km} km`,
          wrongs: [`${km * 10} km`, `${numStr(km / 10)} km`, `${l * k} km`],
          explanation: `$1$ cm na mapie odpowiada $${k / 100000}$ km. Zatem $${l} \\cdot ${k / 100000} = ${km}$ km.`,
        };
      },
      (rng) => {
        const k = pick(rng, [100, 200, 500, 1000]);
        const m = k / 100;
        return {
          content: `Ile metrów w terenie odpowiada $1$ cm na planie w skali $1:${k}$?`,
          correct: `${m} m`,
          wrongs: [`${m * 10} m`, `${numStr(m / 10)} m`, `${k} m`],
          explanation: `$${k}$ cm $= ${m}$ m, bo $100$ cm to $1$ m.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "zegar_i_kalendarz",
    categoryName: "Obliczenia praktyczne",
    topicName: "Zegar i kalendarz",
    gens: [
      (rng) => {
        const total = int(rng, 70, 300);
        const startMinutes = int(rng, 6, 15) * 60 + int(rng, 0, 11) * 5;
        const endMinutes = startMinutes + total;
        const pad = (v) => String(v).padStart(2, "0");
        const start = `${pad(Math.floor(startMinutes / 60))}:${pad(startMinutes % 60)}`;
        const end = `${pad(Math.floor(endMinutes / 60) % 24)}:${pad(endMinutes % 60)}`;
        const h = Math.floor(total / 60);
        const m = total % 60;
        const label = (t) => {
          const hh = Math.floor(t / 60);
          const mm = t % 60;
          return `${hh} godz.${mm ? ` ${mm} min` : ""}`;
        };
        return {
          content: `Ile czasu mija od godziny $${start}$ do godziny $${end}$?`,
          correct: label(total),
          wrongs: [label(total + 10), label(total - 10), label(total + 60)],
          explanation: `Zamieniamy godziny na minuty: od $${start}$ do $${end}$ to $${total}$ min, czyli $${h}$ godz.${m ? ` i ${m} min` : ""}.`,
        };
      },
      (rng) => {
        const start = int(rng, 6, 18) * 60 + int(rng, 0, 11) * 5;
        const diff = int(rng, 35, 150);
        const end = start + diff;
        const pad = (v) => String(v).padStart(2, "0");
        return {
          content: `Ile minut mija od godziny $${pad(Math.floor(start / 60))}:${pad(start % 60)}$ do godziny $${pad(Math.floor(end / 60))}:${pad(end % 60)}$?`,
          correct: String(diff),
          wrongs: [String(diff + 10), String(diff - 10), String(diff + 40)],
          explanation: `Liczba minut to $${Math.floor(end / 60)} \\cdot 60 + ${end % 60} - (${Math.floor(start / 60)} \\cdot 60 + ${start % 60}) = ${diff}$.`,
        };
      },
      (rng) => {
        const hour = pick(rng, [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
        const angle = hour <= 6 ? 30 * hour : 360 - 30 * hour;
        return {
          content: `Jaki kąt (mniejszy) tworzą wskazówki zegara o godzinie $${hour}:00$?`,
          correct: `${angle}°`,
          wrongs: [`${angle + 30}°`, `${angle - 30}°`, `${360 - angle}°`],
          explanation: `W ciągu godziny wskazówka godzinowa obraca się o $30°$. O $${hour}:00$ mniejszy kąt to $${angle}°$.`,
        };
      },
      (rng) => {
        const start = int(rng, 0, 6);
        const add = int(rng, 2, 40);
        const correctDay = DAYS[(start + add) % 7];
        const otherDays = DAYS.filter((d) => d !== correctDay);
        return {
          content: `Dziś jest ${DAYS[start]}. Jaki dzień tygodnia będzie za $${add}$ dni?`,
          correct: correctDay,
          wrongs: otherDays.slice(0, 3),
          explanation: `Dzielimy $${add}$ przez $7$: reszta ${add % 7} oznacza przesunięcie o ${add % 7} dni w tygodniu. Wynik: ${correctDay}.`,
        };
      },
      (rng) => {
        const h = int(rng, 2, 8);
        const m = int(rng, 1, 3) * 15;
        return {
          content: `$${h}$ godz. $${m}$ min to:`,
          correct: `${h * 60 + m} min`,
          wrongs: [`${h * 100 + m} min`, `${h * 60 - m} min`, `${h * 60 + m + 15} min`],
          explanation: `$${h}$ godz. $= ${h * 60}$ min, więc razem $${h * 60} + ${m} = ${h * 60 + m}$ min.`,
        };
      },
      (rng) => {
        const startMinutes = int(rng, 6, 19) * 60 + int(rng, 0, 11) * 5;
        const add = int(rng, 20, 90);
        const end = startMinutes + add;
        const pad = (v) => String(v).padStart(2, "0");
        const start = `${pad(Math.floor(startMinutes / 60))}:${pad(startMinutes % 60)}`;
        const correct = `${pad(Math.floor(end / 60) % 24)}:${pad(end % 60)}`;
        const wrong1 = `${pad(Math.floor((end + 10) / 60) % 24)}:${pad((end + 10) % 60)}`;
        const wrong2 = `${pad(Math.floor((end - 10) / 60) % 24)}:${pad((end - 10) % 60)}`;
        const wrong3 = `${pad(Math.floor((startMinutes + add + 60) / 60) % 24)}:${pad((startMinutes + add + 60) % 60)}`;
        return {
          content: `Zegar wskazuje $${start}$. Którą godzinę wskaże po $${add}$ minutach?`,
          correct,
          wrongs: [wrong1, wrong2, wrong3],
          explanation: `$${start}$ to $${startMinutes}$ minut od północy. Po dodaniu $${add}$ minut otrzymujemy $${correct}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "temperatura",
    categoryName: "Obliczenia praktyczne",
    topicName: "Temperatura",
    gens: [
      (rng) => {
        const t1 = int(rng, -12, 8);
        const rise = int(rng, 3, 15);
        const t2 = t1 + rise;
        return {
          content: `Temperatura wynosiła $${t1}°C$ i wzrosła o $${rise}°C$. Jaka jest teraz?`,
          correct: `${t2}°C`,
          wrongs: [`${t1 - rise}°C`, `${t1}°C`, `${t2 + rise}°C`],
          explanation: `Do temperatury początkowej dodajemy wzrost: $${t1} + ${rise} = ${t2}$.`,
        };
      },
      (rng) => {
        const t1 = int(rng, 3, 18);
        const k = int(rng, 3, 15);
        const t2 = -k;
        const diff = t1 - t2;
        return {
          content: `O godzinie 6 temperatura wynosiła $${t2}°C$, a o godzinie 14 wzrosła do $${t1}°C$. O ile stopni wzrosła temperatura?`,
          correct: `${diff}°C`,
          wrongs: [`${t1 - k}°C`, `${diff - 2}°C`, `${diff + 2}°C`],
          explanation: `Odejmujemy temperaturę niższą od wyższej: $${t1} - (${t2}) = ${t1} + ${k} = ${diff}$.`,
        };
      },
      (rng) => {
        const t1 = int(rng, -5, 15);
        const drop = int(rng, 3, 18);
        const t2 = t1 - drop;
        return {
          content: `Temperatura wynosiła $${t1}°C$ i spadła o $${drop}°C$. Jaka jest teraz?`,
          correct: `${t2}°C`,
          wrongs: [`${t1 + drop}°C`, `${t2 - drop}°C`, `${t1}°C`],
          explanation: `Spadek oznacza odejmowanie: $${t1} - ${drop} = ${t2}$.`,
        };
      },
      (rng) => {
        const mean = pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
        const deltas = shuffle(rng, [-3, -1, 1, 3]);
        const temps = deltas.map((d) => mean + d);
        return {
          content: `W czterech kolejnych dniach temperatura wynosiła: $${temps.map((t) => `${t}°C`).join("$, $")}$. Jaka była średnia temperatura?`,
          correct: `${mean}°C`,
          wrongs: [`${mean + 1}°C`, `${mean - 1}°C`, `${4 * mean}°C`],
          explanation: `Suma temperatur to $${temps.reduce((a, b) => a + b, 0)}$, a średnia $${temps.reduce((a, b) => a + b, 0)} : 4 = ${mean}$.`,
        };
      },
      (rng) => {
        const values = shuffle(rng, [-15, -12, -9, -6, -3, -1, 0, 2, 4, 7, 10, 13]).slice(0, 4);
        const min = Math.min(...values);
        return {
          content: `Która temperatura jest najniższa: $${values.map((t) => `${t}°C`).join("$, $")}$?`,
          correct: `${min}°C`,
          wrongs: values.filter((v) => v !== min).map((v) => `${v}°C`),
          explanation: `Na osi liczbowej najmniejsza liczba leży najbardziej z lewej strony. To $${min}°C$.`,
        };
      },
      (rng) => {
        const drop = int(rng, 3, 12);
        const finalTemp = -int(rng, 1, 12);
        const initial = finalTemp + drop;
        return {
          content: `Po spadku temperatury o $${drop}°C$ termometr wskazuje $${finalTemp}°C$. Ile stopni było przed spadkiem?`,
          correct: `${initial}°C`,
          wrongs: [`${finalTemp - drop}°C`, `${-finalTemp}°C`, `${finalTemp}°C`],
          explanation: `Do temperatury końcowej dodajemy spadek: $${finalTemp} + ${drop} = ${initial}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "przeksztalcanie_wyrazen",
    categoryName: "Algebra",
    topicName: "Przekształcanie wyrażeń",
    gens: [
      (rng) => {
        const a = int(rng, 5, 12);
        const c = int(rng, 1, 4);
        const b = int(rng, 1, 9);
        const d = int(rng, 1, 9);
        return {
          content: `Po uproszczeniu wyrażenia $${a}x + ${b}y - ${c}x + ${d}y$ otrzymamy:`,
          correct: `$${xy(a - c, b + d)}$`,
          wrongs: [
            `$${xy(a + c, b + d)}$`,
            `$${xy(a - c, -(b + d))}$`,
            `$${xy(a - c, b + d + 2)}$`,
          ],
          explanation: `Łączymy wyrazy podobne: $(${a} - ${c})x + (${b} + ${d})y = ${xy(a - c, b + d)}$.`,
        };
      },
      (rng) => {
        const k = int(rng, 2, 6);
        const a = int(rng, 2, 7);
        const b = int(rng, 1, 9);
        return {
          content: `Po wymnożeniu wyrażenia $${k}(${a}x + ${b})$ otrzymamy:`,
          correct: `$${lin(k * a, k * b)}$`,
          wrongs: [
            `$${lin(a, k * b)}$`,
            `$${lin(k * a, b)}$`,
            `$${lin(k * a, -k * b)}$`,
          ],
          explanation: `Mnożymy każdy składnik w nawiasie przez $${k}$: $${k} \\cdot ${a}x = ${k * a}x$ oraz $${k} \\cdot ${b} = ${k * b}$.`,
        };
      },
      (rng) => {
        const p = int(rng, 2, 5);
        const q = pick(rng, [2, 3, 4, 5].filter((v) => v !== p));
        const a = int(rng, 1, 8);
        const b = int(rng, 1, 8);
        return {
          content: `Po uproszczeniu wyrażenia $${p}(x + ${a}) + ${q}(x + ${b})$ otrzymamy:`,
          correct: `$${lin(p + q, p * a + q * b)}$`,
          wrongs: [
            `$${lin(p + q, p * a - q * b)}$`,
            `$${lin(p - q, p * a + q * b)}$`,
            `$${lin(p * q, p * a + q * b)}$`,
          ],
          explanation: `Wymnażamy nawiasy: $${p}x + ${p * a} + ${q}x + ${q * b}$, a następnie łączymy wyrazy podobne: $${lin(p + q, p * a + q * b)}$.`,
        };
      },
      (rng) => {
        const A = int(rng, 2, 4);
        const B = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
        const C = int(rng, -6, 6);
        const x = int(rng, -3, 3);
        const value = A * x * x + B * x + C;
        return {
          content: `Oblicz wartość wyrażenia $${poly2(A, B, C)}$ dla $x = ${x}$.`,
          correct: String(value),
          wrongs: [String(value + 2), String(value - 2), String(A * x * x + B * x)],
          explanation: `Podstawiamy $x = ${x}$: $${A} \\cdot (${x})^2 ${B > 0 ? "+" : "-"} ${Math.abs(B)} \\cdot (${x}) ${C >= 0 ? "+" : "-"} ${Math.abs(C)} = ${value}$.`,
        };
      },
      (rng) => {
        const c = int(rng, 2, 5);
        const a = c + int(rng, 1, 4);
        const b = int(rng, 1, 9);
        const d = int(rng, 1, 9);
        return {
          content: `Po uproszczeniu wyrażenia $${a}x + ${b} - (${c}x - ${d})$ otrzymamy:`,
          correct: `$${lin(a - c, b + d)}$`,
          wrongs: [
            `$${lin(a - c, b - d)}$`,
            `$${lin(a + c, b + d)}$`,
            `$${lin(a - c, -(b + d))}$`,
          ],
          explanation: `Minus przed nawiasem zmienia znaki: $${a}x + ${b} - ${c}x + ${d} = ${lin(a - c, b + d)}$.`,
        };
      },
      (rng) => {
        const k = int(rng, 2, 9);
        return {
          content: `Po wymnożeniu $x(x + ${k})$ otrzymamy:`,
          correct: `$${poly2(1, k, 0)}$`,
          wrongs: [
            `$${poly2(1, -k, 0)}$`,
            `$${poly2(1, k, k)}$`,
            `$${lin(2, k)}$`,
          ],
          explanation: `Mnożymy $x$ przez każdy składnik nawiasu: $x \\cdot x = x^2$ oraz $x \\cdot ${k} = ${k}x$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "nierownosci",
    categoryName: "Algebra",
    topicName: "Nierówności",
    gens: [
      (rng) => {
        const x0 = int(rng, 2, 9);
        const a = int(rng, 2, 5);
        const b = int(rng, 1, 9);
        const c = a * x0 + b;
        return {
          content: `Rozwiąż nierówność $${a}x + ${b} > ${c}$.`,
          correct: `$x > ${x0}$`,
          wrongs: [`$x < ${x0}$`, `$x > ${x0 + 1}$`, `$x \\ge ${x0}$`],
          explanation: `Odejmujemy $${b}$: $${a}x > ${c - b}$, a następnie dzielimy przez $${a}$: $x > ${x0}$.`,
        };
      },
      (rng) => {
        const x0 = -int(rng, 1, 9);
        const a = int(rng, 2, 5);
        const c = -a * x0;
        return {
          content: `Rozwiąż nierówność $${-a}x > ${c}$.`,
          correct: `$x < ${x0}$`,
          wrongs: [`$x > ${x0}$`, `$x \\le ${x0}$`, `$x > ${-x0}$`],
          explanation: `Dzielimy przez $${-a}$, więc zmieniamy zwrot nierówności: $x < ${x0}$.`,
        };
      },
      (rng) => {
        const x0 = int(rng, 1, 10);
        const a = int(rng, 2, 5);
        const b = int(rng, 1, 9);
        const c = a * x0 - b;
        return {
          content: `Rozwiąż nierówność $${a}x - ${b} \\le ${c}$.`,
          correct: `$x \\le ${x0}$`,
          wrongs: [`$x \\ge ${x0}$`, `$x < ${x0}$`, `$x \\le ${x0 + 1}$`],
          explanation: `Dodajemy $${b}$: $${a}x \\le ${c + b}$, potem dzielimy przez $${a}$: $x \\le ${x0}$.`,
        };
      },
      (rng) => {
        const k = int(rng, 1, 8);
        const f = pick(rng, [2, 4, 6, 7]);
        return {
          content: `Jaka jest najmniejsza liczba całkowita spełniająca nierówność $x > ${k}{,}${f}$?`,
          correct: String(k + 1),
          wrongs: [String(k), String(k + 2), String(k - 1)],
          explanation: `Liczba $${k}{,}${f}$ leży między $${k}$ i $${k + 1}$. Najmniejsza liczba całkowita większa od niej to $${k + 1}$.`,
        };
      },
      (rng) => {
        const n = int(rng, 4, 12);
        return {
          content: `Ile liczb całkowitych dodatnich spełnia nierówność $x < ${n}$?`,
          correct: String(n - 1),
          wrongs: [String(n), String(n - 2), String(n + 1)],
          explanation: `Liczby $1, 2, \\ldots, ${n - 1}$ są dodatnie i mniejsze od $${n}$, jest ich $${n - 1}$.`,
        };
      },
      (rng) => {
        const x0 = int(rng, 1, 8);
        const a = int(rng, 2, 4);
        const b = int(rng, 1, 9);
        const c = a * x0 + b;
        return {
          content: `Największa liczba całkowita spełniająca nierówność $${a}x + ${b} \\le ${c}$ to:`,
          correct: String(x0),
          wrongs: [String(x0 - 1), String(x0 + 1), String(x0 + 2)],
          explanation: `Po odjęciu $${b}$ i podzieleniu przez $${a}$ otrzymujemy $x \\le ${x0}$, więc największa liczba całkowita to $${x0}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "wyznaczanie_wielkosci_ze_wzoru",
    categoryName: "Algebra",
    topicName: "Wyznaczanie wielkości ze wzoru",
    gens: [
      (rng) => {
        const v = pick(rng, [40, 50, 60, 80, 90, 120]);
        const t = int(rng, 2, 6);
        const s = v * t;
        return {
          content: `Korzystając ze wzoru $s = v \\cdot t$, oblicz czas $t$, gdy $s = ${s}$ km i $v = ${v}$ km/h.`,
          correct: `${t} h`,
          wrongs: [`${s - v} h`, `${v} h`, `${t + 1} h`],
          explanation: `Przekształcamy wzór: $t = \\dfrac{s}{v} = \\dfrac{${s}}{${v}} = ${t}$ godziny.`,
        };
      },
      (rng) => {
        const a = 2 * int(rng, 2, 10);
        const h = int(rng, 3, 12);
        const P = (a * h) / 2;
        return {
          content: `Pole trójkąta jest równe $${P}$ cm$^2$, a wysokość ma $${h}$ cm. Jaką długość ma podstawa?`,
          correct: `${a} cm`,
          wrongs: [`${a * 2} cm`, `${P - h} cm`, `${P / h} cm`],
          explanation: `Ze wzoru $P = \\dfrac{a \\cdot h}{2}$ mamy $a = \\dfrac{2P}{h} = \\dfrac{2 \\cdot ${P}}{${h}} = ${a}$ cm.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, 3, 8);
        const c = int(rng, 2, 9);
        const V = a * b * c;
        return {
          content: `Prostopadłościan ma objętość $${V}$ cm$^3$ oraz krawędzie $${a}$ cm i $${b}$ cm. Jaką długość ma trzecia krawędź?`,
          correct: `${c} cm`,
          wrongs: [`${c + 1} cm`, `${c - 1} cm`, `${c + 2} cm`],
          explanation: `Ze wzoru $V = a \\cdot b \\cdot c$ mamy $c = \\dfrac{V}{a \\cdot b} = \\dfrac{${V}}{${a} \\cdot ${b}} = ${c}$ cm.`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 18);
        const b = int(rng, 2, 14);
        const P = 2 * (a + b);
        return {
          content: `Obwód prostokąta wynosi $${P}$ cm, a jeden z boków ma $${a}$ cm. Jaką długość ma drugi bok?`,
          correct: `${b} cm`,
          wrongs: [`${2 * b} cm`, `${b + 1} cm`, `${a} cm`],
          explanation: `Ze wzoru $P = 2(a + b)$ mamy $a + b = ${P / 2}$, więc $b = ${P / 2} - ${a} = ${b}$ cm.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const b = int(rng, 1, 9);
        return {
          content: `Ze wzoru $y = ${a}x + ${b}$ wyznacz $x$.`,
          correct: `$\\dfrac{y - ${b}}{${a}}$`,
          wrongs: [
            `$\\dfrac{y + ${b}}{${a}}$`,
            `$y - ${b}$`,
            `$\\dfrac{${a}}{y - ${b}}$`,
          ],
          explanation: `Odejmujemy $${b}$ od obu stron: $y - ${b} = ${a}x$, a następnie dzielimy przez $${a}$: $x = \\dfrac{y - ${b}}{${a}}$.`,
        };
      },
      (rng) => {
        const P = pick(rng, [40, 60, 100, 250, 500]);
        const t = int(rng, 2, 8);
        const E = P * t;
        return {
          content: `Korzystając ze wzoru $E = P \\cdot t$, oblicz $t$, gdy $E = ${E}$ i $P = ${P}$.`,
          correct: `${t}`,
          wrongs: [`${E - P}`, `${P}`, `${t + 1}`],
          explanation: `Dzielimy obie strony przez $P$: $t = \\dfrac{E}{P} = \\dfrac{${E}}{${P}} = ${t}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const m = int(rng, 3, 20);
        const F = a * m;
        return {
          content: `Korzystając ze wzoru $F = m \\cdot a$, wyznacz $m$, gdy $F = ${F}$ i $a = ${a}$.`,
          correct: `${m}`,
          wrongs: [`${F - a}`, `${a}`, `${m + 1}`],
          explanation: `Dzielimy obie strony przez $a$: $m = \\dfrac{F}{a} = \\dfrac{${F}}{${a}} = ${m}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "trojkaty",
    categoryName: "Geometria płaska",
    topicName: "Trójkąty",
    gens: [
      (rng) => {
        const a = int(rng, 2, 7) * 10;
        const b = int(rng, 3, 9) * 10;
        const c = 180 - a - b;
        if (c <= 0 || c % 10 !== 0) return null;
        return {
          content: `Dwa kąty trójkąta mają miary $${a}°$ i $${b}°$. Jaką miarę ma trzeci kąt?`,
          correct: `${c}°`,
          wrongs: [`${c + 10}°`, `${c - 10}°`, `${360 - a - b}°`],
          explanation: `Suma kątów trójkąta wynosi $180°$: $180 - ${a} - ${b} = ${c}$.`,
        };
      },
      (rng) => {
        const apex = pick(rng, [40, 60, 80, 100, 120]);
        const base = (180 - apex) / 2;
        return {
          content: `Kąt między ramionami trójkąta równoramiennego ma $${apex}°$. Jaką miarę ma kąt przy podstawie?`,
          correct: `${base}°`,
          wrongs: [`${base + 10}°`, `${base - 10}°`, `${180 - apex}°`],
          explanation: `Kąty przy podstawie są równe. Razem dają $180 - ${apex} = ${180 - apex}$, więc każdy ma $${base}°$.`,
        };
      },
      (rng) => {
        const a = int(rng, 4, 10);
        const b = int(rng, a, 12);
        const c = int(rng, b, a + b - 1);
        const stem = pick(rng, [
          "Z których odcinków można zbudować trójkąt?",
          "Które trzy odcinki mogą być bokami trójkąta?",
          "Dla której trójki długości powstanie trójkąt?",
        ]);
        return {
          content: `${stem}`,
          correct: `${a}, ${b}, ${c}`,
          wrongs: [
            `${a}, ${b}, ${a + b}`,
            `${a}, ${b}, ${a + b + 2}`,
            `1, 2, ${a}`,
          ],
          explanation: `Trójkąt powstaje, gdy suma dwóch krótszych boków jest większa od najdłuższego. Dla $${a}, ${b}, ${c}$: $${a} + ${b} > ${c}$, więc warunek jest spełniony.`,
        };
      },
      (rng) => {
        const a = 2 * int(rng, 3, 10);
        const h = int(rng, 3, 12);
        const area = (a * h) / 2;
        return {
          content: `Trójkąt ma podstawę $${a}$ cm i wysokość $${h}$ cm. Jakie jest jego pole?`,
          correct: `${area} cm²`,
          wrongs: [`${a * h} cm²`, `${area + a} cm²`, `${area - a} cm²`],
          explanation: `$P = \\dfrac{1}{2} \\cdot ${a} \\cdot ${h} = ${area}$ cm$^2$.`,
        };
      },
      (rng) => {
        const type = pick(rng, ["ostro", "prosto", "rozwar"]);
        let angles;
        if (type === "ostro") {
          angles = shuffle(rng, pick(rng, [[50, 60, 70], [40, 65, 75], [55, 60, 65]]));
        } else if (type === "prosto") {
          const a = pick(rng, [30, 40, 50, 60]);
          angles = shuffle(rng, [90, a, 90 - a]);
        } else {
          angles = shuffle(rng, pick(rng, [[120, 30, 30], [110, 40, 30], [130, 25, 25]]));
        }
        const name =
          type === "ostro" ? "ostrokątny" : type === "prosto" ? "prostokątny" : "rozwartokątny";
        return {
          content: `Kąty trójkąta mają miary $${angles[0]}°$, $${angles[1]}°$ i $${angles[2]}°$. Jak nazywa się ten trójkąt?`,
          correct: name,
          wrongs: ["ostrokątny", "prostokątny", "rozwartokątny", "równoboczny"].filter(
            (v) => v !== name,
          ).slice(0, 3),
          explanation: `Kąty wskazują, że trójkąt jest ${name}: $${angles.join("°, ")}°$.`,
        };
      },
      (rng) => {
        const r = int(rng, 5, 15);
        const b = int(rng, 4, 2 * r - 2);
        const perimeter = 2 * r + b;
        return {
          content: `Trójkąt równoramienny ma ramię $${r}$ cm i podstawę $${b}$ cm. Jaki jest jego obwód?`,
          correct: `${perimeter} cm`,
          wrongs: [`${perimeter + 2} cm`, `${r + b} cm`, `${perimeter - 2} cm`],
          explanation: `Obwód to suma boków: $${r} + ${r} + ${b} = ${perimeter}$ cm.`,
        };
      },
      (rng) => {
        const i = int(rng, 3, 14) * 10;
        const ext = 180 - i;
        return {
          content: `Kąt wewnętrzny trójkąta przy pewnym wierzchołku ma $${i}°$. Jaką miarę ma kąt zewnętrzny przy tym wierzchołku?`,
          correct: `${ext}°`,
          wrongs: [`${i}°`, `${360 - i}°`, `${ext + 10}°`],
          explanation: `Kąt zewnętrzny i wewnętrzny przy tym samym wierzchołku dopełniają się do $180°$: $${180} - ${i} = ${ext}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "czworokaty",
    categoryName: "Geometria płaska",
    topicName: "Czworokąty",
    gens: [
      (rng) => {
        const a = 2 * int(rng, 2, 8);
        const h = int(rng, 3, 12);
        const area = a * h;
        return {
          content: `Równoległobok ma bok $${a}$ cm i wysokość opuszczoną na ten bok równą $${h}$ cm. Jakie jest jego pole?`,
          correct: `${area} cm²`,
          wrongs: [`${area / 2} cm²`, `${2 * area} cm²`, `${area + a} cm²`],
          explanation: `Pole równoległoboku: $P = a \\cdot h = ${a} \\cdot ${h} = ${area}$ cm$^2$.`,
        };
      },
      (rng) => {
        const h = pick(rng, [4, 6, 8]);
        const a = int(rng, 4, 12);
        let b = int(rng, 3, 10);
        if (b === a) b = b === 10 ? 9 : b + 1;
        const area = ((a + b) * h) / 2;
        return {
          content: `Trapez ma podstawy $${a}$ cm i $${b}$ cm oraz wysokość $${h}$ cm. Jakie jest jego pole?`,
          correct: `${area} cm²`,
          wrongs: [`${(a + b) * h} cm²`, `${area + 10} cm²`, `${area - 10} cm²`],
          explanation: `$P = \\dfrac{(${a} + ${b}) \\cdot ${h}}{2} = ${area}$ cm$^2$.`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 15) * 10;
        const other = 180 - a;
        return {
          content: `Jeden kąt równoległoboku ma $${a}°$. Jaką miarę ma kąt sąsiedni przy tym samym boku?`,
          correct: `${other}°`,
          wrongs: [`${a}°`, `${360 - a}°`, `${other + 10}°`],
          explanation: `Kąty przy jednym boku równoległoboku dopełniają się do $180°$: $180 - ${a} = ${other}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 6, 10) * 10;
        const b = int(rng, 6, 10) * 10;
        const c = int(rng, 6, 10) * 10;
        const d = 360 - a - b - c;
        return {
          content: `Trzy kąty czworokąta mają miary $${a}°$, $${b}°$ i $${c}°$. Jaką miarę ma czwarty kąt?`,
          correct: `${d}°`,
          wrongs: [`${d + 10}°`, `${d - 10}°`, `${360 - d}°`],
          explanation: `Suma kątów czworokąta wynosi $360°$: $360 - ${a} - ${b} - ${c} = ${d}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 14);
        const b = int(rng, 3, 14);
        const area = a * b;
        return {
          content: `Prostokąt ma boki $${a}$ cm i $${b}$ cm. Jakie jest jego pole?`,
          correct: `${area} cm²`,
          wrongs: [`${2 * (a + b)} cm²`, `${2 * area} cm²`, `${a + b} cm²`],
          explanation: `Pole prostokąta: $P = a \\cdot b = ${a} \\cdot ${b} = ${area}$ cm$^2$.`,
        };
      },
      (rng) => {
        const side = int(rng, 4, 15);
        const perimeter = 4 * side;
        const area = side * side;
        return {
          content: `Kwadrat ma obwód $${perimeter}$ cm. Jakie jest jego pole?`,
          correct: `${area} cm²`,
          wrongs: [`${perimeter} cm²`, `${side} cm²`, `${2 * area} cm²`],
          explanation: `Bok kwadratu to $${perimeter} : 4 = ${side}$ cm, więc $P = ${side}^2 = ${area}$ cm$^2$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "wielokaty_foremne",
    categoryName: "Geometria płaska",
    topicName: "Wielokąty foremne",
    gens: [
      (rng) => {
        const n = pick(rng, [5, 6, 7, 8, 9, 10, 12]);
        const sum = (n - 2) * 180;
        return {
          content: `Ile wynosi suma kątów wewnętrznych $${n}$-kąta?`,
          correct: `${sum}°`,
          wrongs: [`${n * 180}°`, `${sum - 180}°`, `${sum + 180}°`],
          explanation: `Suma kątów $n$-kąta to $(n - 2) \\cdot 180°$. Dla $n = ${n}$: $${n - 2} \\cdot 180 = ${sum}°$.`,
        };
      },
      (rng) => {
        const n = pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
        const angle = ((n - 2) * 180) / n;
        return {
          content: `Ile wynosi kąt wewnętrzny wielokąta foremnego o $${n}$ bokach?`,
          correct: `${angle}°`,
          wrongs: [`${360 / n}°`, `${angle + 10}°`, `${angle - 10}°`],
          explanation: `Kąt wewnętrzny foremnego $n$-kąta to $\\dfrac{(n - 2) \\cdot 180°}{n}$. Dla $n = ${n}$: $${angle}°$.`,
        };
      },
      (rng) => {
        const n = pick(rng, [5, 6, 7, 8, 9, 10, 12]);
        const diagonals = (n * (n - 3)) / 2;
        return {
          content: `Ile przekątnych ma $${n}$-kąt?`,
          correct: String(diagonals),
          wrongs: [String(n * (n - 3)), String(diagonals + n), String(diagonals - n)],
          explanation: `Liczba przekątnych to $\\dfrac{n(n - 3)}{2}$. Dla $n = ${n}$: $\\dfrac{${n} \\cdot ${n - 3}}{2} = ${diagonals}$.`,
        };
      },
      (rng) => {
        const n = pick(rng, [3, 4, 5, 6, 8, 9, 10, 12]);
        const ext = 360 / n;
        return {
          content: `Ile wynosi kąt zewnętrzny wielokąta foremnego o $${n}$ bokach?`,
          correct: `${ext}°`,
          wrongs: [`${n}°`, `${180 - ext}°`, `${ext + 10}°`],
          explanation: `Kąty zewnętrzne wielokąta foremnego dają razem $360°$, więc jeden ma $\\dfrac{360°}{${n}} = ${ext}°$.`,
        };
      },
      (rng) => {
        const n = pick(rng, [5, 6, 8, 10, 12]);
        const angle = ((n - 2) * 180) / n;
        return {
          content: `Kąt wewnętrzny wielokąta foremnego ma $${angle}°$. Ile boków ma ten wielokąt?`,
          correct: String(n),
          wrongs: [String(n + 1), String(n - 1), String(n + 2)],
          explanation: `Szukamy $n$ w równaniu $\\dfrac{(n - 2) \\cdot 180}{n} = ${angle}$. Rozwiązanie to $n = ${n}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "twierdzenie_talesa",
    categoryName: "Geometria płaska",
    topicName: "Twierdzenie Talesa",
    gens: [
      (rng) => {
        const a = int(rng, 2, 6);
        const q = pick(rng, [3, 4, 5, 6, 7, 8, 9].filter((v) => v !== a));
        const t = int(rng, 2, 5);
        const c = a * t;
        const x = q * t;
        return {
          content: `Proste równoległe przecinają ramiona kąta. Na pierwszym ramieniu, licząc od wierzchołka, odcinki mają długości $${a}$ i $${q}$. Na drugim ramieniu pierwszy odcinek ma długość $${c}$. Jaką długość ma drugi odcinek?`,
          correct: `${x}`,
          wrongs: [`${x + q}`, `${x - q}`, `${c}`],
          explanation: `Z twierdzenia Talesa: $\\dfrac{${a}}{${q}} = \\dfrac{${c}}{x}$, więc $x = \\dfrac{${q} \\cdot ${c}}{${a}} = ${x}$.`,
        };
      },
      (rng) => {
        const H = pick(rng, [10, 15, 20]);
        const s1 = int(rng, 2, 4);
        const t = int(rng, 2, 6);
        const s2 = s1 * t;
        return {
          content: `Kij o wysokości $${decStr(H, 1)}$ m rzuca cień o długości $${s1}$ m. W tym samym czasie drzewo rzuca cień o długości $${s2}$ m. Jaką wysokość ma drzewo?`,
          correct: `${decStr(H * t, 1)} m`,
          wrongs: [
            `${decStr(H + 10 * (s2 - s1), 1)} m`,
            `${s2} m`,
            `${decStr(H * t * 10, 1)} m`,
          ],
          explanation: `Z twierdzenia Talesa: $\\dfrac{${decStr(H, 1)}}{${s1}} = \\dfrac{h}{${s2}}$, więc $h = ${decStr(H, 1)} \\cdot ${t} = ${decStr(H * t, 1)}$ m.`,
        };
      },
      (rng) => {
        const p = int(rng, 1, 3);
        const q = int(rng, p + 1, 5);
        const t = int(rng, 2, 4);
        const total = (p + q) * t;
        const longer = q * t;
        return {
          content: `Odcinek długości $${total}$ cm podzielono w stosunku $${p} : ${q}$. Jaką długość ma dłuższa część?`,
          correct: `${longer} cm`,
          wrongs: [`${p * t} cm`, `${longer + t} cm`, `${longer - t} cm`],
          explanation: `Całość to $${p + q}$ części, więc jedna część ma $${total} : ${p + q} = ${t}$ cm. Dłuższa część to $${q} \\cdot ${t} = ${longer}$ cm.`,
        };
      },
      (rng) => {
        const p = int(rng, 1, 3);
        const q = int(rng, p + 1, 5);
        const t = int(rng, 2, 4);
        const total = (p + q) * t;
        return {
          content: `Odcinek długości $${total}$ cm podzielono w stosunku $${p} : ${q}$. Jaką długość ma krótsza część?`,
          correct: `${p * t} cm`,
          wrongs: [`${q * t} cm`, `${p * t + t} cm`, `${p * t - t} cm`],
          explanation: `Jedna część to $${total} : ${p + q} = ${t}$ cm. Krótsza część to $${p} \\cdot ${t} = ${p * t}$ cm.`,
        };
      },
      (rng) => {
        const [p, q] = pick(rng, [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [4, 5],
        ]);
        const k = int(rng, 2, 4);
        const a = p;
        const b = q;
        const c = p * k;
        const x = q * k;
        const pairs = [
          [a, b, c, x],
          [a, b, x, c],
          [a, x, c, b],
          [b, a, c, x],
          [a, c, b, x],
          [b, x, a, c],
        ];
        const equation = ([w1, w2, w3, w4]) => `${w1}/${w2} = ${w3}/${w4}`;
        const trueEquation = `${a}/${b} = ${c}/${x}`;
        const falseOnes = [];
        for (const pair of pairs) {
          const [w1, w2, w3, w4] = pair;
          const text = equation(pair);
          if (text === trueEquation) continue;
          if (w1 * w4 === w2 * w3) continue;
          if (!falseOnes.includes(text)) falseOnes.push(text);
        }
        return {
          content: `Odcinki odpowiadające sobie na ramionach kąta mają długości: $a = ${a}$, $b = ${b}$ na pierwszym ramieniu oraz $c = ${c}$, $x = ${x}$ na drugim. Która równość jest prawdziwa?`,
          correct: trueEquation,
          wrongs: falseOnes.slice(0, 3),
          explanation: `Sprawdzamy mnożeniem na krzyż: $${a} \\cdot ${x} = ${a * x}$ i $${b} \\cdot ${c} = ${b * c}$, więc prawdziwa jest równość $${trueEquation}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria_przestrzenna",
    topic: "siatki_bryl",
    categoryName: "Geometria przestrzenna",
    topicName: "Siatki brył",
    gens: [
      (rng) => {
        const solid = pick(rng, Object.keys(SOLID_EDGES));
        const edges = SOLID_EDGES[solid];
        return {
          content: `Ile krawędzi ma ${solid}?`,
          correct: String(edges),
          wrongs: [String(edges + 2), String(edges - 2), String(edges + 4)],
          explanation: `Bryła "${solid}" ma $${edges}$ krawędzi. Liczymy je na modelu lub w siatce, pamiętając o krawędziach sklejanych.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 12);
        const area = 6 * a * a;
        return {
          content: `Sześcian ma krawędź długości $${a}$ cm. Jakie jest jego pole powierzchni?`,
          correct: `${area} cm²`,
          wrongs: [`${a * a * a} cm²`, `${4 * a * a} cm²`, `${6 * a} cm²`],
          explanation: `Sześcian ma $6$ jednakowych kwadratowych ścian: $P = 6 \\cdot ${a}^2 = ${area}$ cm$^2$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 8);
        const b = int(rng, 2, 8);
        const c = int(rng, 2, 8);
        const area = 2 * (a * b + a * c + b * c);
        return {
          content: `Prostopadłościan ma wymiary $${a}$ cm, $${b}$ cm i $${c}$ cm. Jakie jest jego pole powierzchni?`,
          correct: `${area} cm²`,
          wrongs: [
            `${a * b + a * c + b * c} cm²`,
            `${2 * (a * b + a * c)} cm²`,
            `${a * b * c} cm²`,
          ],
          explanation: `Pole powierzchni to suma pól trzech par ścian: $2(${a} \\cdot ${b} + ${a} \\cdot ${c} + ${b} \\cdot ${c}) = ${area}$ cm$^2$.`,
        };
      },
      (rng) => {
        const nets = [
          { text: "sześciu jednakowych kwadratów", answer: "sześcian" },
          { text: "czterech prostokątów i dwóch kwadratów", answer: "prostopadłościan" },
          { text: "trzech prostokątów i dwóch trójkątów", answer: "graniastosłup trójkątny" },
          { text: "jednego kwadratu i czterech trójkątów", answer: "ostrosłup czworokątny" },
        ];
        const net = pick(rng, nets);
        const prefix = pick(rng, [
          "Na kartce narysowano siatkę.",
          "Oto kartonowa siatka.",
          "Model bryły wycięto z siatki.",
        ]);
        const all = ["sześcian", "prostopadłościan", "graniastosłup trójkątny", "ostrosłup czworokątny"];
        return {
          content: `${prefix} Składa się ona z ${net.text}. Jaka to bryła?`,
          correct: net.answer,
          wrongs: all.filter((v) => v !== net.answer),
          explanation: `Siatka złożona z ${net.text} po złożeniu daje ${net.answer}.`,
        };
      },
      (rng) => {
        const n = int(rng, 3, 8);
        const faces = n + 2;
        return {
          content: `Graniastosłup ma podstawę będącą $${n}$-kątem. Ile ścian ma ten graniastosłup?`,
          correct: String(faces),
          wrongs: [String(n), String(2 * n), String(faces + 1)],
          explanation: `Graniastosłup ma $${n}$ ścian bocznych i $2$ podstawy, razem $${n} + 2 = ${faces}$ ścian.`,
        };
      },
      (rng) => {
        const n = int(rng, 3, 8);
        const edges = 2 * n;
        return {
          content: `Ostrosłup ma podstawę będącą $${n}$-kątem. Ile krawędzi ma ten ostrosłup?`,
          correct: String(edges),
          wrongs: [String(3 * n), String(n + 1), String(edges + 2)],
          explanation: `Ostrosłup ma $${n}$ krawędzi podstawy i $${n}$ krawędzi bocznych, razem $${edges}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "uklad_wspolrzednych",
    topic: "srodek_odcinka",
    categoryName: "Układ współrzędnych",
    topicName: "Środek odcinka",
    gens: [
      (rng) => {
        const mx = int(rng, -6, 6);
        const my = int(rng, -6, 6);
        const dx = int(rng, 1, 5);
        const dy = int(rng, 1, 4);
        const ax = mx - dx;
        const bx = mx + dx;
        const ay = my - dy;
        const by = my + dy;
        return {
          content: `Wyznacz współrzędne środka odcinka $AB$, gdzie $A = (${ax}, ${ay})$ i $B = (${bx}, ${by})$.`,
          correct: `$(${mx}, ${my})$`,
          wrongs: [
            `$(${bx}, ${by})$`,
            `$(${ax}, ${ay})$`,
            `$(${mx + 1}, ${my})$`,
          ],
          explanation: `Środek to średnia współrzędnych: $\\left(\\dfrac{${ax} + ${bx}}{2}, \\dfrac{${ay} + ${by}}{2}\\right) = (${mx}, ${my})$.`,
        };
      },
      (rng) => {
        const ax = int(rng, 1, 5);
        const ay = int(rng, 1, 5);
        const sx = int(rng, 6, 10);
        const sy = int(rng, 6, 10);
        const bx = 2 * sx - ax;
        const by = 2 * sy - ay;
        return {
          content: `Punkt $S = (${sx}, ${sy})$ jest środkiem odcinka $AB$, a $A = (${ax}, ${ay})$. Wyznacz współrzędne punktu $B$.`,
          correct: `$(${bx}, ${by})$`,
          wrongs: [
            `$(${sx}, ${sy})$`,
            `$(${sx - ax}, ${sy - ay})$`,
            `$(${ax}, ${ay})$`,
          ],
          explanation: `Środek jest średnią końców, więc $B = 2S - A = (2 \\cdot ${sx} - ${ax}, 2 \\cdot ${sy} - ${ay}) = (${bx}, ${by})$.`,
        };
      },
      (rng) => {
        const a = int(rng, -8, 6);
        const gap = 2 * int(rng, 1, 6);
        const b = a + gap;
        const mid = (a + b) / 2;
        return {
          content: `Na osi liczbowej zaznaczono punkty o współrzędnych $${a}$ i $${b}$. Jaką współrzędną ma środek odcinka między nimi?`,
          correct: String(mid),
          wrongs: [String(a + b), String(mid + 1), String(mid - 1)],
          explanation: `Środek to średnia arytmetyczna: $\\dfrac{${a} + ${b}}{2} = ${mid}$.`,
        };
      },
      (rng) => {
        const mx = int(rng, -4, 4);
        const my = int(rng, -4, 4);
        const ax = mx - 3;
        const bx = mx + 3;
        const ay = my - 2;
        const by = my + 2;
        return {
          content: `Który punkt jest środkiem odcinka o końcach $A = (${ax}, ${ay})$ i $B = (${bx}, ${by})$?`,
          correct: `$(${mx}, ${my})$`,
          wrongs: [
            `$(${mx + 1}, ${my})$`,
            `$(${mx}, ${my + 1})$`,
            `$(${mx - 1}, ${my - 1})$`,
          ],
          explanation: `Środek ma współrzędne $\\left(\\dfrac{${ax} + ${bx}}{2}, \\dfrac{${ay} + ${by}}{2}\\right) = (${mx}, ${my})$.`,
        };
      },
      (rng) => {
        const s = int(rng, -5, 5);
        const a = int(rng, -10, -1);
        const b = 2 * s - a;
        return {
          content: `Na osi liczbowej punkt $S$ o współrzędnej $${s}$ jest środkiem odcinka $AB$. Punkt $A$ ma współrzędną $${a}$. Jaką współrzędną ma punkt $B$?`,
          correct: String(b),
          wrongs: [String(s - a), String(a), String(s)],
          explanation: `$S = \\dfrac{A + B}{2}$, więc $B = 2S - A = 2 \\cdot ${s} - (${a}) = ${b}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 7);
        const b = int(rng, 1, 7);
        return {
          content: `Wyznacz środek odcinka o końcach $(${-a}, ${b})$ i $(${a}, ${-b})$.`,
          correct: `$(0, 0)$`,
          wrongs: [`$(${a}, ${b})$`, `$(${-a}, ${-b})$`, `$(${a}, ${-b})$`],
          explanation: `Środek to $\\left(\\dfrac{${-a} + ${a}}{2}, \\dfrac{${b} + ${-b}}{2}\\right) = (0, 0)$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "tabele_i_wykresy",
    categoryName: "Statystyka",
    topicName: "Tabele i wykresy",
    gens: [
      (rng) => {
        const days = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"];
        const values = shuffle(rng, [8, 9, 12, 14, 15, 16, 18, 20]).slice(0, 4);
        const sum = values.reduce((a, b) => a + b, 0);
        return {
          content: `W tabeli zapisano liczbę biletów sprzedanych w kolejnych dniach: ${days.slice(0, 4).map((d, i) => `${d} - ${values[i]}`).join(", ")}. Ile biletów sprzedano łącznie w tych czterech dniach?`,
          correct: String(sum),
          wrongs: [String(sum + 10), String(sum - 10), String(Math.max(...values))],
          explanation: `Dodajemy wszystkie wartości z tabeli: ${values.join(" + ")} = ${sum}.`,
        };
      },
      (rng) => {
        const days = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"];
        const values = shuffle(rng, [8, 9, 12, 14, 15, 16, 18, 20, 22]).slice(0, 4);
        const spread = Math.max(...values) - Math.min(...values);
        return {
          content: `W tabeli zapisano liczbę biletów sprzedanych w kolejnych dniach: ${days.slice(0, 4).map((d, i) => `${d} - ${values[i]}`).join(", ")}. Jaka jest różnica między największą i najmniejszą liczbą biletów?`,
          correct: String(spread),
          wrongs: [String(Math.max(...values) + Math.min(...values)), String(spread + 2), String(spread - 2)],
          explanation: `Największa wartość to $${Math.max(...values)}$, najmniejsza $${Math.min(...values)}$. Różnica: $${Math.max(...values)} - ${Math.min(...values)} = ${spread}$.`,
        };
      },
      (rng) => {
        const days = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"];
        const mean = int(rng, 8, 20);
        const deltas = shuffle(rng, [-3, -1, 1, 3]);
        const values = deltas.map((d) => mean + d);
        const sum = values.reduce((a, b) => a + b, 0);
        return {
          content: `W tabeli zapisano liczbę biletów sprzedanych w kolejnych dniach: ${days.slice(0, 4).map((d, i) => `${d} - ${values[i]}`).join(", ")}. Jaka była średnia liczba biletów sprzedanych w tych dniach?`,
          correct: String(mean),
          wrongs: [String(mean + 1), String(mean - 1), String(sum)],
          explanation: `Suma wynosi $${sum}$, więc średnia to $${sum} : 4 = ${mean}$.`,
        };
      },
      (rng) => {
        const days = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"];
        const values = shuffle(rng, [8, 9, 12, 14, 15, 16, 18, 20]).slice(0, 4);
        const maxValue = Math.max(...values);
        const maxDay = days[values.indexOf(maxValue)];
        return {
          content: `W tabeli zapisano liczbę biletów sprzedanych w kolejnych dniach: ${days.slice(0, 4).map((d, i) => `${d} - ${values[i]}`).join(", ")}. W który dzień sprzedano najwięcej biletów?`,
          correct: maxDay,
          wrongs: days.slice(0, 4).filter((d) => d !== maxDay),
          explanation: `Największa wartość w tabeli to $${maxValue}$, a odpowiada jej ${maxDay}.`,
        };
      },
      (rng) => {
        const days = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek"];
        const values = shuffle(rng, [8, 9, 12, 14, 15, 16, 18, 20]).slice(0, 4);
        const pair = shuffle(rng, [0, 1, 2, 3]).slice(0, 2);
        const [first, second] =
          values[pair[0]] >= values[pair[1]] ? [pair[0], pair[1]] : [pair[1], pair[0]];
        const diff = values[first] - values[second];
        const inDay = (day) => {
          if (day === "wtorek") return "we wtorek";
          if (day === "środa") return "w środę";
          return `w ${day}`;
        };
        return {
          content: `W tabeli zapisano liczbę biletów sprzedanych w kolejnych dniach: ${days.slice(0, 4).map((d, i) => `${d} - ${values[i]}`).join(", ")}. O ile więcej biletów sprzedano ${inDay(days[first])} niż ${inDay(days[second])}?`,
          correct: String(diff),
          wrongs: [String(values[first] + values[second]), String(diff + 2), String(diff - 2)],
          explanation: `Odejmujemy mniejszą wartość od większej: $${values[first]} - ${values[second]} = ${diff}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "kombinatoryka",
    topic: "kombinatoryka",
    categoryName: "Kombinatoryka i prawdopodobieństwo",
    topicName: "Zliczanie obiektów",
    gens: [
      (rng) => {
        const shirts = int(rng, 2, 6);
        const pants = int(rng, 2, 6);
        const total = shirts * pants;
        const shirtsWord = shirts >= 2 && shirts <= 4 ? "koszulki" : "koszulek";
        const pantsWord = pants >= 2 && pants <= 4 ? "pary" : "par";
        return {
          content: `Marek ma $${shirts}$ ${shirtsWord} i $${pants}$ ${pantsWord} spodni. Na ile sposobów może wybrać jeden zestaw: jedną koszulkę i jedne spodnie?`,
          correct: String(total),
          wrongs: [String(shirts + pants), String(total + 1), String(2 * total)],
          explanation: `Do każdej koszulki można dobrać jedne z $${pants}$ spodni. Z reguły mnożenia: $${shirts} \\cdot ${pants} = ${total}$.`,
        };
      },
      (rng) => {
        const n = int(rng, 3, 5);
        const digits = Array.from({ length: n }, (_, i) => i + 1);
        const total = n * (n - 1);
        return {
          content: `Ile liczb dwucyfrowych można utworzyć z cyfr $${digits.join(", ")}$, jeśli cyfry nie mogą się powtarzać?`,
          correct: String(total),
          wrongs: [String(n * n), String(total - n), String(n * n - 1)],
          explanation: `Cyfrę dziesiątek wybieramy na $${n}$ sposobów, a cyfrę jedności na $${n - 1}$ sposobów: $${n} \\cdot ${n - 1} = ${total}$.`,
        };
      },
      (rng) => {
        const letters = shuffle(rng, ["A", "B", "C", "D", "E", "F"]).slice(0, 4);
        return {
          content: `Ile różnych trzyliterowych kodów można utworzyć z liter $${letters.join(", ")}$, jeśli litery w kodzie nie mogą się powtarzać?`,
          correct: "24",
          wrongs: ["12", "16", "64"],
          explanation: `Pierwszą literę wybieramy na $4$ sposoby, drugą na $3$, trzecią na $2$: $4 \\cdot 3 \\cdot 2 = 24$.`,
        };
      },
      (rng) => {
        const n = int(rng, 4, 10);
        const total = (n * (n - 1)) / 2;
        return {
          content: `Na powitanie każda z $${n}$ osób uścisnęła dłoń każdej innej osobie dokładnie raz. Ile było uścisków dłoni?`,
          correct: String(total),
          wrongs: [String(n * (n - 1)), String(n * n), String(total + n)],
          explanation: `Każda osoba wita się z $${n - 1}$ osobami, ale każdy uścisk liczymy podwójnie: $\\dfrac{${n} \\cdot ${n - 1}}{2} = ${total}$.`,
        };
      },
      (rng) => {
        const n = int(rng, 4, 9);
        const total = (n * (n - 1)) / 2;
        return {
          content: `Z $${n}$ różnych książek wybieramy dwie. Na ile sposobów można to zrobić?`,
          correct: String(total),
          wrongs: [String(n * (n - 1)), String(n * n), String(total - 1)],
          explanation: `Kolejność nie ma znaczenia, więc dzielimy przez $2$: $\\dfrac{${n} \\cdot ${n - 1}}{2} = ${total}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 5);
        const c = int(rng, 2, 4);
        const total = a * b * c;
        const soupWord = a >= 2 && a <= 4 ? "zupy" : "zup";
        const mainWord = b >= 2 && b <= 4 ? "dania główne" : "dań głównych";
        const dessertWord = c >= 2 && c <= 4 ? "desery" : "deserów";
        return {
          content: `Restauracja oferuje $${a}$ ${soupWord}, $${b}$ ${mainWord} i $${c}$ ${dessertWord}. Na ile sposobów można wybrać zestaw złożony z zupy, dania głównego i deseru?`,
          correct: String(total),
          wrongs: [String(a + b + c), String(total * 2), String(total - 1)],
          explanation: `Stosujemy regułę mnożenia: $${a} \\cdot ${b} \\cdot ${c} = ${total}$.`,
        };
      },
      (rng) => {
        const n = int(rng, 3, 6);
        const total = n * n;
        return {
          content: `Ile liczb dwucyfrowych można utworzyć z cyfr $${Array.from({ length: n }, (_, i) => i + 1).join(", ")}$, jeśli cyfry mogą się powtarzać?`,
          correct: String(total),
          wrongs: [String(n * (n - 1)), String(total + n), String(2 * n)],
          explanation: `Cyfrę dziesiątek i cyfrę jedności wybieramy niezależnie, każdą na $${n}$ sposobów: $${n} \\cdot ${n} = ${total}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "zadania_tekstowe",
    topic: "zadania_na_dowodzenie",
    categoryName: "Zadania tekstowe",
    topicName: "Zadania na dowodzenie",
    gens: [
      (rng) => {
        const k = int(rng, 4, 20);
        const sum = 3 * k + 3;
        return {
          content: `Trzy kolejne liczby całkowite to $n$, $n + 1$ i $n + 2$. Ich suma wynosi $3n + 3$. Dla $n = ${k}$ suma ta jest równa:`,
          correct: String(sum),
          wrongs: [String(3 * k), String(3 * k + 1), String(sum + 3)],
          explanation: `Podstawiamy $n = ${k}$: $3 \\cdot ${k} + 3 = ${sum}$. Suma trzech kolejnych liczb jest zawsze podzielna przez $3$.`,
        };
      },
      (rng) => {
        const k = pick(rng, [3, 5, 7, 9, 11, 13, 15, 17]);
        const even = k + 1;
        return {
          content: `Liczba $n = ${k}$ jest nieparzysta. Która z podanych liczb jest parzysta?`,
          correct: String(even),
          wrongs: [String(k + 2), String(2 * k + 1), String(k * k)],
          explanation: `Dodanie $1$ do liczby nieparzystej daje liczbę parzystą: $${k} + 1 = ${even}$. Liczby $${k + 2}$ i $${2 * k + 1}$ są nieparzyste, a $${k * k}$ też jest nieparzysta.`,
        };
      },
      (rng) => {
        const k = int(rng, 3, 15);
        const diff = 2 * k + 1;
        return {
          content: `Dla dwóch kolejnych liczb naturalnych $n$ i $n + 1$ różnica kwadratów wynosi $(n + 1)^2 - n^2 = 2n + 1$. Dla $n = ${k}$ różnica ta jest równa:`,
          correct: String(diff),
          wrongs: [String(diff - 2), String(2 * k), String(diff + 2)],
          explanation: `$(n + 1)^2 - n^2 = n^2 + 2n + 1 - n^2 = 2n + 1$. Dla $n = ${k}$: $2 \\cdot ${k} + 1 = ${diff}$.`,
        };
      },
      (rng) => {
        const k = pick(rng, [3, 5, 7, 9, 11, 13, 15]);
        const square = k * k;
        return {
          content: `Liczba $n = ${k}$ jest nieparzysta. Jaką resztę daje $n^2$ przy dzieleniu przez $4$?`,
          correct: "1",
          wrongs: ["0", "2", "3"],
          explanation: `$${k}^2 = ${square}$, a $${square} : 4 = ${Math.floor(square / 4)}$ reszty $1$. Każdy kwadrat liczby nieparzystej daje resztę $1$ z dzielenia przez $4$.`,
        };
      },
      (rng) => {
        const m = int(rng, 2, 9);
        const k = int(rng, 1, 9);
        const a = 2 * m;
        const b = 2 * k + 1;
        return {
          content: `Liczba $a = ${a}$ jest parzysta, a liczba $b = ${b}$ jest nieparzysta. Ich suma $a + b$ jest:`,
          correct: "nieparzysta",
          wrongs: ["parzysta", "podzielna przez 4", "równa 0"],
          explanation: `$${a} + ${b} = ${a + b}$. Suma liczby parzystej i nieparzystej jest zawsze nieparzysta.`,
        };
      },
      (rng) => {
        const stem = pick(rng, [
          "Iloczyn trzech kolejnych liczb naturalnych jest ZAWSZE podzielny przez:",
          "Iloczyn $n(n+1)(n+2)$ dla dowolnej liczby naturalnej $n$ jest zawsze podzielny przez:",
          "Trzy kolejne liczby naturalne mnożymy przez siebie. Otrzymany iloczyn jest zawsze podzielny przez:",
        ]);
        return {
          content: stem,
          correct: "6",
          wrongs: ["4", "9", "12"],
          explanation: `Wśród trzech kolejnych liczb jest co najmniej jedna parzysta i dokładnie jedna podzielna przez $3$, więc iloczyn dzieli się przez $2 \\cdot 3 = 6$.`,
        };
      },
    ],
  },
];

function deterministicId(topic, index) {
  const hash = crypto
    .createHash("sha1")
    .update(`${topic.exam_type}|${topic.category}|${topic.topic}|${index}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function buildTopic(topic) {
  const tasks = [];
  const seen = new Set();
  for (let i = 0; i < 20; i += 1) {
    const baseSeed =
      topic.topic.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 1009 +
      i * 7919;
    let spec = null;
    let rng = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      rng = mulberry32((baseSeed + attempt * 104729) >>> 0);
      const generator = topic.gens[i % topic.gens.length];
      const candidate = generator(rng);
      if (candidate && !seen.has(candidate.content)) {
        spec = candidate;
        break;
      }
    }
    if (!spec) {
      throw new Error(`Nie udało się wygenerować zadania ${i} dla ${topic.topic}`);
    }
    seen.add(spec.content);
    if (spec.wrongs.length < 3) {
      throw new Error(`Za mało dystraktorów w ${topic.topic}/${i}`);
    }
    const difficulty = i < 7 ? 1 : i < 14 ? 2 : 3;
    tasks.push({
      content: spec.content,
      correct_answer: String(spec.correct),
      options: options(rng, spec.correct, spec.wrongs),
      answer_type: "choice",
      difficulty,
      xp_reward: 10 + difficulty * 4,
      explanation: `${spec.explanation}\n**Odpowiedź:** ${spec.correct}`,
      figure_svg: null,
      figure_caption: null,
      id: deterministicId(topic, i),
      generatedAt: new Date().toISOString(),
      model: MODEL,
    });
  }
  return {
    exam_type: topic.exam_type,
    category: topic.category,
    topic: topic.topic,
    categoryName: topic.categoryName,
    topicName: topic.topicName,
    tasks,
    updatedAt: new Date().toISOString(),
  };
}

function main() {
  const keys = new Set();
  for (const topic of TOPICS) {
    const key = `${topic.category}__${topic.topic}`;
    if (keys.has(key)) throw new Error(`Zduplikowany temat: ${key}`);
    keys.add(key);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let written = 0;
  let taskCount = 0;
  for (const topic of TOPICS) {
    const bundle = buildTopic(topic);
    for (const task of bundle.tasks) {
      if (task.options.length !== 4 || new Set(task.options).size !== 4) {
        throw new Error(`Niepoprawne opcje w ${topic.topic}: ${task.content}`);
      }
      if (!task.options.includes(task.correct_answer)) {
        throw new Error(`Brak poprawnej odpowiedzi w opcjach: ${topic.topic}`);
      }
    }
    const file = path.join(
      OUT_DIR,
      `${bundle.exam_type}__${bundle.category}__${bundle.topic}.json`,
    );
    fs.writeFileSync(file, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
    written += 1;
    taskCount += bundle.tasks.length;
  }
  console.log(`Zapisano ${written} plików z ${taskCount} zadaniami w ${OUT_DIR}`);
}

main();
