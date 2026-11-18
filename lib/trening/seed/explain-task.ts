/**
 * Krótkie, rzeczowe rozwiązania krok po kroku dla zadań z data/tasks-cache.
 *
 * Funkcja `explainTask` jest odporna na błędy wejścia: nigdy nie rzuca
 * wyjątku, nigdy nie zwraca pustego tekstu i zawsze pokazuje metodę,
 * podstawienie danych oraz wynik.
 */

export const GENERIC_EXPLANATION_PREFIX = "Podstaw dane z treści";
export const GENERIC_ROUNDING_PREFIX = "Zastosuj wzór, wykonaj obliczenia";
export const MIN_EXPLANATION_LENGTH = 40;

export type TaskExplanation = {
  explanation: string;
  /** Wynik wyliczony przez generator (do porównania z correct_answer). */
  computed: string | null;
  /** false, gdy wyliczenia nie zgadzają się z correct_answer. */
  consistent: boolean;
};

type Step = { text: string; value: string | null };
type Handler = (content: string, answer: string) => Step | null;

/* -------------------------------------------------------------------------- */
/* Naprawa sklejonych znaków w matematyce                                     */
/* -------------------------------------------------------------------------- */

const SIGN_REPAIRS: ReadonlyArray<readonly [RegExp, string]> = [
  [/--/g, "+"],
  [/\+-/g, "-"],
  [/-\+/g, "-"],
  [/\+\+/g, "+"],
];

function fixSignsInsideMath(inner: string): string {
  let out = inner;
  for (let pass = 0; pass < 4; pass += 1) {
    const before = out;
    for (const [pattern, replacement] of SIGN_REPAIRS) {
      out = out.replace(pattern, replacement);
    }
    if (out === before) break;
  }
  return out;
}

/** Odwiedza kolejne segmenty matematyczne ($...$ oraz $$...$$). */
function mapMathSegments(text: string, fn: (inner: string) => string): string {
  if (!text || text.indexOf("$") === -1) return text;
  let out = "";
  let index = 0;

  while (index < text.length) {
    const start = text.indexOf("$", index);
    if (start === -1) {
      out += text.slice(index);
      break;
    }
    out += text.slice(index, start);

    const doubled = text.startsWith("$$", start);
    const openLength = doubled ? 2 : 1;
    const closing = doubled ? "$$" : "$";
    const end = text.indexOf(closing, start + openLength);
    if (end === -1) {
      out += text.slice(start);
      break;
    }

    const inner = text.slice(start + openLength, end);
    out += text.slice(start, start + openLength);
    out += fn(inner);
    out += text.slice(end, end + openLength);
    index = end + openLength;
  }

  return out;
}

/**
 * Naprawia sekwencje `--`, `+-`, `-+`, `++` wyłącznie wewnątrz $...$.
 * Nie rusza poprawnych zapisów typu `x-(-2)` (tam nie ma podwójnego znaku).
 */
export function repairMathSigns(text: string): string {
  return mapMathSegments(text, fixSignsInsideMath);
}

/** Lista wadliwych sekwencji znaków znalezionych w segmentach matematycznych. */
export function findBrokenSignSequences(text: string): string[] {
  const found: string[] = [];
  mapMathSegments(text, (inner) => {
    const matches = inner.match(/--|\+-|-\+|\+\+/g);
    if (matches) found.push(...matches);
    return inner;
  });
  return found;
}

export function hasBrokenSignSequences(text: string): boolean {
  return findBrokenSignSequences(text).length > 0;
}

/* -------------------------------------------------------------------------- */
/* Formatowanie                                                               */
/* -------------------------------------------------------------------------- */

function plNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "0";
  let text = value.toFixed(decimals);
  if (text.includes(".")) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (text === "-0" || text === "") text = "0";
  return text.replace(".", ",");
}

function texNumber(value: number, decimals = 2): string {
  return plNumber(value, decimals).replace(",", "{,}");
}

function paren(value: number): string {
  return value < 0 ? `(${plNumber(value)})` : plNumber(value);
}

function term(value: number): string {
  return value < 0 ? `-${plNumber(Math.abs(value))}` : `+${plNumber(value)}`;
}

function joinSigned(values: number[]): string {
  return values
    .map((value, index) => (index === 0 ? plNumber(value) : term(value)))
    .join("");
}

function toNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const text = raw.trim().replace("{,}", ",").replace(",", ".");
  if (!/^[-+]?\d+(?:\.\d+)?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/* -------------------------------------------------------------------------- */
/* Porównywanie wyliczonego wyniku z correct_answer                           */
/* -------------------------------------------------------------------------- */

function canonicalAnswer(value: string): string {
  let text = value.trim().toLowerCase();
  text = text.replace(/\$/g, "");
  text = text.replace(/\\left|\\right/g, "");
  text = text.replace(/\\dfrac|\\frac/g, "frac");
  text = text.replace(/\\cdot|\\times/g, "*");
  text = text.replace(/\\sqrt\s*\{([^}]*)\}/g, "sqrt($1)");
  text = text.replace(/\\sqrt\s*(\d+)/g, "sqrt($1)");
  text = text.replace(/√\s*\{?(\d+)\}?/g, "sqrt($1)");
  text = text.replace(/\\%/g, "%");
  text = text.replace(/\\/g, "");
  text = text.replace(/[{}]/g, "");
  text = text.replace(/\s+/g, "");
  text = text.replace(/(\d),(\d)/g, "$1.$2");
  return text;
}

function numericOnly(canonical: string): number | null {
  const match = canonical.match(/^(-?\d+(?:\.\d+)?)([\p{L}°²³%/]*)$/u);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

/** Czy wyliczona wartość zgadza się z zapisaną odpowiedzią? */
export function answersLookSame(computed: string, answer: string): boolean {
  const target = answer.trim();
  if (!target) return true;

  const left = canonicalAnswer(computed);
  const right = canonicalAnswer(target);
  if (!left || !right) return false;
  if (left === right) return true;

  // Relacje (x < 9) porównujemy wyłącznie tekstowo, żeby nie uznać x>9 za x<9.
  if (/[<>≤≥]/.test(left) || /[<>≤≥]/.test(right)) return false;

  const a = numericOnly(left);
  const b = numericOnly(right);
  if (a === null || b === null) return false;

  const tolerance = 0.0201 + Math.abs(b) * 0.001;
  return Math.abs(a - b) <= tolerance;
}

/* -------------------------------------------------------------------------- */
/* Metody dla nieobsłużonych zadań (fallback)                                 */
/* -------------------------------------------------------------------------- */

const TOPIC_METHODS: Record<string, string> = {
  rownania:
    "Rozwiązujemy równanie, przenosząc wyrazy z $x$ na jedną stronę, a liczby na drugą.",
  rownania_liniowe:
    "Przenosimy wyrazy wolne na jedną stronę, a wyrazy z $x$ na drugą, a potem dzielimy przez współczynnik przy $x$.",
  nierownosci:
    "Izolujemy $x$ tak jak w równaniu; przy dzieleniu przez liczbę ujemną odwracamy znak nierówności.",
  rownania_kwadratowe:
    "Sprowadzamy równanie do postaci $ax^2+bx+c=0$, liczymy $\\Delta=b^2-4ac$ i pierwiastki.",
  uklady_rownan:
    "Rozwiązujemy układ metodą przeciwnych współczynników: dodajemy lub odejmujemy równania stronami.",
  funkcja_liniowa:
    "Podstawiamy podany $x$ do wzoru $f(x)=ax+b$ i wykonujemy mnożenie oraz dodawanie.",
  funkcja_kwadratowa:
    "Podstawiamy $x$ do wzoru funkcji kwadratowej, obliczamy potęgę, mnożenie i dodawanie.",
  funkcja_wykladnicza:
    "Zapisujemy obie strony równania jako potęgi tej samej podstawy i porównujemy wykładniki.",
  funkcja_logarytmiczna:
    "Korzystamy z definicji logarytmu: $\\log_a b=c$ oznacza $a^c=b$.",
  logarytmy:
    "Korzystamy z definicji logarytmu: szukamy wykładnika, do którego trzeba podnieść podstawę, aby otrzymać daną liczbę.",
  ciag_arytmetyczny:
    "Korzystamy ze wzoru $a_n=a_1+(n-1)r$, podstawiając dane z treści.",
  ciag_geometryczny:
    "Korzystamy ze wzoru $a_n=a_1\\cdot q^{n-1}$, podstawiając dane z treści.",
  proporcje:
    "W proporcji iloczyn wyrazów skrajnych jest równy iloczynowi wyrazów środkowych.",
  procenty:
    "Procent zamieniamy na ułamek (dzielimy przez $100$) i mnożymy przez całość.",
  diagramy:
    "Odczytujemy procent z diagramu, zamieniamy go na ułamek i mnożymy przez liczbę uczniów.",
  srednia:
    "Dodajemy wszystkie dane i dzielimy sumę przez ich liczbę.",
  statystyka:
    "Porządkujemy dane i korzystamy z definicji średniej lub mediany.",
  mediana_i_dominanta:
    "Porządkujemy dane rosnąco; mediana to środkowa wartość (przy parzystej liczbie danych — średnia dwóch środkowych).",
  statystyka_zaawansowana:
    "Korzystamy z definicji średniej ważonej, wariancji lub wartości oczekiwanej i podstawiamy dane.",
  prawdopodobienstwo:
    "Prawdopodobieństwo klasyczne to iloraz liczby wyników sprzyjających i liczby wszystkich wyników; ułamek skracamy.",
  regula_mnozenia:
    "Stosujemy regułę mnożenia: mnożymy liczby możliwości na kolejnych etapach wyboru.",
  kombinatoryka:
    "Stosujemy regułę mnożenia: mnożymy liczby możliwości na kolejnych etapach wyboru.",
  pola_figur:
    "Dobieramy wzór na pole figury (kwadrat, prostokąt, trójkąt) i podstawiamy wymiary.",
  obwody:
    "Obwód to suma długości boków figury; dla kwadratu wystarczy pomnożyć bok przez $4$.",
  planimetria:
    "Dobieramy wzór do figury: pole trójkąta to połowa iloczynu podstawy i wysokości, a w trójkącie prostokątnym korzystamy z twierdzenia Pitagorasa.",
  pitagoras:
    "Stosujemy twierdzenie Pitagorasa: $a^2+b^2=c^2$, gdzie $c$ to przeciwprostokątna.",
  pitagoras_i_podobienstwo:
    "Stosujemy twierdzenie Pitagorasa do kwadratów długości boków trójkąta prostokątnego.",
  podobienstwo:
    "W figurach podobnych odpowiadające sobie długości zmieniają się w tej samej skali.",
  okrag_i_kolo:
    "Pole koła liczymy ze wzoru $P=\\pi r^2$, a obwód ze wzoru $L=2\\pi r$.",
  katy:
    "Suma kątów w trójkącie wynosi $180^\\circ$; w trójkącie prostokątnym kąty ostre dają w sumie $90^\\circ$.",
  wielokaty:
    "Korzystamy ze wzorów na sumę kątów wielokąta i pole trapezu oraz z definicji obwodu.",
  bryly:
    "Objętość prostopadłościanu to iloczyn jego wymiarów, a sześcianu — sześcian długości krawędzi.",
  objetosc_i_pole:
    "Objętość prostopadłościanu to iloczyn jego wymiarów, a sześcianu — sześcian długości krawędzi.",
  stereometria:
    "Dobieramy wzór na pole powierzchni lub objętość bryły i podstawiamy wymiary.",
  symetrie:
    "W symetrii względem osi $OY$ zmienia się znak współrzędnej $x$, a względem osi $OX$ — znak współrzędnej $y$.",
  punkty_na_plaszczyznie:
    "Ćwiartkę wyznaczają znaki współrzędnych: $(+,+)$ to I, $(-,+)$ to II, $(-,-)$ to III, $(+,-)$ to IV.",
  potegi:
    "Stosujemy prawa działań na potęgach: przy mnożeniu dodajemy wykładniki, przy dzieleniu odejmujemy, a potęgę potęgi mnożymy.",
  pierwiastki:
    "Pierwiastek kwadratowy z liczby to nieujemna liczba, której kwadrat daje tę liczbę.",
  podzielnosc:
    "Wyznaczamy największy wspólny dzielnik albo resztę z dzielenia wskazanych liczb.",
  ulamki:
    "Sprowadzamy ułamki do wspólnego mianownika, dodajemy liczniki i zamieniamy wynik na ułamek dziesiętny.",
  liczby_calkowite:
    "Dodajemy liczby całkowite z uwzględnieniem ich znaków.",
  kolejnosc_dzialan:
    "Najpierw wykonujemy mnożenie i dzielenie, a potem dodawanie i odejmowanie.",
  wartosc_bezwzgledna:
    "Wartość bezwzględna to odległość liczby od zera, więc jest nieujemna.",
  notacja_wykladnicza:
    "Pomnóż współczynnik przez $10$ podniesione do wskazanej potęgi (lub przesuń przecinek).",
  zbiory_i_przedzialy:
    "Część wspólna przedziałów to liczby należące do obu przedziałów: bierzemy większy z lewych końców i mniejszy z prawych końców.",
  dlugosc_odcinka:
    "Korzystamy ze wzoru $d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$ i podstawiamy współrzędne końców.",
  geometria_analityczna:
    "Korzystamy ze wzoru na odległość punktów $d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$.",
  wykresy:
    "Odczytujemy dwa punkty z wykresu, wyznaczamy współczynnik kierunkowy $a$, a potem wartość $y$.",
  odczyt_wykresu:
    "Odczytujemy z wykresu podane wartości funkcji i wykonujemy wskazane działanie.",
  proporcjonalnosc:
    "Wprost proporcjonalność ma postać $y=kx$; najpierw wyznaczamy $k$, a potem mnożymy przez nowy $x$.",
  proporcjonalnosc_odwrotna:
    "W odwrotnej proporcjonalności iloczyn $x\\cdot y$ jest stały: $y=\\frac{a}{x}$.",
  wlasnosci_funkcji:
    "Miejsce zerowe wyznaczamy z równania $f(x)=0$.",
  wyrazenia_algebraiczne:
    "Podstawiamy podane wartości za zmienne i wykonujemy działania, albo redukujemy wyrazy podobne.",
  wzory_skroconego_mnozenia:
    "Wykorzystujemy wzór $(a+b)^2=a^2+2ab+b^2$ lub najpierw obliczamy sumę w nawiasie.",
  wielomiany:
    "Stopień wielomianu to najwyższa potęga $x$; wartość $W(x_0)$ liczymy, podstawiając $x_0$ do wzoru.",
  sin_cos_tg:
    "Odczytujemy wartość z tabeli wartości szczególnych funkcji trygonometrycznych.",
  twierdzenie_sinusow_cosinusow:
    "Korzystamy z twierdzenia sinusów lub cosinusów i podstawiamy dane boki oraz kąty.",
  zastosowania_trygonometrii:
    "W trójkącie prostokątnym stosujemy twierdzenie Pitagorasa lub funkcje trygonometryczne kąta ostrego.",
  zadania_tekstowe:
    "Zapisujemy dane z treści, dobieramy wzór (obwód, procent, prędkość) i wykonujemy obliczenia.",
  czas_droga_predkosc:
    "Korzystamy z zależności $s=v\\cdot t$, przekształcając ją w zależności od szukanej wielkości.",
  jednostki_i_pieniadze:
    "Zamieniamy jednostki (np. $1$ kg $=1000$ g, $1$ h $=60$ min) lub liczymy koszt i resztę.",
  system_rzymski:
    "Odczytujemy wartość cyfr rzymskich i dodajemy je, odejmując mniejsze wartości stojące przed większymi.",
  proste_i_odcinki:
    "Korzystamy z podstawowych własności punktów, prostych i odcinków.",
};

function fallbackExplanation(
  topic: string,
  content: string,
  answer: string,
): string {
  const method =
    TOPIC_METHODS[topic] ??
    "Odczytujemy dane z treści zadania, podstawiamy je do odpowiedniego wzoru i wykonujemy obliczenia.";

  const numbers = [...content.matchAll(/-?\d+(?:[.,]\d+)?/g)]
    .map((match) => match[0])
    .slice(0, 4);
  const data = numbers.length
    ? `Dane z treści: ${numbers.map((value) => `$${value}$`).join(", ")}.`
    : "";
  const result = answer.replace(/\$/g, "").trim();
  const resultLine = result ? `Wynik: ${result}.` : "Wynik odczytujemy z obliczeń.";

  return `${method} ${data} ${resultLine}`.replace(/\s+/g, " ").trim();
}

/* -------------------------------------------------------------------------- */
/* Handlery tematów                                                           */
/* -------------------------------------------------------------------------- */

function parseLinear(
  expression: string,
): { a: number; b: number; c: number } | null {
  const clean = expression.replace(/\s+/g, "").replace(/\\left|\\right/g, "");
  const match = clean.match(/^([+-]?\d*)x(?:([+-]\d+))?=(-?\d+)$/);
  if (!match) return null;
  const rawA = match[1] ?? "";
  const a = rawA === "" || rawA === "+" ? 1 : rawA === "-" ? -1 : Number(rawA);
  const b = match[2] === undefined ? 0 : Number(match[2]);
  const c = Number(match[3]);
  if (![a, b, c].every((value) => Number.isFinite(value)) || a === 0) {
    return null;
  }
  return { a, b, c };
}

function coefficient(value: number): string {
  if (value === 1) return "";
  if (value === -1) return "-";
  return plNumber(value);
}

const handleLinearEquation: Handler = (content) => {
  const expression = content.match(/\$([^$]*=[^$]*)\$/);
  if (!expression) return null;
  const parsed = parseLinear(expression[1]!);
  if (!parsed) return null;

  const { a, b, c } = parsed;
  const x = (c - b) / a;
  if (!Number.isFinite(x)) return null;
  const xText = plNumber(x, 4);

  if (b === 0) {
    return {
      text: `Dzielimy obie strony przez współczynnik przy $x$, czyli przez $${plNumber(a)}$: $${coefficient(a)}x=${plNumber(c)}$, więc $x=${xText}$.`,
      value: xText,
    };
  }

  const after = c - b;
  const operator = b > 0 ? "-" : "+";
  const constantText = plNumber(Math.abs(b));

  if (a === 1) {
    return {
      text: `Przenosimy $${constantText}$ na prawą stronę ze zmianą znaku: $x=${plNumber(c)}${operator}${constantText}=${plNumber(after)}$.`,
      value: xText,
    };
  }

  return {
    text: `Przenosimy $${constantText}$ na prawą stronę ze zmianą znaku: $${coefficient(a)}x=${plNumber(c)}${operator}${constantText}=${plNumber(after)}$. Dzielimy obie strony przez $${plNumber(a)}$: $x=${xText}$.`,
    value: xText,
  };
};

const handleInequality: Handler = (content) => {
  const expression = content.match(/\$([^$]*[<>][^$]*)\$/);
  if (!expression) return null;
  const clean = expression[1]!.replace(/\s+/g, "").replace(/\\left|\\right/g, "");
  const match = clean.match(/^([+-]?\d*)x(?:([+-]\d+))?([<>])(-?\d+)$/);
  if (!match) return null;

  const rawA = match[1] ?? "";
  const a = rawA === "" || rawA === "+" ? 1 : rawA === "-" ? -1 : Number(rawA);
  const b = match[2] === undefined ? 0 : Number(match[2]);
  const operator = match[3]!;
  const rhs = Number(match[4]);
  if (!Number.isFinite(a) || a === 0 || !Number.isFinite(b) || !Number.isFinite(rhs)) {
    return null;
  }

  const after = rhs - b;
  const bound = after / a;
  const flipped =
    a < 0 ? (operator === "<" ? ">" : operator === ">" ? "<" : operator) : operator;
  const value = `x ${flipped} ${plNumber(bound, 4)}`;
  const signStep = b > 0 ? `-${plNumber(b)}` : b < 0 ? `+${plNumber(Math.abs(b))}` : "";

  if (b === 0) {
    return {
      text: `Dzielimy obie strony przez $${plNumber(a)}$${a < 0 ? " i odwracamy znak nierówności" : ""}: $x${flipped}${plNumber(bound, 4)}$.`,
      value,
    };
  }

  if (a === 1) {
    return {
      text: `Przenosimy $${plNumber(Math.abs(b))}$ na prawą stronę ze zmianą znaku: $x${operator}${plNumber(rhs)}${signStep}=${plNumber(after)}$.`,
      value,
    };
  }

  return {
    text: `Przenosimy $${plNumber(Math.abs(b))}$ na prawą stronę: $${coefficient(a)}x${operator}${plNumber(rhs)}${signStep}=${plNumber(after)}$. Dzielimy obie strony przez $${plNumber(a)}$${a < 0 ? " i odwracamy znak nierówności" : ""}: $x${flipped}${plNumber(bound, 4)}$.`,
    value,
  };
};

const handleQuadraticEquation: Handler = (content, answer) => {
  const match = content.match(/\$x\^2\s*([+-]\s*\d*)x\s*([+-]\s*\d+)?\s*=\s*0\$/);
  if (!match) return null;

  const rawB = (match[1] ?? "").replace(/\s+/g, "");
  const b = rawB === "" || rawB === "+" ? 1 : rawB === "-" ? -1 : Number(rawB);
  const rawC = (match[2] ?? "").replace(/\s+/g, "");
  const c = rawC === "" ? 0 : Number(rawC);
  if (![b, c].every((value) => Number.isFinite(value))) return null;

  const delta = b * b - 4 * c;
  if (!Number.isFinite(delta)) return null;

  if (delta < 0) {
    return {
      text: `Liczymy $\\Delta=${paren(b)}^2-4\\cdot1\\cdot${paren(c)}=${plNumber(delta)}$. Delta jest ujemna, więc równanie nie ma pierwiastków rzeczywistych.`,
      value: null,
    };
  }

  const sqrtDelta = Math.sqrt(delta);
  const roots =
    delta === 0
      ? [-b / 2]
      : [(-b - sqrtDelta) / 2, (-b + sqrtDelta) / 2];
  const rounded = roots.map((value) => round(value, 6)).sort((x, y) => x - y);
  const matched = rounded.find((value) => answersLookSame(plNumber(value, 6), answer));
  const winner = matched ?? rounded[0]!;

  const steps =
    delta === 0
      ? `$\\Delta=${paren(b)}^2-4\\cdot1\\cdot${paren(c)}=0$, więc $x=\\frac{-b}{2a}=\\frac{${plNumber(-b)}}{2}=${plNumber(winner)}$.`
      : `$\\Delta=${paren(b)}^2-4\\cdot1\\cdot${paren(c)}=${plNumber(delta)}$, $\\sqrt{\\Delta}=${plNumber(sqrtDelta)}$. Pierwiastki: $x_1=${plNumber(rounded[0]!, 4)}$, $x_2=${plNumber(rounded[1]!, 4)}$.`;

  return { text: steps, value: plNumber(winner, 4) };
};

const handleSystem: Handler = (content) => {
  const match = content.match(
    /x\+y\s*=\s*(-?\d+)[\s\S]*?x-y\s*=\s*(-?\d+)/,
  );
  if (!match) return null;
  const sum = Number(match[1]);
  const diff = Number(match[2]);
  if (!Number.isFinite(sum) || !Number.isFinite(diff)) return null;
  const x = (sum + diff) / 2;
  const y = (sum - diff) / 2;
  return {
    text: `Dodajemy równania stronami, żeby wyeliminować $y$: $2x=${plNumber(sum)}+${plNumber(diff)}=${plNumber(sum + diff)}$, więc $x=${plNumber(x)}$. Wtedy $y=${plNumber(y)}$.`,
    value: plNumber(x, 4),
  };
};

const handleLinearFunction: Handler = (content) => {
  const valueAt = content.match(
    /\$f\(x\)=([^$]+)\$[^$]*?\$f\((-?\d+(?:[.,]\d+)?)\)\$/,
  );
  if (valueAt) {
    const parsed = parseLinearFunction(valueAt[1]!);
    const x = toNumber(valueAt[2]);
    if (!parsed || x === null) return null;
    const y = parsed.a * x + parsed.b;
    const constantPart = parsed.b === 0 ? "" : term(parsed.b);
    return {
      text: `Podstawiamy $x=${plNumber(x)}$ do wzoru $f(x)=${plNumber(parsed.a)}x${constantPart}$: $f(${plNumber(x)})=${plNumber(parsed.a)}\\cdot${paren(x)}${constantPart}=${plNumber(y)}$.`,
      value: plNumber(y, 4),
    };
  }

  const slope = content.match(/współczynnik kierunkowy prostej \$y=([^$]+)\$/i);
  if (slope) {
    const parsed = parseLinearFunction(slope[1]!);
    if (!parsed) return null;
    return {
      text: `Prosta ma postać $y=ax+b$, a współczynnik kierunkowy to liczba przy $x$, czyli $a=${plNumber(parsed.a)}$.`,
      value: plNumber(parsed.a, 4),
    };
  }

  return null;
};

function parseLinearFunction(expression: string): { a: number; b: number } | null {
  const clean = expression
    .replace(/\s+/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/f\(x\)=?/i, "");
  const match = clean.match(/^([+-]?\d*)x(?:([+-]\d+))?$/);
  if (!match) return null;
  const rawA = match[1] ?? "";
  const a = rawA === "" || rawA === "+" ? 1 : rawA === "-" ? -1 : Number(rawA);
  const b = match[2] === undefined ? 0 : Number(match[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { a, b };
}

const handleQuadraticFunction: Handler = (content) => {
  const valueAt = content.match(
    /Oblicz \$f\((-?\d+)\)\$ dla \$f\(x\)=x\^2([+-]\d*)x([+-]\d+)?\$/,
  );
  if (valueAt) {
    const x = Number(valueAt[1]);
    const rawB = valueAt[2] ?? "";
    const b = rawB === "" || rawB === "+" ? 1 : rawB === "-" ? -1 : Number(rawB);
    const c = valueAt[3] === undefined ? 0 : Number(valueAt[3]);
    if (![x, b, c].every((value) => Number.isFinite(value))) return null;
    const y = x * x + b * x + c;
    const linearPart =
      b === 0
        ? ""
        : `${b > 0 ? "+" : "-"}${Math.abs(b) === 1 ? "" : `${plNumber(Math.abs(b))}\\cdot`}${paren(x)}`;
    const constantPart = c === 0 ? "" : term(c);
    return {
      text: `Podstawiamy $x=${plNumber(x)}$: $f(${plNumber(x)})=${paren(x)}^2${linearPart}${constantPart}=${joinSigned([x * x, b * x, c])}=${plNumber(y)}$.`,
      value: plNumber(y, 4),
    };
  }

  const vieta = content.match(
    /\$x\^2\s*([+-]\s*\d*)x\s*([+-]\s*\d+)?\s*=\s*0\$/,
  );
  const vietaWithoutX = vieta
    ? null
    : content.match(/\$x\^2\s*([+-]\s*\d+)\s*=\s*0\$/);
  if (vieta || vietaWithoutX) {
    const rawB = vieta ? (vieta[1] ?? "").replace(/\s+/g, "") : "";
    const b = vieta
      ? rawB === "" || rawB === "+"
        ? 1
        : rawB === "-"
          ? -1
          : Number(rawB)
      : 0;
    const rawC = vieta
      ? (vieta[2] ?? "").replace(/\s+/g, "")
      : (vietaWithoutX![1] ?? "").replace(/\s+/g, "");
    const c = rawC === "" ? 0 : Number(rawC);
    if (![b, c].every((value) => Number.isFinite(value))) return null;
    const sum = -b;
    return {
      text: `Ze wzoru Viete'a $x_1+x_2=-\\frac{b}{a}=-\\frac{${plNumber(b)}}{1}=${plNumber(sum)}$.`,
      value: plNumber(sum, 4),
    };
  }

  return null;
};

const handleExponentialFunction: Handler = (content) => {
  const valueAt = content.match(/Dla \$f\(x\)=(\d+)\^x\$ oblicz \$f\((\d+)\)\$/);
  if (valueAt) {
    const base = Number(valueAt[1]);
    const x = Number(valueAt[2]);
    const y = base ** x;
    return {
      text: `Podstawiamy $x=${plNumber(x)}$ do wzoru $f(x)=${base}^x$: $f(${plNumber(x)})=${base}^{${plNumber(x)}}=${plNumber(y)}$.`,
      value: plNumber(y, 4),
    };
  }

  const equation = content.match(/Rozwiąż równanie \$(\d+)\^x=(\d+)\$/);
  if (equation) {
    const base = Number(equation[1]);
    const target = Number(equation[2]);
    let exponent = Math.log(target) / Math.log(base);
    if (!Number.isFinite(exponent)) return null;
    exponent = round(exponent, 6);
    return {
      text: `Zapisujemy prawą stronę jako potęgę podstawy $${base}$: $${target}=${base}^{${plNumber(exponent)}}$, więc $x=${plNumber(exponent)}$.`,
      value: plNumber(exponent, 4),
    };
  }

  return null;
};

const handleLogarithms: Handler = (content) => {
  const compute = content.match(/Oblicz:?\s*\$(?:\\log)_\{?(\d+)\}?\s*(\d+)\$/);
  const ifThen = content.match(/\$(?:\\log)_\{?(\d+)\}?\s*(\d+)\s*=\s*k\$/);
  const direct = compute ?? ifThen;
  if (direct) {
    const base = Number(direct[1]);
    const target = Number(direct[2]);
    const result = round(Math.log(target) / Math.log(base), 6);
    if (!Number.isFinite(result)) return null;
    return {
      text: `Z definicji logarytmu: skoro $${base}^{${plNumber(result)}}=${target}$, to $\\log_{${base}}${target}=${plNumber(result)}$.`,
      value: plNumber(result, 4),
    };
  }

  const simple = content.match(/Oblicz \$\\log_\{?(\d+)\}?\s*\\frac\{1\}\{(\d+)\}\$/);
  if (simple) {
    const base = Number(simple[1]);
    const denominator = Number(simple[2]);
    const result = round(Math.log(1 / denominator) / Math.log(base), 6);
    return {
      text: `$\\frac{1}{${denominator}}=${base}^{-${plNumber(Math.log(denominator) / Math.log(base))}}$, więc $\\log_{${base}}\\frac{1}{${denominator}}=${plNumber(result)}$.`,
      value: plNumber(result, 4),
    };
  }

  return null;
};

const handleLogFunction: Handler = (content) => {
  const solve = content.match(/Rozwiąż \$\\log_\{?(\d+)\}? x=(\d+)\$/);
  if (solve) {
    const base = Number(solve[1]);
    const c = Number(solve[2]);
    const x = base ** c;
    return {
      text: `Z definicji logarytmu $\\log_a b=c$ oznacza $a^c=b$, więc $x=${base}^{${c}}=${plNumber(x)}$.`,
      value: plNumber(x, 4),
    };
  }

  const domain = content.match(/f\(x\)=\\log_\{?(\d+)\}?\(x-(\d+)\)/);
  if (domain) {
    const d = Number(domain[2]);
    return {
      text: `Argument logarytmu musi być dodatni: $x-${plNumber(d)}>0$, więc $x>${plNumber(d)}$.`,
      value: `x>${plNumber(d)}`,
    };
  }

  return handleLogarithms(content, "");
};

const handleArithmeticSequence: Handler = (content) => {
  const constant = content.match(/Ciąg stały \$a_n=(-?\d+)\$/);
  if (constant) {
    const value = Number(constant[1]);
    return {
      text: `Ciąg jest stały, więc każdy wyraz jest równy $${plNumber(value)}$; także szukany wyraz to $${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const first = content.match(/a_\{?(\d+)\}?\s*=\s*(-?\d+)/);
  const ratio = content.match(/r\s*=\s*(-?\d+)/);
  const target = content.match(/Oblicz \$a_\{?(\d+)\}?\$/);
  if (!first || !ratio || !target) return null;

  const k = Number(first[1]);
  const firstValue = Number(first[2]);
  const r = Number(ratio[1]);
  const n = Number(target[1]);
  const value = firstValue + (n - k) * r;
  return {
    text: `Korzystamy ze wzoru $a_n=a_1+(n-1)r$: $a_{${n}}=${plNumber(firstValue)}+${plNumber(n - k)}\\cdot${paren(r)}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleGeometricSequence: Handler = (content) => {
  const first = content.match(/a_\{?(\d+)\}?\s*=\s*(-?\d+)/);
  const ratio = content.match(/q\s*=\s*(-?\d+)/);
  const target = content.match(/Oblicz \$a_\{?(\d+)\}?\$/);
  if (!first || !ratio || !target) return null;

  const k = Number(first[1]);
  const firstValue = Number(first[2]);
  const q = Number(ratio[1]);
  const n = Number(target[1]);
  const value = firstValue * q ** (n - k);
  return {
    text: `Korzystamy ze wzoru $a_n=a_1\\cdot q^{n-1}$: $a_{${n}}=${plNumber(firstValue)}\\cdot${paren(q)}^{${n - k}}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleSequenceTerm: Handler = (content) => {
  const formula = content.match(/wzorem \$a_n=([^$]+)\$/);
  const target = content.match(/Oblicz \$a_\{?(\d+)\}?\$/);
  if (!formula || !target) return null;
  const n = Number(target[1]);
  const value = evalPolynomial(formula[1]!.replace(/n/g, "x"), n);
  if (value === null) return null;
  const substituted = formula[1]!.replace(/n/g, `(${n})`);
  return {
    text: `Ciąg opisuje wzór $a_n=${formula[1]!}$. Podstawiamy $n=${plNumber(n)}$: $a_{${n}}=${substituted}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleProportion: Handler = (content) => {
  const match = content.match(/\$(\d+):(\d+)=(\d+):x\$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  const c = Number(match[3]);
  const x = (b * c) / a;
  return {
    text: `Iloczyn wyrazów skrajnych równa się iloczynowi środkowych: $${a}\\cdot x=${b}\\cdot${c}=${plNumber(b * c)}$, więc $x=\\frac{${plNumber(b * c)}}{${a}}=${plNumber(x)}$.`,
    value: plNumber(x, 4),
  };
};

const handlePercent: Handler = (content) => {
  const ofNumber = content.match(
    /Ile wynosi (\d+(?:[.,]\d+)?)%\s*z liczby (\d+(?:[.,]\d+)?)/,
  );
  if (ofNumber) {
    const percent = toNumber(ofNumber[1]);
    const total = toNumber(ofNumber[2]);
    if (percent === null || total === null) return null;
    const value = (percent * total) / 100;
    return {
      text: `Zamieniamy procent na ułamek: $${texNumber(percent)}\\%=\\frac{${texNumber(percent)}}{100}$. Mnożymy: $\\frac{${texNumber(percent)}}{100}\\cdot${texNumber(total)}=${texNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const decrease = content.match(
    /Po obniżce o (\d+(?:[.,]\d+)?)%\s*cena (\d+(?:[.,]\d+)?)\s*zł/i,
  );
  if (decrease) {
    const percent = toNumber(decrease[1]);
    const price = toNumber(decrease[2]);
    if (percent === null || price === null) return null;
    const reduction = (price * percent) / 100;
    const value = price - reduction;
    return {
      text: `Obniżka to $${texNumber(percent)}\\%\\cdot${texNumber(price)}=${texNumber(reduction)}$ zł, więc nowa cena to $${texNumber(price)}-${texNumber(reduction)}=${texNumber(value)}$ zł.`,
      value: plNumber(value, 4),
    };
  }

  const increase = content.match(
    /Cena (\d+(?:[.,]\d+)?)\s*zł podwyższona o (\d+(?:[.,]\d+)?)%/i,
  );
  if (increase) {
    const price = toNumber(increase[1]);
    const percent = toNumber(increase[2]);
    if (percent === null || price === null) return null;
    const raise = (price * percent) / 100;
    const value = price + raise;
    return {
      text: `Podwyżka to $${texNumber(percent)}\\%\\cdot${texNumber(price)}=${texNumber(raise)}$ zł, więc nowa cena to $${texNumber(price)}+${texNumber(raise)}=${texNumber(value)}$ zł.`,
      value: plNumber(value, 4),
    };
  }

  const percentOfStudents = content.match(
    /(\d+(?:[.,]\d+)?)\\?%\s*(?:uczniów|z)\s*(?:z czego\s*)?(\d+)/i,
  );
  if (percentOfStudents) {
    const percent = toNumber(percentOfStudents[1]);
    const total = Number(percentOfStudents[2]);
    if (percent === null || !Number.isFinite(total)) return null;
    const value = (percent * total) / 100;
    return {
      text: `$${texNumber(percent)}\\%$ z $${plNumber(total)}$ to $\\frac{${texNumber(percent)}}{100}\\cdot${plNumber(total)}=${texNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const classPercent = content.match(
    /W klasie jest \$(\d+)\$ uczniów[\s\S]*?\$(\d+(?:[.,]\d+)?)\\?%\$ to chłopcy/i,
  );
  if (classPercent) {
    const total = Number(classPercent[1]);
    const percent = toNumber(classPercent[2]);
    if (percent === null || !Number.isFinite(total)) return null;
    const value = (percent * total) / 100;
    return {
      text: `$${texNumber(percent)}\\%$ z $${plNumber(total)}$ uczniów to $\\frac{${texNumber(percent)}}{100}\\cdot${plNumber(total)}=${texNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  return null;
};

/**
 * Parsuje listę danych typu „2, 3, 4, 4, 5” albo „$2,4,6$”.
 * W listach zadaniami dane są liczbami całkowitymi, więc przecinek
 * bez spacji traktujemy jako separator, a nie separator dziesiętny.
 */
function listNumbers(raw: string): number[] {
  const cleaned = raw.trim();
  if (!cleaned) return [];
  const tokens = cleaned.split(/[,\s]+/).filter(Boolean);
  return tokens
    .map((token) => toNumber(token))
    .filter((value): value is number => value !== null);
}

function medianOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle]!;
  return (sorted[middle - 1]! + sorted[middle]!) / 2;
}

const handleMean: Handler = (content) => {
  const mean = content.match(
    /(?:Średnia ocen|Średnia arytmetyczna liczb)\s+([\d\s,i]+?)\s+wynosi/i,
  );
  if (!mean) return null;
  const values = listNumbers(mean[1]!);
  if (values.length === 0) return null;
  const decimals = Number(content.match(/do (\d) miejsca/)?.[1] ?? 1);
  const sum = values.reduce((total, value) => total + value, 0);
  const average = sum / values.length;
  const displayed = plNumber(average, decimals);

  return {
    text: `Sumujemy dane: $${values.map((value) => plNumber(value)).join("+")}=${plNumber(sum)}$. Dzielimy przez liczbę danych: $\\frac{${plNumber(sum)}}{${values.length}}=${texNumber(average, decimals)}$.`,
    value: displayed,
  };
};

const handleMedian: Handler = (content) => {
  const match = content.match(/Mediana zbioru\s+([\d\s,]+)/i);
  if (!match) return null;
  const values = listNumbers(match[1]!);
  const sorted = [...values].sort((a, b) => a - b);
  const median = medianOf(values);
  if (median === null) return null;
  const parity =
    sorted.length % 2 === 1
      ? `Liczb jest $${sorted.length}$ (nieparzysta liczba), więc medianą jest środkowa wartość`
      : `Liczb jest $${sorted.length}$ (parzysta liczba), więc medianą jest średnia dwóch środkowych wartości`;
  return {
    text: `Porządkujemy dane: $${sorted.map((value) => plNumber(value)).join(", ")}$. ${parity}: $${plNumber(median)}$.`,
    value: plNumber(median, 4),
  };
};

const handleProbability: Handler = (content) => {
  const balls = content.match(/Losujemy kulę z (\d+) kul, z czego (\d+) są czerwone/i);
  if (balls) {
    const total = Number(balls[1]);
    const red = Number(balls[2]);
    if (total <= 0) return null;
    const divisor = gcd(red, total);
    const numerator = red / divisor;
    const denominator = total / divisor;
    const value = denominator === 1 ? `${numerator}` : `${numerator}/${denominator}`;
    return {
      text: `Kul czerwonych jest $${red}$, a wszystkich $${total}$, więc $P=\\frac{${red}}{${total}}${numerator === red ? "" : `=\\frac{${numerator}}{${denominator}}`}$.`,
      value,
    };
  }

  const dice = content.match(/kostką (\d+)-ścienną/i);
  if (dice) {
    const sides = Number(dice[1]);
    if (sides <= 0) return null;
    const even = Math.floor(sides / 2);
    const divisor = gcd(even, sides);
    const numerator = even / divisor;
    const denominator = sides / divisor;
    const value = denominator === 1 ? `${numerator}` : `${numerator}/${denominator}`;
    return {
      text: `Liczb parzystych na kostce jest $${even}$, a wszystkich wyników $${sides}$. Prawdopodobieństwo: $P=\\frac{${even}}{${sides}}=\\frac{${numerator}}{${denominator}}$.`,
      value,
    };
  }

  return null;
};

const handleMultiplicationRule: Handler = (content) => {
  const match = content.match(
    /wybrać 1 z (\d+) koszulek, 1 z (\d+) spodni i 1 z (\d+) butów/i,
  );
  if (!match) return null;
  const [a, b, c] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (![a, b, c].every((value) => Number.isFinite(value))) return null;
  return {
    text: `Stosujemy regułę mnożenia: na każdym etapie mnożymy liczby możliwości, więc $${a}\\cdot${b}\\cdot${c}=${plNumber(a * b * c)}$.`,
    value: plNumber(a * b * c, 4),
  };
};

const handlePowers: Handler = (content) => {
  const product = content.match(
    /\$(\d+)\^\{?(\d+)\}?\s*\\cdot\s*(\d+)\^\{?(\d+)\}?\$/,
  );
  if (product && product[1] === product[3]) {
    const [base, left, right] = [Number(product[1]), Number(product[2]), Number(product[4])];
    return {
      text: `Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki: $${base}^{${left}+${right}}=${base}^{${left + right}}=${plNumber(base ** (left + right))}$.`,
      value: plNumber(base ** (left + right), 4),
    };
  }

  const quotient = content.match(
    /\\dfrac\{(\d+)\^\{?(\d+)\}?\}\{(\d+)\^\{?(\d+)\}?\}/,
  );
  if (quotient && quotient[1] === quotient[3]) {
    const [base, top, bottom] = [Number(quotient[1]), Number(quotient[2]), Number(quotient[4])];
    const exponent = top - bottom;
    const value = base ** exponent;
    return {
      text: `Przy dzieleniu potęg o tej samej podstawie odejmujemy wykładniki: $${base}^{${top}-${bottom}}=${base}^{${exponent}}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const power = content.match(/\$\((\d+)\^\{?(\d+)\}?\)\^\{?(\d+)\}?\$/);
  if (power) {
    const [base, inner, outer] = [Number(power[1]), Number(power[2]), Number(power[3])];
    const value = base ** (inner * outer);
    return {
      text: `Potęgę potęgujemy, mnożąc wykładniki: $${base}^{${inner}\\cdot${outer}}=${base}^{${inner * outer}}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  return null;
};

const handleSquareRoot: Handler = (content) => {
  const match = content.match(/\$\\sqrt\{(\d+)\}\$/);
  if (!match) return null;
  const value = Number(match[1]);
  const root = Math.sqrt(value);
  return {
    text: `Szukamy nieujemnej liczby, której kwadrat to $${value}$: $${plNumber(root)}^2=${value}$, więc $\\sqrt{${value}}=${plNumber(root)}$.`,
    value: plNumber(root, 4),
  };
};

const handleDivisibility: Handler = (content) => {
  const commonDivisor = content.match(
    /Największy wspólny dzielnik liczb (\d+) i (\d+)/i,
  );
  if (commonDivisor) {
    const a = Number(commonDivisor[1]);
    const b = Number(commonDivisor[2]);
    const divisor = gcd(a, b);
    return {
      text: `Szukamy największej liczby, która dzieli obie liczby: $\\mathrm{NWD}(${a},${b})=${divisor}$, czyli ${divisor === 1 ? "liczby są względnie pierwsze" : `$${divisor}$ dzieli obie liczby`}.`,
      value: plNumber(divisor, 4),
    };
  }

  const remainder = content.match(
    /reszta z dzielenia liczby (\d+) przez (\d+)/i,
  );
  if (remainder) {
    const a = Number(remainder[1]);
    const b = Number(remainder[2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    const quotient = Math.floor(a / b);
    const rest = a % b;
    return {
      text: `Dzielimy z resztą: $${a}=${quotient}\\cdot${b}+${rest}$, więc reszta to $${rest}$.`,
      value: plNumber(rest, 4),
    };
  }

  return null;
};

const handleFractions: Handler = (content) => {
  const match = content.match(
    /\\dfrac\{(\d+)\}\{(\d+)\}\s*\+\s*\\dfrac\{(\d+)\}\{(\d+)\}/,
  );
  if (!match) return null;
  const [n1, d1, n2, d2] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
  ];
  if (![n1, d1, n2, d2].every((value) => Number.isFinite(value)) || d1 === 0 || d2 === 0) {
    return null;
  }
  const numerator = n1 * d2 + n2 * d1;
  const denominator = d1 * d2;
  const value = numerator / denominator;
  return {
    text: `Sprowadzamy do wspólnego mianownika $${d1}\\cdot${d2}=${denominator}$: $\\dfrac{${n1}}{${d1}}+\\dfrac{${n2}}{${d2}}=\\dfrac{${n1 * d2}+${n2 * d1}}{${denominator}}=\\dfrac{${numerator}}{${denominator}}\\approx${texNumber(value)}$.`,
    value: plNumber(value, 2),
  };
};

const handleOrderOfOperations: Handler = (content) => {
  const match = content.match(/\$(\d+)\+(\d+)\\cdot\s*(\d+)\$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  const c = Number(match[3]);
  return {
    text: `Najpierw mnożymy: $${b}\\cdot${c}=${plNumber(b * c)}$, a potem dodajemy: $${a}+${plNumber(b * c)}=${plNumber(a + b * c)}$.`,
    value: plNumber(a + b * c, 4),
  };
};

const handleIntegers: Handler = (content) => {
  const match = content.match(/\$\((-?\d+)\)\+\((-?\d+)\)\$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  return {
    text: `Dodajemy liczby całkowite z uwzględnieniem znaków: $(${plNumber(a)})+(${plNumber(b)})=${plNumber(a)}+${paren(b)}=${plNumber(a + b)}$.`,
    value: plNumber(a + b, 4),
  };
};

const handleAbsoluteValue: Handler = (content) => {
  const match = content.match(/\$\|(-?\d+(?:[.,]\d+)?)\|\$/);
  if (!match) return null;
  const value = toNumber(match[1]);
  if (value === null) return null;
  return {
    text: `Wartość bezwzględna to odległość liczby od zera, więc $|${plNumber(value)}|=${plNumber(Math.abs(value))}$.`,
    value: plNumber(Math.abs(value), 4),
  };
};

const handleScientificNotation: Handler = (content) => {
  const match = content.match(/\$(\d+)\\cdot\s*(\d+)\^\{?(\d+)\}?\$/);
  if (!match) return null;
  const coefficientValue = Number(match[1]);
  const base = Number(match[2]);
  const exponent = Number(match[3]);
  const value = coefficientValue * base ** exponent;
  return {
    text: `Pomnóż współczynnik przez potęgę: $${coefficientValue}\\cdot${base}^{${exponent}}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleGeometryArea: Handler = (content) => {
  const square = content.match(/Pole kwadratu o boku (\d+)/i);
  if (square) {
    const a = Number(square[1]);
    return {
      text: `Kwadrat ma bok $a$, a jego pole to $a^2$, więc $${a}^2=${plNumber(a * a)}$.`,
      value: plNumber(a * a, 4),
    };
  }

  const rectangle = content.match(/Pole prostokąta o bokach (\d+) i (\d+)/i);
  if (rectangle) {
    const a = Number(rectangle[1]);
    const b = Number(rectangle[2]);
    return {
      text: `Pole prostokąta to iloczyn boków: $${a}\\cdot${b}=${plNumber(a * b)}$.`,
      value: plNumber(a * b, 4),
    };
  }

  const triangle = content.match(/Pole trójkąta o podstawie (\d+) i wysokości (\d+)/i);
  if (triangle) {
    const a = Number(triangle[1]);
    const h = Number(triangle[2]);
    return {
      text: `Pole trójkąta to połowa iloczynu podstawy i wysokości: $P=\\frac12\\cdot${a}\\cdot${h}=${plNumber((a * h) / 2)}$.`,
      value: plNumber((a * h) / 2, 4),
    };
  }

  const trapez = content.match(
    /Trapez ma podstawy \$?(\d+)\$? cm i \$?(\d+)\$? cm oraz wysokość \$?(\d+)\$? cm/i,
  );
  if (trapez) {
    const a = Number(trapez[1]);
    const b = Number(trapez[2]);
    const h = Number(trapez[3]);
    const value = ((a + b) * h) / 2;
    return {
      text: `Pole trapezu to $\\frac12(a+b)\\cdot h$: $P=\\frac12\\cdot(${a}+${b})\\cdot${h}=${plNumber(value)}$ cm².`,
      value: `${plNumber(value)} cm²`,
    };
  }

  return null;
};

const handlePerimeter: Handler = (content) => {
  const square = content.match(/Obwód kwadratu o boku (\d+)/i);
  if (square) {
    const a = Number(square[1]);
    return {
      text: `Kwadrat ma cztery równe boki, więc obwód to $4a=4\\cdot${a}=${plNumber(4 * a)}$.`,
      value: plNumber(4 * a, 4),
    };
  }

  const triangle = content.match(
    /Obwód trójkąta o bokach \$?(\d+)\$? cm, \$?(\d+)\$? cm i \$?(\d+)\$? cm/i,
  );
  if (triangle) {
    const [a, b, c] = [Number(triangle[1]), Number(triangle[2]), Number(triangle[3])];
    const value = a + b + c;
    return {
      text: `Obwód to suma długości boków: $${a}+${b}+${c}=${plNumber(value)}$ cm.`,
      value: `${plNumber(value)} cm`,
    };
  }

  const rectangle = content.match(/Prostokąt ma boki \$(\d+)\$ cm i \$(\d+)\$ cm/i);
  if (rectangle) {
    const [a, b] = [Number(rectangle[1]), Number(rectangle[2])];
    const value = 2 * (a + b);
    return {
      text: `Obwód prostokąta to $2(a+b)=2\\cdot(${a}+${b})=${plNumber(value)}$ cm.`,
      value: `${plNumber(value)} cm`,
    };
  }

  const garden = content.match(/Ogród ma \$(\d+)\$ m na \$(\d+)\$ m/i);
  if (garden) {
    const [a, b] = [Number(garden[1]), Number(garden[2])];
    const value = 2 * (a + b);
    return {
      text: `Ogrodzenie to obwód prostokąta: $2\\cdot(${a}+${b})=${plNumber(value)}$ m.`,
      value: `${plNumber(value)} m`,
    };
  }

  return null;
};

const handleCircle: Handler = (content) => {
  const match = content.match(/(Pole|Obwód) koła \$r=(\d+)\$/i);
  if (!match) return null;
  const radius = Number(match[2]);
  const pi = 3.14;
  if (match[1]!.toLowerCase() === "pole") {
    const exact = pi * radius * radius;
    const value = Math.round(exact);
    return {
      text: `Pole koła to $P=\\pi r^2\\approx3{,}14\\cdot${radius}^2=${texNumber(exact)}\\approx${value}$.`,
      value: plNumber(value, 4),
    };
  }
  const exact = 2 * pi * radius;
  const value = Math.round(exact);
  return {
    text: `Obwód koła to $L=2\\pi r\\approx2\\cdot3{,}14\\cdot${radius}=${texNumber(exact)}\\approx${value}$.`,
    value: plNumber(value, 4),
  };
};

const handlePythagoras: Handler = (content) => {
  const legs = content.match(/przyprostokątne (\d+) i (\d+)/i);
  if (!legs) return null;
  const a = Number(legs[1]);
  const b = Number(legs[2]);
  const square = a * a + b * b;
  const root = Math.sqrt(square);
  const decimalsMatch = content.match(/do (\d) miejsca/);
  const decimals = decimalsMatch ? Number(decimalsMatch[1]) : 0;
  const displayed = decimals > 0 ? plNumber(root, decimals) : plNumber(root, 4);

  if (decimals > 0) {
    const relation = Number.isInteger(root) ? "=" : "\\approx";
    return {
      text: `Z twierdzenia Pitagorasa $c^2=${a}^2+${b}^2=${square}$, więc $c=\\sqrt{${square}}${relation}${displayed}$.`,
      value: displayed,
    };
  }

  return {
    text: `Z twierdzenia Pitagorasa $c^2=${a}^2+${b}^2=${square}$, więc $c=\\sqrt{${square}}=${displayed}$.`,
    value: displayed,
  };
};

const handleSimilarity: Handler = (content) => {
  const match = content.match(/skali (\d+):(\d+)\. Bok (\d+) odpowiada/i);
  if (!match) return null;
  const [from, to, side] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (to === 0) return null;
  const value = (side * from) / to;
  return {
    text: `Skala podobieństwa to $\\frac{${from}}{${to}}=${texNumber(from / to)}$, więc odpowiadający bok ma długość $${side}\\cdot${texNumber(from / to)}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleTriangleAngles: Handler = (content) => {
  const match = content.match(
    /W trójkącie prostokątnym jeden ostry kąt ma (\d+)°\. Drugi ostry kąt ma/i,
  );
  if (!match) return null;
  const angle = Number(match[1]);
  const value = 90 - angle;
  return {
    text: `Kąty ostre w trójkącie prostokątnym dają w sumie $90^\\circ$, więc drugi kąt ma $90^\\circ-${angle}^\\circ=${value}^\\circ$.`,
    value: `${plNumber(value)}°`,
  };
};

const handleSymmetry: Handler = (content) => {
  const match = content.match(/Obraz \$\((-?\d+),(-?\d+)\)\$ w symetrii względem osi \$(OX|OY)\$/i);
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  const axis = match[3]!.toUpperCase();
  const imageX = axis === "OY" ? -x : x;
  const imageY = axis === "OX" ? -y : y;
  const why =
    axis === "OY"
      ? "względem osi $OY$ zmienia się znak współrzędnej $x$"
      : "względem osi $OX$ zmienia się znak współrzędnej $y$";
  return {
    text: `W symetrii ${why}, więc $(${plNumber(x)},${plNumber(y)})$ przechodzi na $(${plNumber(imageX)},${plNumber(imageY)})$.`,
    value: `(${plNumber(imageX)},${plNumber(imageY)})`,
  };
};

const handleQuadrant: Handler = (content) => {
  const match = content.match(/Punkt \$\((-?\d+),(-?\d+)\)\$ leży w ćwiartce/i);
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  const quadrant = x > 0 && y > 0 ? "I" : x < 0 && y > 0 ? "II" : x < 0 && y < 0 ? "III" : "IV";
  return {
    text: `Punkt ma współrzędne $x=${plNumber(x)}$ i $y=${plNumber(y)}$ — ${signPhrase(x, y)}. Dlatego leży w $${quadrant}$ ćwiartce.`,
    value: quadrant,
  };
};

const handleSolid: Handler = (content) => {
  const cube = content.match(/Objętość sześcianu o krawędzi (\d+)/i);
  if (cube) {
    const a = Number(cube[1]);
    return {
      text: `Objętość sześcianu to $a^3$, więc $${a}^3=${plNumber(a ** 3)}$.`,
      value: plNumber(a ** 3, 4),
    };
  }

  const cuboid = content.match(/Objętość prostopadłościanu (\d+)×(\d+)×(\d+)/i);
  if (cuboid) {
    const [a, b, c] = [Number(cuboid[1]), Number(cuboid[2]), Number(cuboid[3])];
    const value = a * b * c;
    return {
      text: `Objętość prostopadłościanu to iloczyn wymiarów: $${a}\\cdot${b}\\cdot${c}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const cubeSurface = content.match(
    /Pole całkowitej powierzchni sześcianu o krawędzi (\d+)/i,
  );
  if (cubeSurface) {
    const a = Number(cubeSurface[1]);
    const value = 6 * a * a;
    return {
      text: `Sześcian ma $6$ ścian, każda o polu $a^2$: $P_c=6\\cdot${a}^2=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  return null;
};

const handleSphere: Handler = (content) => {
  const match = content.match(/Objętość kuli o promieniu (\d+)/i);
  if (!match) return null;
  const radius = Number(match[1]);
  const exact = (4 / 3) * 3.14 * radius ** 3;
  const value = Math.round(exact);
  return {
    text: `Objętość kuli to $V=\\frac43\\pi r^3\\approx\\frac43\\cdot3{,}14\\cdot${radius}^3=${texNumber(exact)}\\approx${value}$.`,
    value: plNumber(value, 4),
  };
};

const handleSpeed: Handler = (content) => {
  const distance = content.match(/jedzie \$(\d+)\$ km\/h przez \$(\d+)\$ h/i);
  if (distance) {
    const [v, t] = [Number(distance[1]), Number(distance[2])];
    return {
      text: `Korzystamy z $s=v\\cdot t$: $s=${v}\\cdot${t}=${plNumber(v * t)}$ km.`,
      value: `${plNumber(v * t)} km`,
    };
  }

  const speed = content.match(/przejechał \$(\d+)\$ km w \$(\d+)\$ h/i);
  if (speed) {
    const [s, t] = [Number(speed[1]), Number(speed[2])];
    if (t === 0) return null;
    const value = s / t;
    return {
      text: `Korzystamy z $v=\\frac{s}{t}$: $v=\\frac{${s}}{${t}}=${texNumber(value)}$ km/h.`,
      value: `${plNumber(value, 2)} km/h`,
    };
  }

  const time = content.match(/przejechanie \$(\d+)\$ km z prędkością \$(\d+)\$ km\/h/i);
  if (time) {
    const [s, v] = [Number(time[1]), Number(time[2])];
    if (v === 0) return null;
    const value = s / v;
    return {
      text: `Korzystamy z $t=\\frac{s}{v}$: $t=\\frac{${s}}{${v}}=${texNumber(value)}$ h.`,
      value: `${plNumber(value, 2)} h`,
    };
  }

  const minutes = content.match(/Ile to \$(\d+)\$ minut w godzinach/i);
  if (minutes) {
    const m = Number(minutes[1]);
    const value = m / 60;
    return {
      text: `Godzina ma $60$ minut, więc dzielimy przez $60$: $${m}:60=${texNumber(value)}$ h.`,
      value: `${plNumber(value, 2)} h`,
    };
  }

  return null;
};

const handleMoney: Handler = (content) => {
  const hourMinutes = content.match(/Ile minut ma \$(\d+)\$ h \$(\d+)\$ min/i);
  if (hourMinutes) {
    const [h, m] = [Number(hourMinutes[1]), Number(hourMinutes[2])];
    const value = h * 60 + m;
    return {
      text: `Zamieniamy godziny na minuty: $${h}\\cdot60=${plNumber(h * 60)}$ min, a potem dodajemy: $${plNumber(h * 60)}+${m}=${plNumber(value)}$ min.`,
      value: `${plNumber(value)} min`,
    };
  }

  const notebooks = content.match(/Kupiono \$(\d+)\$ zeszytów po \$(\d+)\$ zł/i);
  if (notebooks) {
    const [count, price] = [Number(notebooks[1]), Number(notebooks[2])];
    return {
      text: `Koszt to liczba sztuk razy cena: $${count}\\cdot${price}=${plNumber(count * price)}$ zł.`,
      value: `${plNumber(count * price)} zł`,
    };
  }

  const change = content.match(
    /Zakupy kosztowały \$(\d+)\$ zł\. Zapłacono \$(\d+)\$ zł/i,
  );
  if (change) {
    const [cost, paid] = [Number(change[1]), Number(change[2])];
    return {
      text: `Reszta to kwota zapłacona minus koszt: $${paid}-${cost}=${plNumber(paid - cost)}$ zł.`,
      value: `${plNumber(paid - cost)} zł`,
    };
  }

  const pricePerKg = content.match(/\$(\d+(?:[.,]\d+)?)\$ kg jabłek kosztuje \$(\d+(?:[.,]\d+)?)\$ zł/i);
  if (pricePerKg) {
    const mass = toNumber(pricePerKg[1]);
    const cost = toNumber(pricePerKg[2]);
    if (mass === null || cost === null || mass === 0) return null;
    const value = cost / mass;
    return {
      text: `Cena za kilogram to koszt podzielony przez masę: $${texNumber(cost)}:${texNumber(mass)}=${texNumber(value)}$ zł.`,
      value: `${plNumber(value, 2)} zł`,
    };
  }

  return null;
};

const handleChart: Handler = (content) => {
  const match = content.match(
    /W diagramie kołowym (\d+(?:[.,]\d+)?)% uczniów[\s\S]*?przy (\d+) uczniach/i,
  );
  if (!match) return null;
  const percent = toNumber(match[1]);
  const total = Number(match[2]);
  if (percent === null || !Number.isFinite(total)) return null;
  const value = (percent * total) / 100;
  return {
    text: `$${texNumber(percent)}\\%$ z $${plNumber(total)}$ uczniów to $\\frac{${texNumber(percent)}}{100}\\cdot${plNumber(total)}=${texNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleNumberLine: Handler = (content) => {
  const between = content.match(
    /odległość między liczbami \$(-?\d+)\$ i \$(-?\d+)\$/i,
  );
  if (between) {
    const a = Number(between[1]);
    const b = Number(between[2]);
    const value = Math.abs(b - a);
    return {
      text: `Odległość na osi to wartość bezwzględna różnicy: $${paren(a)}-${paren(b)}=${plNumber(a - b)}$, więc $|${plNumber(a - b)}|=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const midpoint = content.match(
    /środka odcinka o końcach \$(-?\d+)\$ i \$(-?\d+)\$/i,
  );
  if (midpoint) {
    const a = Number(midpoint[1]);
    const b = Number(midpoint[2]);
    const value = (a + b) / 2;
    return {
      text: `Środek to średnia współrzędnych końców: $\\frac{${plNumber(a)}+(${plNumber(b)})}{2}=${texNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const opposite = content.match(/liczbę przeciwną do \$(-?\d+)\$/i);
  if (opposite) {
    const a = Number(opposite[1]);
    return {
      text: `Liczba przeciwna ma ten sam moduł i znak przeciwny: $${plNumber(a)}\\to${plNumber(-a)}$.`,
      value: plNumber(-a, 4),
    };
  }

  const fromZero = content.match(
    /odległość liczby \$(-?\d+)\$ od zera/i,
  );
  if (fromZero) {
    const a = Number(fromZero[1]);
    return {
      text: `Odległość od zera to wartość bezwzględna: $|${plNumber(a)}|=${plNumber(Math.abs(a))}$.`,
      value: plNumber(Math.abs(a), 4),
    };
  }

  return null;
};

const handleDistance: Handler = (content) => {
  const points = [...content.matchAll(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g)].map(
    (match) => [Number(match[1]), Number(match[2])] as const,
  );
  if (points.length < 2) return null;
  const [p1, p2] = [points[0]!, points[1]!];
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const distance = Math.hypot(dx, dy);
  const decimals = Number(content.match(/do (\d) miejsca/)?.[1] ?? 1);
  const displayed = plNumber(distance, decimals);
  const relation = Number.isInteger(distance) ? "=" : "\\approx";
  return {
    text: `Korzystamy ze wzoru $d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$: $d=\\sqrt{${paren(dx)}^2+${paren(dy)}^2}=\\sqrt{${plNumber(dx * dx + dy * dy)}}${relation}${displayed}$.`,
    value: displayed,
  };
};

const handleGraph: Handler = (content) => {
  const points = [...content.matchAll(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g)].map(
    (match) => [Number(match[1]), Number(match[2])] as const,
  );
  const xTarget = content.match(/Dla \$x=(-?\d+)\$ wartość \$y\$/i);
  if (points.length < 2 || !xTarget) return null;
  const [p1, p2] = [points[0]!, points[1]!];
  if (p2[0] === p1[0]) return null;
  const x = Number(xTarget[1]);
  const slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  const intercept = p1[1] - slope * p1[0];
  const value = slope * x + intercept;
  return {
    text: `Prosta przechodzi przez $(${p1[0]},${p1[1]})$ i $(${p2[0]},${p2[1]})$, więc $a=\\frac{${p2[1]}-${p1[1]}}{${p2[0]}-${p1[0]}}=${texNumber(slope)}$, a $b=${texNumber(intercept)}$. Dla $x=${x}$: $y=${texNumber(slope)}\\cdot${x}+${texNumber(intercept)}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleGraphReading: Handler = (content) => {
  const pairs = [...content.matchAll(/f\((-?\d+)\)\s*=\s*(-?\d+)/g)].map(
    (match) => [Number(match[1]), Number(match[2])] as const,
  );
  if (pairs.length < 2) return null;
  const [a, b] = [pairs[0]!, pairs[1]!];
  const value = a[1] * b[1];
  return {
    text: `Z wykresu odczytujemy $f(${a[0]})=${a[1]}$ i $f(${b[0]})=${b[1]}$. Iloczyn to $${paren(a[1])}\\cdot${paren(b[1])}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleDirectProportion: Handler = (content) => {
  const match = content.match(
    /\$y=(-?\d+(?:[.,]\d+)?)\$ gdy \$x=(-?\d+(?:[.,]\d+)?)\$[\s\S]*?Dla \$x=(-?\d+)\$/i,
  );
  if (!match) return null;
  const y0 = toNumber(match[1]);
  const x0 = toNumber(match[2]);
  const x = toNumber(match[3]);
  if (y0 === null || x0 === null || x === null || x0 === 0) return null;
  const k = y0 / x0;
  const value = k * x;
  return {
    text: `Wprost proporcjonalność to $y=kx$. Stała $k=\\frac{y}{x}=\\frac{${texNumber(y0)}}{${texNumber(x0)}}=${texNumber(k)}$, więc dla $x=${plNumber(x)}$ mamy $y=${texNumber(k)}\\cdot${plNumber(x)}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleInverseProportion: Handler = (content) => {
  const formula = content.match(/y=\\frac\{(\d+)\}\{x\}/);
  if (formula) {
    const constant = Number(formula[1]);
    const askY = content.match(/Oblicz \$y\$ dla \$x=(\d+)\$/i);
    if (askY) {
      const x = Number(askY[1]);
      return {
        text: `Podstawiamy $x=${x}$ do wzoru: $y=\\frac{${constant}}{${x}}=${plNumber(constant / x)}$.`,
        value: plNumber(constant / x, 4),
      };
    }
    const askX = content.match(/Oblicz \$x\$ dla \$y=(\d+)\$/i);
    if (askX) {
      const y = Number(askX[1]);
      return {
        text: `Przekształcamy wzór: $x=\\frac{${constant}}{y}$, więc dla $y=${y}$ mamy $x=\\frac{${constant}}{${y}}=${plNumber(constant / y)}$.`,
        value: plNumber(constant / y, 4),
      };
    }
  }

  const pair = content.match(/Dla \$x=(\d+)\$ mamy \$y=(\d+)\$[\s\S]*?Oblicz \$y\$ dla \$x=(\d+)\$/i);
  if (!pair) return null;
  const [x0, y0, x] = [Number(pair[1]), Number(pair[2]), Number(pair[3])];
  const constant = x0 * y0;
  return {
    text: `Iloczyn jest stały: $a=${x0}\\cdot${y0}=${plNumber(constant)}$, więc dla $x=${x}$ mamy $y=\\frac{${plNumber(constant)}}{${x}}=${plNumber(constant / x)}$.`,
    value: plNumber(constant / x, 4),
  };
};

const handleZeroPlace: Handler = (content) => {
  const match = content.match(/Miejsce zerowe \$f\(x\)=([^$]+)\$/i);
  if (!match) return null;
  const parsed = parseLinearFunction(match[1]!);
  if (!parsed || parsed.a === 0) return null;
  const x = -parsed.b / parsed.a;
  const decimals = Number.isInteger(x) ? 0 : 2;
  const displayed = plNumber(x, decimals);
  return {
    text: `Miejsce zerowe to rozwiązanie $f(x)=0$: $${coefficient(parsed.a)}x${parsed.b !== 0 ? `${term(parsed.b)}` : ""}=0$, więc $x=${displayed}$.`,
    value: displayed,
  };
};

const handlePolynomial: Handler = (content) => {
  const degree = content.match(/stopień wielomianu \$W\(x\)=([^$]+)\$/i);
  if (degree) {
    const exponents = [...degree[1]!.matchAll(/x\^\{?(\d+)\}?/g)].map((match) => Number(match[1]));
    const hasLinearX = /(?:^|[^\^])x(?![\^])/.test(degree[1]!);
    const highest = Math.max(0, ...exponents, hasLinearX ? 1 : 0);
    return {
      text: `Stopień wielomianu to najwyższa potęga $x$ w jego wzorze, czyli $${highest}$.`,
      value: plNumber(highest, 4),
    };
  }

  const evaluate = content.match(/Oblicz \$W\((-?\d+)\)\$ dla \$W\(x\)=([^$]+)\$/);
  if (evaluate) {
    const x = Number(evaluate[1]);
    const value = evalPolynomial(evaluate[2]!, x);
    if (value === null) return null;
    return {
      text: `Podstawiamy $x=${x}$ do wzoru wielomianu i wykonujemy działania: $W(${x})=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const differenceOfSquares = content.match(/Rozłóż na czynniki \$x\^2-(\d+)\$/);
  if (differenceOfSquares) {
    const value = Number(differenceOfSquares[1]);
    const root = Math.sqrt(value);
    const displayed = plNumber(root, 4);
    return {
      text: `To różnica kwadratów: $x^2-${value}=(x-${displayed})(x+${displayed})$.`,
      value: `(x-${displayed})(x+${displayed})`,
    };
  }

  const cubic = content.match(/Rozłóż na czynniki \$x\^3-(\d+)x\$/);
  if (cubic) {
    const value = Number(cubic[1]);
    const root = Math.sqrt(value);
    const displayed = plNumber(root, 4);
    return {
      text: `Najpierw wyłączamy $x$: $x(x^2-${value})$, a potem stosujemy różnicę kwadratów: $x(x-${displayed})(x+${displayed})$.`,
      value: `x(x-${displayed})(x+${displayed})`,
    };
  }

  return null;
};

function evalPolynomial(expression: string, x: number): number | null {
  const clean = expression
    .replace(/[{}]/g, "")
    .replace(/\s+/g, "")
    .replace(/\*/g, "");
  const terms = clean.match(/[+-]?[^+-]+/g);
  if (!terms) return null;
  let total = 0;
  for (const term of terms) {
    const match = term.match(/^([+-]?)(\d*)(?:x(?:\^(\d+))?)?$/);
    if (!match) return null;
    const sign = match[1] === "-" ? -1 : 1;
    const coefficientValue = match[2] === "" ? 1 : Number(match[2]);
    if (!Number.isFinite(coefficientValue)) return null;
    const exponent = match[3] !== undefined ? Number(match[3]) : term.includes("x") ? 1 : 0;
    total += sign * coefficientValue * x ** exponent;
  }
  return Number.isFinite(total) ? total : null;
}

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const ROMAN_TOKENS: ReadonlyArray<readonly [number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function toRoman(value: number): string {
  let rest = Math.max(0, Math.floor(value));
  let out = "";
  for (const [amount, symbol] of ROMAN_TOKENS) {
    while (rest >= amount) {
      out += symbol;
      rest -= amount;
    }
  }
  return out;
}

function fromRoman(symbols: string): number {
  let total = 0;
  for (let index = 0; index < symbols.length; index += 1) {
    const current = ROMAN_VALUES[symbols[index]!] ?? 0;
    const next = ROMAN_VALUES[symbols[index + 1]!] ?? 0;
    total += current < next ? -current : current;
  }
  return total;
}

const SUBTRACTIVE_ROMAN = new Set(["CM", "CD", "XC", "XL", "IX", "IV"]);

function romanParts(symbols: string): Array<[string, number]> {
  const parts: Array<[string, number]> = [];
  let index = 0;
  while (index < symbols.length) {
    const pair = symbols.slice(index, index + 2);
    if (SUBTRACTIVE_ROMAN.has(pair)) {
      parts.push([pair, fromRoman(pair)]);
      index += 2;
      continue;
    }
    let end = index + 1;
    while (
      end < symbols.length &&
      symbols[end] === symbols[index] &&
      !SUBTRACTIVE_ROMAN.has(symbols.slice(end, end + 2))
    ) {
      end += 1;
    }
    const run = symbols.slice(index, end);
    parts.push([run, fromRoman(run)]);
    index = end;
  }
  return parts;
}

function romanBreakdownText(symbols: string): string {
  return romanParts(symbols)
    .map(([token, value]) => `$${token}=${plNumber(value)}$`)
    .join(", ");
}

function romanSumText(symbols: string): string {
  return romanParts(symbols)
    .map(([, value]) => plNumber(value))
    .join("+");
}

function signPhrase(x: number, y: number): string {
  const horizontal = x > 0 ? "dodatnia" : x < 0 ? "ujemna" : "równa zeru";
  const vertical = y > 0 ? "dodatnia" : y < 0 ? "ujemna" : "równa zeru";
  return `odcięta jest ${horizontal}, a rzędna ${vertical}`;
}

const handleRoman: Handler = (content) => {
  const read = content.match(/cyframi rzymskimi:\s*\$([IVXLCDM]+)\$/i);
  if (read) {
    const symbols = read[1]!.toUpperCase();
    const value = fromRoman(symbols);
    return {
      text: `Rozkładamy zapis na symbole: ${romanBreakdownText(symbols)}. Ich suma to $${romanSumText(symbols)}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const write = content.match(/Zapisz liczbę \$(\d+)\$ cyframi rzymskimi/i);
  if (write) {
    const value = Number(write[1]);
    const symbols = toRoman(value);
    return {
      text: `Rozkładamy liczbę na wartości $1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1$: $${value}=${symbols}$.`,
      value: symbols,
    };
  }

  const symbol = content.match(/symbol rzymski \$([IVXLCDM]+)\$/i);
  if (symbol) {
    const symbols = symbol[1]!.toUpperCase();
    const value = fromRoman(symbols);
    return {
      text: `Symbol $${symbols}$ ma wartość $${plNumber(value)}$ — tyle jednostek odpowiada tej literze w zapisie rzymskim.`,
      value: plNumber(value, 4),
    };
  }

  const which = content.match(/Który zapis jest poprawny dla liczby \$(\d+)\$/i);
  if (which) {
    const value = Number(which[1]);
    const symbols = toRoman(value);
    return {
      text: `Liczbę $${value}$ zapisujemy cyframi rzymskimi jako $${symbols}$.`,
      value: symbols,
    };
  }

  const sum = content.match(/Ile wynosi \$([IVXLCDM]+)\+([IVXLCDM]+)\$/i);
  if (sum) {
    const leftSymbols = sum[1]!.toUpperCase();
    const rightSymbols = sum[2]!.toUpperCase();
    const left = fromRoman(leftSymbols);
    const right = fromRoman(rightSymbols);
    return {
      text: `$${leftSymbols}=${plNumber(left)}$ i $${rightSymbols}=${plNumber(right)}$, więc suma to $${plNumber(left)}+${plNumber(right)}=${plNumber(left + right)}$.`,
      value: plNumber(left + right, 4),
    };
  }

  return null;
};

const handleIntervals: Handler = (content) => {
  const intervals = [...content.matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)].map(
    (match) => [Number(match[1]), Number(match[2])] as const,
  );
  if (intervals.length < 2) return null;
  const [first, second] = [intervals[0]!, intervals[1]!];
  const left = Math.max(first[0], second[0]);
  const right = Math.min(first[1], second[1]);
  return {
    text: `Część wspólna to liczby należące do obu przedziałów: lewy koniec to większy z lewych ($\\max(${first[0]},${second[0]})=${left}$), a prawy to mniejszy z prawych ($\\min(${first[1]},${second[1]})=${right}$). Wynik: $[${left},${right}]$.`,
    value: `[${left},${right}]`,
  };
};

const SIN_TABLE: Record<number, string> = {
  0: "0",
  30: "1/2",
  45: "√2/2",
  60: "√3/2",
  90: "1",
  120: "√3/2",
  135: "√2/2",
  150: "1/2",
  180: "0",
};

const COS_TABLE: Record<number, string> = {
  0: "1",
  30: "√3/2",
  45: "√2/2",
  60: "1/2",
  90: "0",
  120: "-1/2",
  135: "-√2/2",
  150: "-√3/2",
  180: "-1",
};

const TG_TABLE: Record<number, string> = {
  0: "0",
  30: "1/√3",
  45: "1",
  60: "√3",
  90: "nie istnieje",
  120: "-√3",
  135: "-1",
  150: "-1/√3",
};

const handleTrigonometry: Handler = (content) => {
  const match = content.match(
    /\$(\\sin|\\cos|\\mathrm\{tg\}|\\tg)[\s\\,]*(\d+)\^\\circ\$/,
  );
  if (!match) return null;
  const fn = match[1]!;
  const angle = Number(match[2]);
  const table = fn.includes("sin") ? SIN_TABLE : fn.includes("cos") ? COS_TABLE : TG_TABLE;
  const value = table[angle];
  if (value === undefined) return null;
  const label = fn.includes("sin") ? "\\sin" : fn.includes("cos") ? "\\cos" : "\\mathrm{tg}\\,";
  if (value === "nie istnieje") {
    return {
      text: `$\\mathrm{tg}\\,${angle}^\\circ$ nie istnieje, bo $\\cos${angle}^\\circ=0$ (mianownik byłby zerem).`,
      value,
    };
  }
  return {
    text: `Odczytujemy z tabeli wartości szczególnych: $${label}${angle}^\\circ=${value}$.`,
    value,
  };
};

const handleTriangleTrig: Handler = (content) => {
  const area =
    content.match(
      /Trójkąt ma boki \$(\d+)\$ i \$(\d+)\$, a kąt między nimi wynosi \$(\d+)\^\\circ\$/,
    ) ??
    content.match(
      /W trójkącie boki \$(\d+)\$ i \$(\d+)\$ tworzą kąt \$(\d+)\^\\circ\$\. Oblicz pole/,
    );
  if (area) {
    const [a, b, angle] = [Number(area[1]), Number(area[2]), Number(area[3])];
    const radians = (angle * Math.PI) / 180;
    const exact = (a * b * Math.sin(radians)) / 2;
    const value = plNumber(exact, 2);
    let exactTex = texNumber(exact);
    let resultValue = value;
    if (angle === 90) {
      exactTex = `${plNumber(exact)}`;
    } else if (angle === 60 || angle === 120) {
      exactTex = `${plNumber((a * b) / 4, 2)}\\sqrt{3}`;
      resultValue = `${plNumber((a * b) / 4, 2)}√3`;
    } else if (angle === 45) {
      exactTex = `${plNumber((a * b) / 4, 2)}\\sqrt{2}`;
      resultValue = `${plNumber((a * b) / 4, 2)}√2`;
    }
    return {
      text: `Pole trójkąta: $P=\\frac12\\cdot${a}\\cdot${b}\\cdot\\sin${angle}^\\circ=${exactTex}$.`,
      value: resultValue,
    };
  }

  const cosine = content.match(
    /W trójkącie boki \$(\d+)\$ i \$(\d+)\$ tworzą kąt \$(\d+)\^\\circ\$\. Oblicz \$c\^2\$/,
  );
  if (cosine) {
    const [a, b, angle] = [Number(cosine[1]), Number(cosine[2]), Number(cosine[3])];
    const cos = Math.cos((angle * Math.PI) / 180);
    const exact = a * a + b * b - 2 * a * b * cos;
    return {
      text: `Z twierdzenia cosinusów: $c^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot\\cos${angle}^\\circ=${plNumber(exact)}$.`,
      value: plNumber(exact, 4),
    };
  }

  const sine = content.match(
    /W trójkącie \$a=(\d+)\$, \$\\alpha=(\d+)\^\\circ\$, \$\\beta=(\d+)\^\\circ\$\. Oblicz \$b\$/,
  );
  if (sine) {
    const [a, alpha, beta] = [Number(sine[1]), Number(sine[2]), Number(sine[3])];
    const value = (a * Math.sin((beta * Math.PI) / 180)) / Math.sin((alpha * Math.PI) / 180);
    return {
      text: `Z twierdzenia sinusów $\\frac{a}{\\sin\\alpha}=\\frac{b}{\\sin\\beta}$, więc $b=\\frac{${a}\\cdot\\sin${beta}^\\circ}{\\sin${alpha}^\\circ}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const pythagoras = content.match(
    /przyprostokątne mają \$(\d+)\$ i \$(\d+)\$\. Oblicz kwadrat przeciwprostokątnej/,
  );
  if (pythagoras) {
    const [a, b] = [Number(pythagoras[1]), Number(pythagoras[2])];
    return {
      text: `Z twierdzenia Pitagorasa: $c^2=${a}^2+${b}^2=${plNumber(a * a + b * b)}$.`,
      value: plNumber(a * a + b * b, 4),
    };
  }

  return null;
};

const handleWeightedMean: Handler = (content) => {
  const pairs = [...content.matchAll(/\$(-?\d+(?:[.,]\d+)?)\$\s*\(waga\s*\$(-?\d+)\$\)/g)].map(
    (match) => [Number(match[1]!.replace(",", ".")), Number(match[2])] as const,
  );
  if (pairs.length === 0) return null;
  const weighted = pairs.reduce((total, [value, weight]) => total + value * weight, 0);
  const weightSum = pairs.reduce((total, [, weight]) => total + weight, 0);
  if (weightSum === 0) return null;
  const value = weighted / weightSum;
  return {
    text: `Mnożymy wartości przez wagi: $${pairs.map(([v, w]) => `${plNumber(v)}\\cdot${plNumber(w)}`).join("+")}=${plNumber(weighted)}$, a suma wag to $${plNumber(weightSum)}$. Średnia ważona: $\\frac{${plNumber(weighted)}}{${plNumber(weightSum)}}=${texNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleVariance: Handler = (content) => {
  const variance = content.match(/Oblicz wariancję danych\s*\$([\d,\s]+)\$/i);
  const deviation = content.match(/Oblicz odchylenie standardowe danych\s*\$([\d,\s]+)\$/i);
  const source = variance ?? deviation;
  if (!source) return null;
  const values = listNumbers(source[1]!);
  if (values.length === 0) return null;
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  const squares = values.map((value) => (value - average) ** 2);
  const varianceValue = squares.reduce((total, value) => total + value, 0) / values.length;

  if (variance) {
    return {
      text: `Średnia to $\\frac{${values.map((value) => plNumber(value)).join("+")}}{${values.length}}=${texNumber(average)}$. Wariancja: $\\frac{${squares.map((value) => plNumber(value)).join("+")}}{${values.length}}\\approx${texNumber(varianceValue)}$.`,
      value: plNumber(varianceValue, 2),
    };
  }

  const sd = Math.sqrt(varianceValue);
  return {
    text: `Średnia to $\\frac{${values.map((value) => plNumber(value)).join("+")}}{${values.length}}=${texNumber(average)}$, a wariancja $\\frac{${squares.map((value) => plNumber(value)).join("+")}}{${values.length}}=${texNumber(varianceValue)}$. Odchylenie standardowe: $\\sqrt{${texNumber(varianceValue)}}\\approx${texNumber(sd)}$.`,
    value: plNumber(sd, 2),
  };
};

const handleExpectedValue: Handler = (content) => {
  const match = content.match(
    /wygrywasz \$(\d+)\$ zł z prawdopodobieństwem \$(\d+(?:[.,]\d+)?)\$ i \$(\d+)\$ zł/i,
  );
  if (!match) return null;
  const win = Number(match[1]);
  const probability = toNumber(match[2]);
  const other = Number(match[3]);
  if (probability === null) return null;
  const value = win * probability + other * (1 - probability);
  return {
    text: `Wartość oczekiwana to suma iloczynów wartości i prawdopodobieństw: $E(X)=${plNumber(win)}\\cdot${texNumber(probability)}+${plNumber(other)}\\cdot${texNumber(1 - probability)}=${texNumber(value)}$ zł.`,
    value: plNumber(value, 2),
  };
};

const handleAdvancedMedian: Handler = (content) => {
  const match = content.match(/Oblicz medianę danych\s*\$([\d,\s]+)\$/i);
  if (!match) return null;
  const values = listNumbers(match[1]!);
  const median = medianOf(values);
  if (median === null) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    text: `Porządkujemy dane: $${sorted.map((value) => plNumber(value)).join(", ")}$. Przy $${values.length}$ liczbach mediana to środkowa wartość: $${plNumber(median)}$.`,
    value: plNumber(median, 4),
  };
};

const handleExpression: Handler = (content) => {
  const simplify = content.match(/Uprość:\s*\$(\d+)x\+(\d+)x\$/);
  if (simplify) {
    const [a, b] = [Number(simplify[1]), Number(simplify[2])];
    return {
      text: `Redukujemy wyrazy podobne, dodając współczynniki: $${a}x+${b}x=(${a}+${b})x=${plNumber(a + b)}x$.`,
      value: `${plNumber(a + b)}x`,
    };
  }

  const twoVariables = content.match(
    /Oblicz wartość wyrażenia \$(\d+)a\+(\d+)b\$ dla \$a=(-?\d+)\$, \$b=(-?\d+)\$/,
  );
  if (twoVariables) {
    const [a, b, x, y] = [
      Number(twoVariables[1]),
      Number(twoVariables[2]),
      Number(twoVariables[3]),
      Number(twoVariables[4]),
    ];
    const value = a * x + b * y;
    return {
      text: `Podstawiamy $a=${plNumber(x)}$ i $b=${plNumber(y)}$: $${a}\\cdot${paren(x)}+${b}\\cdot${paren(y)}=${plNumber(a * x)}+${plNumber(b * y)}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  const square = content.match(/\$x\^2\s*([+-]\s*\d+)\$ dla \$x=(-?\d+)\$/);
  if (square) {
    const constant = Number((square[1] ?? "").replace(/\s+/g, ""));
    const x = Number(square[2]);
    const value = x * x + constant;
    return {
      text: `Podstawiamy $x=${plNumber(x)}$ do wyrażenia: $${paren(x)}^2${term(constant)}=${plNumber(x * x)}${term(constant)}=${plNumber(value)}$.`,
      value: plNumber(value, 4),
    };
  }

  return null;
};

const handleSquareOfSum: Handler = (content) => {
  const match = content.match(/\$\((\d+)\+(\d+)\)\^(\d+)\$/);
  if (!match) return null;
  const [a, b, exponent] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const sum = a + b;
  const value = sum ** exponent;
  const powerName = exponent === 2 ? "kwadratu" : exponent === 3 ? "sześcianu" : `${exponent}. potęgi`;
  return {
    text: `Najpierw obliczamy sumę w nawiasie: $${a}+${b}=${plNumber(sum)}$, a potem podnosimy do ${powerName}: $${plNumber(sum)}^{${exponent}}=${plNumber(value)}$.`,
    value: plNumber(value, 4),
  };
};

const handleKinematics: Handler = (content, answer) => handleSpeed(content, answer);

const handleShapes: Handler = (content, answer) => {
  return (
    handleGeometryArea(content, answer) ??
    handlePerimeter(content, answer) ??
    handleCircle(content, answer) ??
    handleSolid(content, answer) ??
    handleSphere(content, answer)
  );
};

const handleStatistics: Handler = (content, answer) => {
  return (
    handleMean(content, answer) ??
    handleMedian(content, answer) ??
    handleWeightedMean(content, answer) ??
    handleVariance(content, answer) ??
    handleAdvancedMedian(content, answer) ??
    handleExpectedValue(content, answer)
  );
};

/* -------------------------------------------------------------------------- */
/* Dispatch                                                                   */
/* -------------------------------------------------------------------------- */

const HANDLERS: Record<string, Handler> = {
  rownania: handleLinearEquation,
  rownania_liniowe: handleLinearEquation,
  nierownosci: handleInequality,
  rownania_kwadratowe: handleQuadraticEquation,
  uklady_rownan: handleSystem,
  funkcja_liniowa: handleLinearFunction,
  funkcja_kwadratowa: handleQuadraticFunction,
  funkcja_wykladnicza: handleExponentialFunction,
  logarytmy: (content, answer) =>
    handleLogarithms(content, answer) ?? handleLogFunction(content, answer),
  funkcja_logarytmiczna: handleLogFunction,
  ciag_arytmetyczny: handleArithmeticSequence,
  ciag_geometryczny: handleGeometricSequence,
  wyrazy_ciagu: handleSequenceTerm,
  proporcje: handleProportion,
  procenty: (content, answer) => handlePercent(content, answer),
  diagramy: handleChart,
  srednia: handleMean,
  statystyka: handleStatistics,
  mediana_i_dominanta: handleMedian,
  statystyka_zaawansowana: handleStatistics,
  prawdopodobienstwo: handleProbability,
  regula_mnozenia: handleMultiplicationRule,
  kombinatoryka: handleMultiplicationRule,
  potegi: handlePowers,
  pierwiastki: handleSquareRoot,
  podzielnosc: handleDivisibility,
  ulamki: handleFractions,
  kolejnosc_dzialan: handleOrderOfOperations,
  liczby_calkowite: handleIntegers,
  wartosc_bezwzgledna: handleAbsoluteValue,
  notacja_wykladnicza: handleScientificNotation,
  pola_figur: handleShapes,
  obwody: handleShapes,
  planimetria: (content, answer) =>
    handleGeometryArea(content, answer) ?? handlePythagoras(content, answer),
  okrag_i_kolo: handleCircle,
  pitagoras: handlePythagoras,
  pitagoras_i_podobienstwo: handlePythagoras,
  podobienstwo: handleSimilarity,
  katy: handleTriangleAngles,
  symetrie: handleSymmetry,
  punkty_na_plaszczyznie: handleQuadrant,
  bryly: handleSolid,
  objetosc_i_pole: handleSolid,
  stereometria: (content, answer) =>
    handleSolid(content, answer) ?? handleSphere(content, answer),
  wielokaty: (content, answer) =>
    handleGeometryArea(content, answer) ?? handlePerimeter(content, answer),
  zadania_tekstowe: (content, answer) =>
    handlePerimeter(content, answer) ??
    handlePercent(content, answer) ??
    handleSpeed(content, answer),
  czas_droga_predkosc: handleKinematics,
  jednostki_i_pieniadze: handleMoney,
  os_liczbowa: handleNumberLine,
  dlugosc_odcinka: handleDistance,
  geometria_analityczna: handleDistance,
  wykresy: handleGraph,
  odczyt_wykresu: handleGraphReading,
  proporcjonalnosc: handleDirectProportion,
  proporcjonalnosc_odwrotna: handleInverseProportion,
  wlasnosci_funkcji: handleZeroPlace,
  wyrazenia_algebraiczne: (content, answer) =>
    handleExpression(content, answer) ?? handleSquareOfSum(content, answer),
  wzory_skroconego_mnozenia: handleSquareOfSum,
  wielomiany: handlePolynomial,
  system_rzymski: handleRoman,
  zbiory_i_przedzialy: handleIntervals,
  sin_cos_tg: handleTrigonometry,
  twierdzenie_sinusow_cosinusow: handleTriangleTrig,
  zastosowania_trygonometrii: handlePythagoras,
  proste_i_odcinki: (content) => {
    if (/Ile końców ma odcinek/i.test(content)) {
      return {
        text: "Odcinek ma dwa końce — wyznaczają go dwa punkty $A$ i $B$, więc poprawna odpowiedź to dwa.",
        value: "dwa",
      };
    }
    if (/Czy proste równoległe mają punkt wspólny/i.test(content)) {
      return {
        text: "Proste równoległe leżą w tej samej płaszczyźnie, ale nie przecinają się, więc nie mają punktu wspólnego.",
        value: "nie",
      };
    }
    return null;
  },
};

/* -------------------------------------------------------------------------- */
/* API publiczne                                                              */
/* -------------------------------------------------------------------------- */

export function needsExplanationRepair(
  explanation: string | null | undefined,
): boolean {
  const text = (explanation ?? "").trim();
  if (text.length < MIN_EXPLANATION_LENGTH) return true;
  return (
    text.startsWith(GENERIC_EXPLANATION_PREFIX) ||
    text.startsWith(GENERIC_ROUNDING_PREFIX)
  );
}

function sanitizeExplanation(text: string): string {
  return repairMathSigns(text).replace(/[ \t]+/g, " ").trim();
}

/** Zwraca rozwiązanie krok po kroku wraz z informacją o spójności wyniku. */
export function explainTaskDetailed(
  content: string,
  answer: string,
  topic: string,
): TaskExplanation {
  const safeContent = typeof content === "string" ? content : "";
  const safeAnswer = typeof answer === "string" ? answer.trim() : "";
  const safeTopic = typeof topic === "string" ? topic : "";

  try {
    const repaired = repairMathSigns(safeContent);
    const handler = HANDLERS[safeTopic];
    const step = handler ? handler(repaired, safeAnswer) : null;

    if (step) {
      let text = sanitizeExplanation(step.text);
      if (text.length > 0 && text.length < MIN_EXPLANATION_LENGTH) {
        const plainAnswer = safeAnswer.replace(/\$/g, "").trim();
        text = sanitizeExplanation(
          `${text} ${plainAnswer ? `Wynik: ${plainAnswer}.` : "Wynik odczytujemy z obliczeń."}`,
        );
      }
      if (text.length >= MIN_EXPLANATION_LENGTH) {
        if (step.value !== null && !answersLookSame(step.value, safeAnswer)) {
          return {
            explanation: fallbackExplanation(safeTopic, repaired, safeAnswer),
            computed: step.value,
            consistent: false,
          };
        }
        return { explanation: text, computed: step.value, consistent: true };
      }
    }

    return {
      explanation: fallbackExplanation(safeTopic, repaired, safeAnswer),
      computed: null,
      consistent: true,
    };
  } catch {
    return {
      explanation: fallbackExplanation(safeTopic, safeContent, safeAnswer),
      computed: null,
      consistent: true,
    };
  }
}

/**
 * Krótkie, rzeczowe rozwiązanie zadania po polsku.
 * Nigdy nie rzuca wyjątku i nigdy nie zwraca pustego stringa.
 */
export function explainTask(
  content: string,
  answer: string,
  topic: string,
): string {
  return explainTaskDetailed(content, answer, topic).explanation;
}
