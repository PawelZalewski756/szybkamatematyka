/**
 * Generator zadań dla tematów uzupełniających luki CKE.
 *
 *   node scripts/generateCoverageTasks.mjs
 *
 * Tworzy po 20 zadań w data/tasks-cache dla każdego nowego tematu.
 * Zadania są deterministyczne (ziarno zależy od tematu i numeru zadania).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT_DIR = path.resolve(process.cwd(), "data/tasks-cache");

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

function num(value) {
  if (typeof value === "number" && Number.isInteger(value)) return String(value);
  return String(value).replace(".", ",");
}

function fillWrongs(correct, wrongs) {
  const result = [];
  for (const candidate of wrongs) {
    const text = String(candidate);
    if (text !== String(correct) && !result.includes(text)) result.push(text);
  }
  let step = 1;
  while (result.length < 3) {
    const numeric = Number(String(correct).replace(",", "."));
    const fallback = Number.isFinite(numeric)
      ? num(numeric + step)
      : `${String(correct)} + ${step}`;
    if (fallback !== String(correct) && !result.includes(fallback)) {
      result.push(fallback);
    }
    step += 1;
  }
  return result.slice(0, 3);
}

function makeTask(rng, spec, difficulty) {
  const correct = String(spec.correct);
  const wrongs = fillWrongs(correct, spec.wrongs);
  const options = shuffle(rng, [correct, ...wrongs]);
  return {
    content: spec.content,
    correct_answer: correct,
    options,
    answer_type: "choice",
    difficulty,
    xp_reward: 10 + difficulty * 4,
    explanation: spec.explanation,
    figure_svg: null,
    figure_caption: null,
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    model: "coverage-v1",
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
  for (let i = 0; i < 20; i += 1) {
    const rng = mulberry32(
      topic.topic.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 1009 +
        i * 7919,
    );
    const generator = topic.gens[i % topic.gens.length];
    const spec = generator(rng);
    const difficulty = i < 7 ? 1 : i < 14 ? 2 : 3;
    const task = makeTask(rng, spec, difficulty);
    task.id = deterministicId(topic, i);
    tasks.push(task);
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

const MATURA = [
  {
    exam_type: "matura_podstawowa",
    category: "optymalizacja",
    categoryName: "Optymalizacja",
    topic: "zadania_optymalizacyjne",
    topicName: "Zadania optymalizacyjne",
    gens: [
      (rng) => {
        const p = 4 * int(rng, 3, 10);
        const side = p / 4;
        return {
          content: `Prostokąt ma obwód $${p}$. Jaki jest bok kwadratu o największym polu przy tym obwodzie?`,
          correct: num(side),
          wrongs: [num(p / 2), num(p / 8), num(side + 1)],
          explanation: `Przy stałym obwodzie największe pole ma kwadrat. Bok to $\\frac{${p}}{4}=${num(side)}$.`,
        };
      },
      (rng) => {
        const s = 2 * int(rng, 4, 15);
        const best = (s / 2) ** 2;
        return {
          content: `Suma dwóch liczb wynosi $${s}$. Jaki jest największy możliwy iloczyn tych liczb?`,
          correct: num(best),
          wrongs: [num(s), num(best - s), num(best + 2)],
          explanation: `Iloczyn jest największy, gdy liczby są równe. Wynosi $\\left(\\frac{${s}}{2}\\right)^2=${num(best)}$.`,
        };
      },
      (rng) => {
        const b = 2 * int(rng, 3, 12);
        return {
          content: `Funkcja $P(x)=-x^2+${b}x$ opisuje pole pewnej figury. Dla jakiego $x$ pole jest największe?`,
          correct: num(b / 2),
          wrongs: [num(b), num(-b / 2), num(b / 4)],
          explanation: `Wierzchołek paraboli ma $x=\\frac{-b}{2a}=\\frac{-${b}}{-2}=${num(b / 2)}$.`,
        };
      },
      (rng) => {
        const p = int(rng, 2, 9);
        const q = int(rng, 5, 30);
        return {
          content: `Funkcja $f(x)=-(x-${p})^2+${q}$ ma największą wartość równą:`,
          correct: num(q),
          wrongs: [num(p), num(q + p), num(q - 1)],
          explanation: `Wyrażenie $-(x-${p})^2$ jest najwyżej równe $0$, więc największa wartość to $${q}$.`,
        };
      },
      (rng) => {
        const l = 4 * int(rng, 4, 10);
        return {
          content: `Ogród przylega do ściany. Na trzy boki mamy $${l}$ m siatki. Jaki jest największy możliwy bok prostopadły do ściany?`,
          correct: num(l / 4),
          wrongs: [num(l / 2), num(l / 3), num(l / 8)],
          explanation: `Bok prostopadły to $x$, bok równoległy $${l}-2x$. Pole $-2x^2+${l}x$ ma maksimum dla $x=\\frac{${l}}{4}=${num(l / 4)}$.`,
        };
      },
      (rng) => {
        const n = 2 * int(rng, 5, 20);
        return {
          content: `Przychód opisuje $R(x)=x(${n}-x)$. Dla jakiego $x$ przychód jest największy?`,
          correct: num(n / 2),
          wrongs: [num(n), num(n / 4), num(n - 1)],
          explanation: `Wierzchołek paraboli $R(x)=-x^2+${n}x$ ma $x=\\frac{${n}}{2}=${num(n / 2)}$.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "wielomiany",
    topicName: "Wielomiany i rozkład na czynniki",
    gens: [
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, 1, 5);
        const c = int(rng, 1, 9);
        return {
          content: `Podaj stopień wielomianu $W(x)=${a}x^{${b + 2}}-${c}x+1$.`,
          correct: String(b + 2),
          wrongs: [String(b + 1), String(b), String(b + 3)],
          explanation: `Stopień to najwyższa potęga $x$, czyli $${b + 2}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, -3, 3);
        const x = int(rng, 1, 4);
        const value = a * x ** 3 + b * x + 1;
        return {
          content: `Oblicz $W(${x})$ dla $W(x)=${a}x^3${b >= 0 ? "+" : ""}${b}x+1$.`,
          correct: String(value),
          wrongs: [String(value + 1), String(value - 1), String(a * x ** 3 + 1)],
          explanation: `Podstawiamy $x=${x}$: $${a}\\cdot${x}^3${b >= 0 ? "+" : ""}${b}\\cdot${x}+1=${value}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 8);
        return {
          content: `Rozłóż na czynniki $x^2-${a * a}$.`,
          correct: `(x-${a})(x+${a})`,
          wrongs: [`(x-${a})^2`, `(x+${a})^2`, `(x-${a * a})(x+1)`],
          explanation: `Różnica kwadratów: $x^2-${a * a}=(x-${a})(x+${a})$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        return {
          content: `Rozłóż na czynniki $x^3-${a * a}x$.`,
          correct: `x(x-${a})(x+${a})`,
          wrongs: [`x(x-${a})^2`, `x^2(x-${a})`, `x(x+${a})^2`],
          explanation: `Najpierw wyłączamy $x$, potem różnicę kwadratów: $x(x^2-${a * a})=x(x-${a})(x+${a})$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, -3, 3);
        const c = int(rng, 1, 9);
        const value = a * a + b * a + c;
        return {
          content: `Jaka jest reszta z dzielenia $W(x)=x^2${b >= 0 ? "+" : ""}${b}x+${c}$ przez $x-${a}$?`,
          correct: String(value),
          wrongs: [String(value + 1), String(value - 1), String(c)],
          explanation: `Z twierdzenia Bézouta reszta to $W(${a})=${a}^2${b >= 0 ? "+" : ""}${b}\\cdot${a}+${c}=${value}$.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    categoryName: "Algebra i równania",
    topic: "wyrazenia_wymierne",
    topicName: "Wyrażenia i równania wymierne",
    gens: [
      (rng) => {
        const a = int(rng, 2, 8);
        return {
          content: `Uprość $\\frac{x^2-${a * a}}{x-${a}}$ dla $x\\ne${a}$.`,
          correct: `x+${a}`,
          wrongs: [`x-${a}`, String(a), `x^2+${a}`],
          explanation: `Licznik to $(x-${a})(x+${a})$, więc po skróceniu zostaje $x+${a}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 9);
        return {
          content: `Podaj dziedzinę wyrażenia $\\frac{1}{x-${a}}$.`,
          correct: `x ≠ ${a}`,
          wrongs: [`x ≠ -${a}`, `x > ${a}`, `x ≥ ${a}`],
          explanation: `Mianownik nie może być zerem, więc $x-${a}\\ne0$, czyli $x\\ne${a}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const b = int(rng, 1, 5);
        return {
          content: `Rozwiąż $\\frac{x-${a}}{x+${b}}=0$.`,
          correct: `x=${a}`,
          wrongs: [`x=-${a}`, `x=${b}`, `x=-${b}`],
          explanation: `Licznik musi być zerem: $x-${a}=0$, więc $x=${a}$. Mianownik jest wtedy różny od zera.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 8);
        return {
          content: `Uprość $\\frac{x^2-${a * a}}{x+${a}}$ dla $x\\ne-${a}$.`,
          correct: `x-${a}`,
          wrongs: [`x+${a}`, String(a), `x^2-${a}`],
          explanation: `Licznik to $(x-${a})(x+${a})$, więc po skróceniu zostaje $x-${a}$.`,
        };
      },
      (rng) => {
        const a = 2 * int(rng, 2, 6);
        const b = int(rng, 1, 5);
        return {
          content: `Rozwiąż $\\frac{2x-${a}}{x+${b}}=0$.`,
          correct: `x=${num(a / 2)}`,
          wrongs: [`x=${a}`, `x=-${num(a / 2)}`, `x=${b}`],
          explanation: `Licznik musi być zerem: $2x-${a}=0$, więc $x=${num(a / 2)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        return {
          content: `Podaj dziedzinę wyrażenia $\\frac{x}{x^2-${a * a}}$.`,
          correct: `x ≠ -${a} i x ≠ ${a}`,
          wrongs: [`x ≠ ${a}`, `x ≠ -${a}`, `x ≠ ${a * a}`],
          explanation: `Mianownik to $(x-${a})(x+${a})$, więc $x\\ne-${a}$ i $x\\ne${a}$.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    categoryName: "Funkcje",
    topic: "funkcja_logarytmiczna",
    topicName: "Funkcja logarytmiczna",
    gens: [
      (rng) => {
        const a = int(rng, 2, 5);
        const k = int(rng, 1, 4);
        const value = a ** k;
        return {
          content: `Oblicz $\\log_{${a}} ${value}$.`,
          correct: String(k),
          wrongs: [String(k + 1), String(k - 1), String(value)],
          explanation: `Ponieważ $${a}^{${k}}=${value}$, więc $\\log_{${a}} ${value}=${k}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 4);
        const k = int(rng, 1, 3);
        return {
          content: `Oblicz $\\log_{${a}} \\frac{1}{${a ** k}}$.`,
          correct: `-${k}`,
          wrongs: [String(k), `-${k + 1}`, String(a ** k)],
          explanation: `$\\frac{1}{${a}^{${k}}}=${a}^{-${k}}$, więc logarytm wynosi $-${k}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const k = int(rng, 1, 4);
        return {
          content: `Rozwiąż $\\log_{${a}} x=${k}$.`,
          correct: String(a ** k),
          wrongs: [String(a * k), String(a ** (k + 1)), String(k ** a)],
          explanation: `Z definicji $x=${a}^{${k}}=${a ** k}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 1, 4);
        return {
          content: `Podaj dziedzinę funkcji $f(x)=\\log_{${a}}(x-${b})$.`,
          correct: `x>${b}`,
          wrongs: [`x ≥ ${b}`, `x > ${a}`, `x ≠ ${b}`],
          explanation: `Argument logarytmu musi być dodatni: $x-${b}>0$, więc $x>${b}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        return {
          content: `Oblicz $\\log_{${a}} 1+\\log_{${a}} ${a}$.`,
          correct: "1",
          wrongs: ["0", "2", String(a)],
          explanation: `$\\log_{${a}}1=0$ oraz $\\log_{${a}}${a}=1$, więc suma wynosi $1$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 4);
        const m = int(rng, 1, 3);
        const n = int(rng, 1, 3);
        return {
          content: `Oblicz $\\log_{${a}} ${a ** m}+\\log_{${a}} ${a ** n}$.`,
          correct: String(m + n),
          wrongs: [String(m * n), String(m + n + 1), String(a ** (m + n))],
          explanation: `$\\log_{${a}}${a}^{${m}}=${m}$ i $\\log_{${a}}${a}^{${n}}=${n}$, więc suma to $${m + n}$.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    categoryName: "Trygonometria",
    topic: "twierdzenie_sinusow_cosinusow",
    topicName: "Twierdzenie sinusów i cosinusów",
    gens: [
      (rng) => {
        const a = 2 * int(rng, 1, 4);
        const b = 2 * int(rng, 1, 4);
        const angle = pick(rng, [30, 60, 90]);
        const ab = a * b;
        const quarter = ab / 4;
        const correct =
          angle === 90 ? num(ab / 2) : angle === 30 ? num(quarter) : `$${quarter}\\sqrt3$`;
        const wrongs =
          angle === 90
            ? [num(ab), num(quarter), num(ab / 2 + 1)]
            : angle === 30
              ? [num(ab / 2), num(quarter + 1), num(ab / 8)]
              : [`$${ab / 2}$`, `$${quarter}\\sqrt2$`, `$${quarter + 1}\\sqrt3$`];
        const display = correct.replace(/\$/g, "");
        return {
          content: `Trójkąt ma boki $${a}$ i $${b}$, a kąt między nimi wynosi $${angle}^\\circ$. Oblicz jego pole.`,
          correct,
          wrongs,
          explanation: `Pole $P=\\frac12\\cdot${a}\\cdot${b}\\cdot\\sin${angle}^\\circ=${display}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = int(rng, 2, 6);
        const angle = pick(rng, [60, 90, 120]);
        const c2 = a * a + b * b - 2 * a * b * (angle === 60 ? 0.5 : angle === 90 ? 0 : -0.5);
        return {
          content: `W trójkącie boki $${a}$ i $${b}$ tworzą kąt $${angle}^\\circ$. Oblicz $c^2$, gdzie $c$ jest trzecim bokiem.`,
          correct: num(c2),
          wrongs: [num(a * a + b * b), num(c2 + 2), num(c2 - 2)],
          explanation: `Z twierdzenia cosinusów $c^2=${a}^2+${b}^2-2\\cdot${a}\\cdot${b}\\cdot\\cos${angle}^\\circ=${num(c2)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        return {
          content: `W trójkącie $a=${a}$, $\\alpha=30^\\circ$, $\\beta=90^\\circ$. Oblicz $b$.`,
          correct: String(2 * a),
          wrongs: [String(a), String(a * a), String(a / 2)],
          explanation: `Z twierdzenia sinusów $\\frac{a}{\\sin30^\\circ}=\\frac{b}{\\sin90^\\circ}$, więc $b=2a=${2 * a}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 5);
        const c2 = a * a + b * b;
        return {
          content: `W trójkącie prostokątnym przyprostokątne mają $${a}$ i $${b}$. Oblicz kwadrat przeciwprostokątnej.`,
          correct: String(c2),
          wrongs: [String(a + b), String(c2 + 1), String(a * b)],
          explanation: `Z twierdzenia Pitagorasa $c^2=${a}^2+${b}^2=${c2}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 5);
        return {
          content: `W trójkącie boki $${a}$ i $${b}$ tworzą kąt $90^\\circ$. Oblicz pole.`,
          correct: num((a * b) / 2),
          wrongs: [String(a * b), String(a + b), num((a * b) / 2 + 1)],
          explanation: `Pole $P=\\frac12\\cdot${a}\\cdot${b}=${num((a * b) / 2)}$.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    categoryName: "Geometria",
    topic: "tales_dwusieczna_okrag",
    topicName: "Twierdzenie Talesa, dwusieczna i okrąg wpisany",
    gens: [
      (rng) => {
        const a = int(rng, 2, 5);
        const b = a * int(rng, 2, 4);
        const c = int(rng, 2, 6);
        const x = (b * c) / a;
        return {
          content: `Proste równoległe przecinają ramiona kąta. Na jednym ramieniu odcinki mają $${a}$ i $${b}$, a na drugim pierwszy odcinek ma $${c}$. Oblicz drugi odcinek $x$.`,
          correct: num(x),
          wrongs: [num(a + c), num(b - c), num(x + 1)],
          explanation: `Z twierdzenia Talesa $\\frac{${a}}{${b}}=\\frac{${c}}{x}$, więc $x=${num(x)}$.`,
        };
      },
      (rng) => {
        const ab = 2 * int(rng, 2, 5);
        const ac = 3 * int(rng, 2, 5);
        const bc = 2 * (ab + ac);
        const bd = 2 * ab;
        return {
          content: `W trójkącie $|AB|=${ab}$, $|AC|=${ac}$, $|BC|=${bc}$. Dwusieczna z wierzchołka $A$ dzieli $BC$. Oblicz $|BD|$.`,
          correct: num(bd),
          wrongs: [num(bc - bd), num(ab), num(ac)],
          explanation: `Z twierdzenia o dwusiecznej $\\frac{|BD|}{|DC|}=\\frac{${ab}}{${ac}}$. Stąd $|BD|=${num(bd)}$.`,
        };
      },
      (rng) => {
        const central = 2 * int(rng, 20, 80);
        return {
          content: `Kąt środkowy ma $${central}^\\circ$. Oblicz kąt wpisany oparty na tym samym łuku.`,
          correct: String(central / 2),
          wrongs: [String(central), String(central * 2), String(central / 4)],
          explanation: `Kąt wpisany jest dwa razy mniejszy od środkowego, więc ma $${central / 2}^\\circ$.`,
        };
      },
      (rng) => {
        const inscribed = int(rng, 15, 60);
        return {
          content: `Kąt wpisany ma $${inscribed}^\\circ$. Oblicz kąt środkowy oparty na tym samym łuku.`,
          correct: String(2 * inscribed),
          wrongs: [String(inscribed), String(inscribed * 4), String(inscribed + 10)],
          explanation: `Kąt środkowy jest dwa razy większy, więc ma $${2 * inscribed}^\\circ$.`,
        };
      },
      (rng) => {
        const n = int(rng, 3, 8);
        return {
          content: `Oblicz miarę kąta wewnętrznego wielokąta foremnego o $${n}$ bokach.`,
          correct: String(((n - 2) * 180) / n),
          wrongs: [String(((n - 2) * 180) / (n + 1)), String((n * 180) / n), String(180 - 360 / n)],
          explanation: `Kąt foremny to $\\frac{(${n}-2)\\cdot180^\\circ}{${n}}=${((n - 2) * 180) / n}^\\circ$.`,
        };
      },
      (rng) => {
        const n = int(rng, 4, 10);
        return {
          content: `Ile przekątnych ma $${n}$-kąt?`,
          correct: String((n * (n - 3)) / 2),
          wrongs: [String(n), String(n * (n - 3)), String((n * (n - 1)) / 2)],
          explanation: `Liczba przekątnych to $\\frac{${n}(${n}-3)}{2}=${(n * (n - 3)) / 2}$.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    categoryName: "Kombinatoryka i statystyka",
    topic: "statystyka_zaawansowana",
    topicName: "Statystyka opisowa: średnia ważona i odchylenie",
    gens: [
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 5);
        const c = int(rng, 2, 5);
        const wa = int(rng, 1, 3);
        const wb = int(rng, 1, 3);
        const wc = int(rng, 1, 3);
        const result = (a * wa + b * wb + c * wc) / (wa + wb + wc);
        return {
          content: `Oblicz średnią ważoną: $${a}$ (waga $${wa}$), $${b}$ (waga $${wb}$), $${c}$ (waga $${wc}$).`,
          correct: num(Math.round(result * 100) / 100),
          wrongs: [num(Math.round(((a + b + c) / 3) * 100) / 100), num(result + 1), num(result - 1)],
          explanation: `Średnia ważona to $\\frac{${a}\\cdot${wa}+${b}\\cdot${wb}+${c}\\cdot${wc}}{${wa + wb + wc}}=${num(Math.round(result * 100) / 100)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 3);
        const b = a + 2;
        const c = b + 2;
        const mean = (a + b + c) / 3;
        const variance = ((a - mean) ** 2 + (b - mean) ** 2 + (c - mean) ** 2) / 3;
        return {
          content: `Oblicz wariancję danych $${a},${b},${c}$.`,
          correct: num(Math.round(variance * 100) / 100),
          wrongs: [num(Math.round((variance + 1) * 100) / 100), num(mean), num(Math.round((variance * 2) * 100) / 100)],
          explanation: `Średnia to $${num(mean)}$, a wariancja $${num(Math.round(variance * 100) / 100)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const d = int(rng, 1, 3);
        const data = [a, a + d, a + 2 * d, a + 3 * d];
        const mean = a + 1.5 * d;
        const variance = ((data[0] - mean) ** 2 + (data[1] - mean) ** 2 + (data[2] - mean) ** 2 + (data[3] - mean) ** 2) / 4;
        const sd = Math.sqrt(variance);
        return {
          content: `Oblicz odchylenie standardowe danych $${data.join(",")}$.`,
          correct: num(Math.round(sd * 100) / 100),
          wrongs: [num(Math.round(variance * 100) / 100), num(Math.round((sd + 1) * 100) / 100), num(Math.round((sd - 1) * 100) / 100)],
          explanation: `Wariancja wynosi $${num(Math.round(variance * 100) / 100)}$, więc odchylenie to $${num(Math.round(sd * 100) / 100)}$.`,
        };
      },
      (rng) => {
        const win = int(rng, 5, 20);
        const prob = pick(rng, [0.2, 0.25, 0.5]);
        const ev = win * prob;
        return {
          content: `W grze wygrywasz $${win}$ zł z prawdopodobieństwem $${num(prob)}$ i $0$ zł w pozostałych przypadkach. Oblicz wartość oczekiwaną.`,
          correct: num(ev),
          wrongs: [num(win), num(ev + 1), num(win / 2)],
          explanation: `$E(X)=${win}\\cdot${num(prob)}+0=${num(ev)}$ zł.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 4);
        const b = int(rng, 4, 7);
        const c = int(rng, 5, 9);
        return {
          content: `Oblicz medianę danych $${c},${a},${b},${b},${a + 1}$.`,
          correct: String(b),
          wrongs: [String(a), String(c), String(a + 1)],
          explanation: `Po uporządkowaniu środek to $${b}$.`,
        };
      },
      (rng) => {
        const p = int(rng, 60, 95);
        return {
          content: `Wynik ucznia znajduje się na $${p}$. centylu. Co to oznacza?`,
          correct: `około ${p}% wyników jest niższych lub równych`,
          wrongs: [`uczeń ma ${p}% poprawnych odpowiedzi`, `wynik jest ${p} razy lepszy od średniej`, `uczeń jest w top ${p}%`],
          explanation: `Centyl opisuje położenie wyniku względem pozostałych, a nie procent poprawnych odpowiedzi.`,
        };
      },
    ],
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    categoryName: "Funkcje",
    topic: "proporcjonalnosc_odwrotna",
    topicName: "Proporcjonalność odwrotna i funkcja f(x)=a/x",
    gens: [
      (rng) => {
        const x = int(rng, 2, 6);
        const y = int(rng, 2, 8);
        const a = x * y;
        return {
          content: `Wielkości są odwrotnie proporcjonalne i $y=\\frac{${a}}{x}$. Oblicz $y$ dla $x=${x}$.`,
          correct: String(y),
          wrongs: [String(a - x), String(a + x), String(y + 1)],
          explanation: `$y=\\frac{${a}}{${x}}=${y}$.`,
        };
      },
      (rng) => {
        const x = int(rng, 2, 6);
        const y = int(rng, 2, 8);
        const a = x * y;
        return {
          content: `Wielkości są odwrotnie proporcjonalne i $y=\\frac{${a}}{x}$. Oblicz $x$ dla $y=${y}$.`,
          correct: String(x),
          wrongs: [String(a - y), String(a + y), String(x + 1)],
          explanation: `$x=\\frac{${a}}{${y}}=${x}$.`,
        };
      },
      (rng) => {
        const x1 = int(rng, 2, 5);
        const y1 = int(rng, 2, 6);
        const a = x1 * y1;
        const divisors = [2, 3, 4, 5, 6].filter((d) => a % d === 0 && d !== x1);
        const x2 = pick(rng, divisors.length > 0 ? divisors : [2, 3, 6]);
        return {
          content: `Wielkości są odwrotnie proporcjonalne. Dla $x=${x1}$ mamy $y=${y1}$. Oblicz $y$ dla $x=${x2}$.`,
          correct: num(a / x2),
          wrongs: [num(a * x2), num(y1 + x2), num(a / x2 + 1)],
          explanation: `Stała $a=${x1}\\cdot${y1}=${a}$, więc $y=\\frac{${a}}{${x2}}=${num(a / x2)}$.`,
        };
      },
      (rng) => {
        const n1 = int(rng, 4, 10);
        const d1 = int(rng, 2, 8);
        const n2 = int(rng, 2, 6);
        const total = n1 * d1;
        return {
          content: `${n1} pracowników wykona pracę w ${d1} dni. W ilu dniach wykona ją ${n2} pracowników, jeśli tempo pracy jest takie samo?`,
          correct: num(total / n2),
          wrongs: [num(d1), num(total * n2), num(total / n2 + 1)],
          explanation: `Iloczyn jest stały: $${n1}\\cdot${d1}=${total}$, więc czas to $\\frac{${total}}{${n2}}=${num(total / n2)}$ dni.`,
        };
      },
      () => ({
        content: `Podaj dziedzinę funkcji $f(x)=\\frac{7}{x}$.`,
        correct: "x ≠ 0",
        wrongs: ["x > 0", "x ≥ 0", "x ≠ 7"],
        explanation: "Mianownik nie może być zerem, więc $x\\ne0$.",
      }),
      () => ({
        content: `Jak nazywa się wykres funkcji $f(x)=\\frac{a}{x}$ dla $a\\ne0$?`,
        correct: "hiperbola",
        wrongs: ["parabola", "prosta", "okrąg"],
        explanation: "Wykresem funkcji $f(x)=a/x$ jest hiperbola.",
      }),
    ],
  },
];

const E8 = [
  {
    exam_type: "8_klasa",
    category: "liczby",
    categoryName: "Liczby i działania",
    topic: "notacja_wykladnicza",
    topicName: "Notacja wykładnicza",
    gens: [
      (rng) => {
        const a = int(rng, 1, 9);
        const n = int(rng, 2, 5);
        const value = a * 10 ** n;
        return {
          content: `Zapisz liczbę $${value}$ w notacji wykładniczej.`,
          correct: `$${a}\\cdot10^${n}$`,
          wrongs: [`$${a}\\cdot10^${n + 1}$`, `$${a}\\cdot10^${n - 1}$`, `$${a + 1}\\cdot10^${n}$`],
          explanation: `Przesuwamy przecinek, aż współczynnik będzie od 1 do 10: $${value}=${a}\\cdot10^${n}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 9);
        const n = int(rng, 2, 5);
        const value = a / 10 ** n;
        return {
          content: `Zapisz liczbę $${num(value)}$ w notacji wykładniczej.`,
          correct: `$${a}\\cdot10^{-${n}}$`,
          wrongs: [`$${a}\\cdot10^${n}$`, `$${a}\\cdot10^{-${n + 1}}$`, `$${a + 1}\\cdot10^{-${n}}$`],
          explanation: `Przesuwamy przecinek w prawo o ${n} miejsc: $${num(value)}=${a}\\cdot10^{-${n}}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 9);
        const n = int(rng, 2, 4);
        return {
          content: `Zamień $${a}\\cdot10^${n}$ na zwykły zapis.`,
          correct: String(a * 10 ** n),
          wrongs: [String(a * 10 ** (n + 1)), String(a * 10 ** (n - 1)), String(a + 10 ** n)],
          explanation: `$${a}\\cdot10^${n}=${a * 10 ** n}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 5);
        const m = int(rng, 2, 4);
        const n = int(rng, 2, 4);
        return {
          content: `Oblicz $(${a}\\cdot10^${m})\\cdot(${b}\\cdot10^${n})$.`,
          correct: `$${a * b}\\cdot10^${m + n}$`,
          wrongs: [`$${a * b}\\cdot10^${m * n}$`, `$${a + b}\\cdot10^${m + n}$`, `$${a * b}\\cdot10^${m + n + 1}$`],
          explanation: `Mnożymy współczynniki i dodajemy wykładniki: $${a * b}\\cdot10^${m + n}$.`,
        };
      },
      (rng) => {
        const b = int(rng, 2, 4);
        const a = b * int(rng, 2, 4);
        const m = int(rng, 3, 6);
        const n = int(rng, 1, 2);
        return {
          content: `Oblicz $\\frac{${a}\\cdot10^${m}}{${b}\\cdot10^${n}}$.`,
          correct: `$${a / b}\\cdot10^${m - n}$`,
          wrongs: [`$${a / b}\\cdot10^${m + n}$`, `$${a - b}\\cdot10^${m - n}$`, `$${a / b}\\cdot10^${m - n + 1}$`],
          explanation: `Dzielimy współczynniki i odejmujemy wykładniki: $${a / b}\\cdot10^${m - n}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 5);
        let b = int(rng, 1, 5);
        if (b === a) b = a === 5 ? 4 : a + 1;
        const n = int(rng, 2, 4);
        const bigger = Math.max(a, b);
        return {
          content: `Która liczba jest większa: $${a}\\cdot10^${n}$ czy $${b}\\cdot10^${n}$?`,
          correct: `$${bigger}\\cdot10^${n}$`,
          wrongs: [`$${Math.min(a, b)}\\cdot10^${n}$`, `$${a + b}\\cdot10^${n}$`, `$${a}\\cdot10^${n + 1}$`],
          explanation: `Przy tej samej potędze dziesiątki większy jest większy współczynnik: $${bigger}\\cdot10^${n}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    categoryName: "Obliczenia praktyczne",
    topic: "czas_droga_predkosc",
    topicName: "Czas, droga i prędkość",
    gens: [
      (rng) => {
        const v = 10 * int(rng, 3, 12);
        const t = int(rng, 1, 5);
        return {
          content: `Samochód jedzie $${v}$ km/h przez $${t}$ h. Jaką drogę pokona?`,
          correct: `${v * t} km`,
          wrongs: [`${v + t} km`, `${v * 2} km`, `${v * t + 10} km`],
          explanation: `$s=v\\cdot t=${v}\\cdot${t}=${v * t}$ km.`,
        };
      },
      (rng) => {
        const t = int(rng, 2, 5);
        const v = 10 * int(rng, 3, 12);
        const s = t * v;
        return {
          content: `Samochód przejechał $${s}$ km w $${t}$ h. Jaka była jego prędkość?`,
          correct: `${v} km/h`,
          wrongs: [`${s * t} km/h`, `${s + t} km/h`, `${v + 10} km/h`],
          explanation: `$v=\\frac{s}{t}=\\frac{${s}}{${t}}=${v}$ km/h.`,
        };
      },
      (rng) => {
        const v = 10 * int(rng, 3, 8);
        const t = int(rng, 2, 6);
        const s = v * t;
        return {
          content: `Ile czasu potrzeba na przejechanie $${s}$ km z prędkością $${v}$ km/h?`,
          correct: `${t} h`,
          wrongs: [`${s * v} h`, `${t + 1} h`, `${num(v / s)} h`],
          explanation: `$t=\\frac{s}{v}=\\frac{${s}}{${v}}=${t}$ h.`,
        };
      },
      (rng) => {
        const v = 18 * int(rng, 2, 5);
        return {
          content: `Zamień $${v}$ km/h na m/s.`,
          correct: `${num(v / 3.6)} m/s`,
          wrongs: [`${num(v * 3.6)} m/s`, `${v} m/s`, `${num(v / 3.6 + 1)} m/s`],
          explanation: `Dzielimy przez $3{,}6$: $${v}:3{,}6=${num(v / 3.6)}$ m/s.`,
        };
      },
      (rng) => {
        const m = int(rng, 2, 5) * 15;
        return {
          content: `Ile to $${m}$ minut w godzinach?`,
          correct: `${num(m / 60)} h`,
          wrongs: [`${m} h`, `${num(m / 30)} h`, `${m * 60} h`],
          explanation: `$${m}$ min $=\\frac{${m}}{60}=${num(m / 60)}$ h.`,
        };
      },
      (rng) => {
        const v = 12 * int(rng, 2, 4);
        const m = 15 * int(rng, 1, 3);
        const d = (v * m) / 60;
        return {
          content: `Rowerzysta jedzie $${v}$ km/h przez $${m}$ minut. Jaką drogę pokona?`,
          correct: `${num(d)} km`,
          wrongs: [`${v * m} km`, `${num(d + 1)} km`, `${num(v / 60)} km`],
          explanation: `$${m}$ min $=${num(m / 60)}$ h, więc $s=${v}\\cdot${num(m / 60)}=${num(d)}$ km.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    categoryName: "Obliczenia praktyczne",
    topic: "jednostki_i_pieniadze",
    topicName: "Jednostki, czas i pieniądze",
    gens: [
      (rng) => {
        const kg = int(rng, 1, 9) + pick(rng, [0.2, 0.5, 0.25]);
        return {
          content: `Zamień $${num(kg)}$ kg na gramy.`,
          correct: `${num(kg * 1000)} g`,
          wrongs: [`${num(kg * 100)} g`, `${num(kg)} g`, `${num(kg * 10000)} g`],
          explanation: `$1$ kg $=1000$ g, więc $${num(kg)}$ kg $=${num(kg * 1000)}$ g.`,
        };
      },
      (rng) => {
        const m = int(rng, 2, 9);
        const cm = int(rng, 1, 9) * 10;
        return {
          content: `Zamień $${m}$ m $${cm}$ cm na centymetry.`,
          correct: `${m * 100 + cm} cm`,
          wrongs: [`${m * 10 + cm} cm`, `${m + cm} cm`, `${m * 1000 + cm} cm`],
          explanation: `$1$ m $=100$ cm, więc $${m}$ m $${cm}$ cm $=${m * 100 + cm}$ cm.`,
        };
      },
      (rng) => {
        const h = int(rng, 1, 4);
        const min = int(rng, 1, 11) * 5;
        return {
          content: `Ile minut ma $${h}$ h $${min}$ min?`,
          correct: `${h * 60 + min} min`,
          wrongs: [`${h * 100 + min} min`, `${h + min} min`, `${h * 60} min`],
          explanation: `$${h}$ h $=${h * 60}$ min, razem $${h * 60 + min}$ min.`,
        };
      },
      (rng) => {
        const price = int(rng, 3, 12);
        const n = int(rng, 2, 8);
        return {
          content: `Kupiono $${n}$ zeszytów po $${price}$ zł. Ile zapłacono?`,
          correct: `${price * n} zł`,
          wrongs: [`${price + n} zł`, `${price * n + 10} zł`, `${price} zł`],
          explanation: `Koszt to $${n}\\cdot${price}=${price * n}$ zł.`,
        };
      },
      (rng) => {
        const cost = int(rng, 20, 80);
        const paid = Math.ceil((cost + 5) / 10) * 10;
        return {
          content: `Zakupy kosztowały $${cost}$ zł. Zapłacono $${paid}$ zł. Ile wynosi reszta?`,
          correct: `${paid - cost} zł`,
          wrongs: [`${cost} zł`, `${paid + cost} zł`, `${paid - cost + 5} zł`],
          explanation: `Reszta to $${paid}-${cost}=${paid - cost}$ zł.`,
        };
      },
      (rng) => {
        const kg = int(rng, 1, 4) + pick(rng, [0, 0.5]);
        const price = int(rng, 3, 10);
        const total = kg * price;
        return {
          content: `$${num(kg)}$ kg jabłek kosztuje $${num(total)}$ zł. Jaka jest cena za kilogram?`,
          correct: `${price} zł`,
          wrongs: [`${num(total)} zł`, `${num(total + 1)} zł`, `${num(price / 2)} zł`],
          explanation: `Cena za kilogram to $${num(total)}:${num(kg)}=${price}$ zł.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "zadania_tekstowe",
    categoryName: "Zadania tekstowe",
    topic: "zadania_tekstowe",
    topicName: "Zadania tekstowe z treścią",
    gens: [
      (rng) => {
        const money = int(rng, 100, 200);
        const n = int(rng, 2, 5);
        const price = int(rng, 10, 25);
        return {
          content: `Ania ma $${money}$ zł. Kupiła $${n}$ biletów po $${price}$ zł. Ile jej zostało?`,
          correct: `${money - n * price} zł`,
          wrongs: [`${money + n * price} zł`, `${n * price} zł`, `${money - price} zł`],
          explanation: `Koszt biletów to $${n}\\cdot${price}=${n * price}$ zł, reszta $${money}-${n * price}=${money - n * price}$ zł.`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 10);
        const b = int(rng, 4, 12);
        return {
          content: `Prostokąt ma boki $${a}$ cm i $${b}$ cm. Oblicz jego obwód.`,
          correct: `${2 * (a + b)} cm`,
          wrongs: [`${a * b} cm`, `${a + b} cm`, `${2 * a + b} cm`],
          explanation: `Obwód to $2(${a}+${b})=${2 * (a + b)}$ cm.`,
        };
      },
      (rng) => {
        const total = 20 + 4 * int(rng, 1, 5);
        const percent = pick(rng, [25, 50]);
        return {
          content: `W klasie jest $${total}$ uczniów, z czego $${percent}\\%$ to chłopcy. Ilu chłopców jest w klasie?`,
          correct: String((total * percent) / 100),
          wrongs: [String(total - (total * percent) / 100), String(percent), String(total)],
          explanation: `$${percent}\\%$ z $${total}$ to $${(total * percent) / 100}$.`,
        };
      },
      (rng) => {
        const s = 20 * int(rng, 5, 12);
        const t = int(rng, 2, 5);
        return {
          content: `Samochód przejechał $${s}$ km w $${t}$ h. Jaka była jego prędkość?`,
          correct: `${s / t} km/h`,
          wrongs: [`${s * t} km/h`, `${s + t} km/h`, `${s / t + 10} km/h`],
          explanation: `$v=${s}:${t}=${s / t}$ km/h.`,
        };
      },
      (rng) => {
        const a = int(rng, 5, 12);
        const b = int(rng, 6, 15);
        return {
          content: `Ogród ma $${a}$ m na $${b}$ m. Ile metrów siatki potrzeba na ogrodzenie?`,
          correct: `${2 * (a + b)} m`,
          wrongs: [`${a * b} m`, `${a + b} m`, `${2 * a + b} m`],
          explanation: `Obwód to $2(${a}+${b})=${2 * (a + b)}$ m.`,
        };
      },
      (rng) => {
        const price = 10 * int(rng, 4, 9);
        const discount = pick(rng, [10, 20, 25, 50]);
        return {
          content: `Książka kosztowała $${price}$ zł. Po obniżce o $${discount}\\%$ jej cena wynosi:`,
          correct: `${num(price - (price * discount) / 100)} zł`,
          wrongs: [`${num(price + (price * discount) / 100)} zł`, `${discount} zł`, `${price} zł`],
          explanation: `Obniżka to $${(price * discount) / 100}$ zł, więc nowa cena to $${num(price - (price * discount) / 100)}$ zł.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    categoryName: "Geometria płaska",
    topic: "symetralna_i_dwusieczna",
    topicName: "Symetralna i dwusieczna",
    gens: [
      (rng) => {
        const a = 2 * int(rng, 2, 8);
        return {
          content: `Odcinek $AB$ ma $${a}$ cm. Symetralna dzieli go na połowy. Jaką długość ma każda połowa?`,
          correct: `${a / 2} cm`,
          wrongs: [`${a} cm`, `${a * 2} cm`, `${a / 4} cm`],
          explanation: `Symetralna przechodzi przez środek, więc każda połowa ma $${a / 2}$ cm.`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 12);
        return {
          content: `Punkt $P$ leży na symetralnej odcinka $AB$ i $|PA|=${a}$ cm. Ile wynosi $|PB|$?`,
          correct: `${a} cm`,
          wrongs: [`${a * 2} cm`, `${a / 2} cm`, `${a + 1} cm`],
          explanation: `Punkty symetralnej są jednakowo odległe od końców, więc $|PB|=${a}$ cm.`,
        };
      },
      (rng) => {
        const angle = 2 * int(rng, 20, 80);
        return {
          content: `Kąt $${angle}^\\circ$ dzieli dwusieczna. Jaką miarę ma każdy z mniejszych kątów?`,
          correct: `${angle / 2}°`,
          wrongs: [`${angle}°`, `${angle * 2}°`, `${angle / 4}°`],
          explanation: `Dwusieczna dzieli kąt na połowy, więc każdy ma $${angle / 2}^\\circ$.`,
        };
      },
      (rng) => {
        const ab = 2 * int(rng, 2, 5);
        const ac = 3 * int(rng, 2, 5);
        const bc = 2 * (ab + ac);
        const bd = 2 * ab;
        return {
          content: `W trójkącie $|AB|=${ab}$, $|AC|=${ac}$, $|BC|=${bc}$. Dwusieczna z $A$ dzieli $BC$. Oblicz $|BD|$.`,
          correct: num(bd),
          wrongs: [num(bc - bd), num(ab), num(ac)],
          explanation: `$\\frac{|BD|}{|DC|}=\\frac{${ab}}{${ac}}$, więc $|BD|=${num(bd)}$.`,
        };
      },
      () => ({
          content: `Gdzie leży środek okręgu wpisanego w trójkąt?`,
          correct: "w przecięciu dwusiecznych kątów",
          wrongs: ["w przecięciu symetralnych boków", "w przecięciu wysokości", "w przecięciu środkowych"],
          explanation: `Środek okręgu wpisanego to przecięcie dwusiecznych kątów.`,
        }),
      () => ({
          content: `Gdzie leży środek okręgu opisanego na trójkącie?`,
          correct: "w przecięciu symetralnych boków",
          wrongs: ["w przecięciu dwusiecznych kątów", "w przecięciu wysokości", "w przecięciu środkowych"],
          explanation: `Środek okręgu opisanego to przecięcie symetralnych boków.`,
        }),
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    categoryName: "Geometria płaska",
    topic: "wielokaty",
    topicName: "Wielokąty i wielokąty foremne",
    gens: [
      (rng) => {
        const n = int(rng, 3, 10);
        return {
          content: `Oblicz sumę kątów wewnętrznych $${n}$-kąta.`,
          correct: `${(n - 2) * 180}°`,
          wrongs: [`${n * 180}°`, `${(n - 1) * 180}°`, `${(n - 2) * 90}°`],
          explanation: `Suma wynosi $(${n}-2)\\cdot180^\\circ=${(n - 2) * 180}^\\circ$.`,
        };
      },
      (rng) => {
        const n = int(rng, 3, 10);
        const value = ((n - 2) * 180) / n;
        return {
          content: `Oblicz miarę kąta wewnętrznego wielokąta foremnego o $${n}$ bokach.`,
          correct: `${num(value)}°`,
          wrongs: [`${num(value + 10)}°`, `${num(value - 10)}°`, `${(n * 180) / n}°`],
          explanation: `Kąt to $\\frac{(${n}-2)\\cdot180^\\circ}{${n}}=${num(value)}^\\circ$.`,
        };
      },
      (rng) => {
        const n = int(rng, 4, 10);
        return {
          content: `Ile przekątnych ma $${n}$-kąt?`,
          correct: String((n * (n - 3)) / 2),
          wrongs: [String(n), String(n * (n - 3)), String((n * (n - 1)) / 2)],
          explanation: `Liczba przekątnych to $\\frac{${n}(${n}-3)}{2}=${(n * (n - 3)) / 2}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 6);
        const b = a + 2 * int(rng, 1, 4);
        const h = int(rng, 2, 6);
        return {
          content: `Trapez ma podstawy $${a}$ cm i $${b}$ cm oraz wysokość $${h}$ cm. Oblicz pole.`,
          correct: `${((a + b) * h) / 2} cm²`,
          wrongs: [`${(a + b) * h} cm²`, `${a * b} cm²`, `${((a + b) * h) / 2 + 2} cm²`],
          explanation: `Pole to $\\frac12(${a}+${b})\\cdot${h}=${((a + b) * h) / 2}$ cm².`,
        };
      },
      (rng) => {
        const d1 = 2 * int(rng, 2, 5);
        const d2 = 2 * int(rng, 2, 5);
        return {
          content: `Romb ma przekątne $${d1}$ cm i $${d2}$ cm. Oblicz pole.`,
          correct: `${(d1 * d2) / 2} cm²`,
          wrongs: [`${d1 * d2} cm²`, `${d1 + d2} cm²`, `${(d1 * d2) / 2 + 2} cm²`],
          explanation: `Pole rombu to $\\frac12\\cdot${d1}\\cdot${d2}=${(d1 * d2) / 2}$ cm².`,
        };
      },
      (rng) => {
        const a = int(rng, 3, 9);
        const b = int(rng, 4, 10);
        const c = int(rng, 5, 12);
        return {
          content: `Oblicz obwód trójkąta o bokach $${a}$ cm, $${b}$ cm i $${c}$ cm.`,
          correct: `${a + b + c} cm`,
          wrongs: [`${a * b * c} cm`, `${a + b} cm`, `${a + b + c + 2} cm`],
          explanation: `Obwód to suma boków: $${a}+${b}+${c}=${a + b + c}$ cm.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    categoryName: "Geometria płaska",
    topic: "proste_i_odcinki",
    topicName: "Proste, półproste i odcinki",
    gens: [
      () => ({
        content: "Ile końców ma półprosta?",
        correct: "jeden",
        wrongs: ["dwa", "zero", "trzy"],
        explanation: "Półprosta ma początek, ale nie ma końca.",
      }),
      () => ({
        content: "Ile końców ma odcinek?",
        correct: "dwa",
        wrongs: ["jeden", "zero", "trzy"],
        explanation: "Odcinek ma dwa końce.",
      }),
      (rng) => {
        const a = 2 * int(rng, 3, 10);
        return {
          content: `Odcinek ma $${a}$ cm. Jego środek dzieli go na dwie równe części. Jaką długość ma każda część?`,
          correct: `${a / 2} cm`,
          wrongs: [`${a} cm`, `${a * 2} cm`, `${a / 4} cm`],
          explanation: `Środek dzieli odcinek na połowy, więc każda ma $${a / 2}$ cm.`,
        };
      },
      () => ({
        content: "Pod jakim kątem przecinają się proste prostopadłe?",
        correct: "90°",
        wrongs: ["180°", "45°", "60°"],
        explanation: "Proste prostopadłe przecinają się pod kątem 90°.",
      }),
      () => ({
        content: "Czy proste równoległe mają punkt wspólny?",
        correct: "nie",
        wrongs: ["tak, jeden", "tak, dwa", "tak, nieskończenie wiele"],
        explanation: "Proste równoległe nie przecinają się.",
      }),
      (rng) => {
        const d = int(rng, 2, 10);
        return {
          content: `Punkt jest oddalony od prostej o $${d}$ cm. Jaką długość ma najkrótszy odcinek łączący ten punkt z prostą?`,
          correct: `${d} cm`,
          wrongs: [`${d * 2} cm`, `${d / 2} cm`, `${d + 1} cm`],
          explanation: "Najkrótszy odcinek to odcinek prostopadły, więc ma długość równą odległości.",
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "uklad_wspolrzednych",
    categoryName: "Układ współrzędnych",
    topic: "os_liczbowa",
    topicName: "Oś liczbowa",
    gens: [
      (rng) => {
        const a = -int(rng, 1, 6);
        const b = int(rng, 2, 8);
        return {
          content: `Oblicz odległość między liczbami $${a}$ i $${b}$ na osi liczbowej.`,
          correct: String(b - a),
          wrongs: [String(Math.abs(a) + Math.abs(b) + 1), String(a + b), String(Math.abs(b - a) + 2)],
          explanation: `Odległość to $|${b}-(${a})|=${b - a}$.`,
        };
      },
      (rng) => {
        const a = -int(rng, 2, 8);
        const b = int(rng, 2, 8);
        return {
          content: `Podaj współrzędną środka odcinka o końcach $${a}$ i $${b}$.`,
          correct: num((a + b) / 2),
          wrongs: [String(a + b), num((a + b) / 2 + 1), String(Math.abs(a - b))],
          explanation: `Środek to $\\frac{${a}+${b}}{2}=${num((a + b) / 2)}$.`,
        };
      },
      (rng) => {
        const a = int(rng, 2, 9);
        return {
          content: `Podaj liczbę przeciwną do $${a}$.`,
          correct: `-${a}`,
          wrongs: [String(a), `-${a + 1}`, `-${a - 1}`],
          explanation: `Liczba przeciwna do $${a}$ to $-${a}$.`,
        };
      },
      (rng) => {
        const a = -int(rng, 2, 8);
        const b = -int(rng, 2, 8);
        return {
          content: `Która liczba jest większa: $${a}$ czy $${b}$?`,
          correct: String(Math.max(a, b)),
          wrongs: [String(Math.min(a, b)), String(a + b), "0"],
          explanation: `Na osi większa liczba leży bardziej po prawej stronie.`,
        };
      },
      (rng) => {
        const a = int(rng, 1, 5);
        const b = a + int(rng, 2, 5);
        return {
          content: `Czy liczba $${b}$ należy do przedziału $[${a},${b})$?`,
          correct: "nie",
          wrongs: ["tak", "tylko dla dodatnich", "nie można ustalić"],
          explanation: `Przedział $[${a},${b})$ nie zawiera prawego końca $${b}$.`,
        };
      },
      (rng) => {
        const a = -int(rng, 2, 8);
        return {
          content: `Oblicz odległość liczby $${a}$ od zera na osi liczbowej.`,
          correct: String(Math.abs(a)),
          wrongs: [String(a), String(Math.abs(a) + 1), "0"],
          explanation: `Odległość od zera to $|${a}|=${Math.abs(a)}$.`,
        };
      },
    ],
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    categoryName: "Liczby i działania",
    topic: "system_rzymski",
    topicName: "System rzymski",
    gens: [
      (rng) => {
        const pairs = [
          ["XIV", 14], ["MCM", 1900], ["XL", 40], ["IX", 9], ["LVIII", 58],
          ["CD", 400], ["XC", 90], ["MMXXVI", 2026], ["DCCC", 800], ["XLIX", 49],
        ];
        const [roman, value] = pick(rng, pairs);
        return {
          content: `Odczytaj liczbę zapisaną cyframi rzymskimi: $${roman}$.`,
          correct: String(value),
          wrongs: [String(value + 10), String(value - 1), String(value + 1)],
          explanation: `$${roman}=${value}$.`,
        };
      },
      (rng) => {
        const pairs = [
          [24, "XXIV"], [49, "XLIX"], [1984, "MCMLXXXIV"], [90, "XC"],
          [400, "CD"], [2026, "MMXXVI"], [58, "LVIII"], [14, "XIV"],
          [9, "IX"], [40, "XL"],
        ];
        const [value, roman] = pick(rng, pairs);
        return {
          content: `Zapisz liczbę $${value}$ cyframi rzymskimi.`,
          correct: roman,
          wrongs: [`${roman}I`, `I${roman}`, roman.replace(/[IVXLCDM]/, (ch) => ch + ch)],
          explanation: `$${value}=${roman}$.`,
        };
      },
      (rng) => {
        const pairs = [["I", 1], ["V", 5], ["X", 10], ["L", 50], ["C", 100], ["D", 500], ["M", 1000]];
        const [symbol, value] = pick(rng, pairs);
        return {
          content: `Jaką wartość ma symbol rzymski $${symbol}$?`,
          correct: String(value),
          wrongs: [String(value / 5), String(value * 2), String(value + 1)],
          explanation: `$${symbol}=${value}$.`,
        };
      },
      (rng) => {
        const pairs = [["XL", 40, "LX", 60], ["IX", 9, "XI", 11], ["CD", 400, "DC", 600], ["XC", 90, "CX", 110]];
        const [a, av, b, bv] = pick(rng, pairs);
        const bigger = av > bv ? a : b;
        return {
          content: `Która liczba jest większa: $${a}$ czy $${b}$?`,
          correct: bigger,
          wrongs: [bigger === a ? b : a, "oba są równe", "nie można porównać"],
          explanation: `$${a}=${av}$, a $${b}=${bv}$, więc większa jest $${bigger}$.`,
        };
      },
      (rng) => {
        const pairs = [["4", "IV"], ["9", "IX"], ["40", "XL"], ["90", "XC"], ["400", "CD"], ["900", "CM"]];
        const [value, roman] = pick(rng, pairs);
        return {
          content: `Który zapis jest poprawny dla liczby $${value}$?`,
          correct: roman,
          wrongs: [`I${roman}`, `${roman}I`, roman.replace("V", "IIII").replace("X", "VIIII")],
          explanation: `Liczbę $${value}$ zapisujemy jako $${roman}$.`,
        };
      },
      (rng) => {
        const pairs = [["XL", 40, "X", 10], ["XC", 90, "X", 10], ["CD", 400, "C", 100], ["CM", 900, "C", 100]];
        const [a, av, b, bv] = pick(rng, pairs);
        return {
          content: `Ile wynosi $${a}+${b}$?`,
          correct: String(av + bv),
          wrongs: [String(av - bv), String(av * bv), String(av + bv + 10)],
          explanation: `$${a}=${av}$ i $${b}=${bv}$, więc suma to $${av + bv}$.`,
        };
      },
    ],
  },
];

const ALL = [...MATURA, ...E8];
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const topic of ALL) {
  const bundle = buildTopic(topic);
  const file = path.join(
    OUT_DIR,
    `${topic.exam_type}__${topic.category}__${topic.topic}.json`,
  );
  fs.writeFileSync(file, JSON.stringify(bundle, null, 2), "utf8");
  console.log(`✓ ${path.basename(file)} (${bundle.tasks.length} zadań)`);
}

console.log(`\nZapisano ${ALL.length} plików w ${OUT_DIR}`);
