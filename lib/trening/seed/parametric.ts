import { fmtNum, gcd, mulberry32, randInt, shuffle, type Rng } from "@/lib/trening/seed/rng";
import type { SeedTopicSlot } from "@/lib/trening/seed/topics";
import type { TaskDraft } from "@/lib/trening/seed/generators";

function uniqueMarker(variantIndex: number): string {
  return "\u200b".repeat(1 + variantIndex);
}

function buildMc(
  rng: Rng,
  slot: Pick<SeedTopicSlot, "exam_type" | "category" | "topic">,
  content: string,
  correct: string,
  wrongs: string[],
  difficulty: 1 | 2 | 3,
  variantIndex: number,
): TaskDraft {
  const pool = shuffle(rng, [correct, ...wrongs].filter((v, i, a) => a.indexOf(v) === i));
  while (pool.length < 4) pool.push(fmtNum(Number(correct) + pool.length + 1));
  const xp =
    difficulty === 1
      ? 10 + randInt(rng, 0, 4)
      : difficulty === 2
        ? 14 + randInt(rng, 0, 6)
        : 18 + randInt(rng, 0, 7);

  return {
    exam_type: slot.exam_type,
    category: slot.category,
    topic: slot.topic,
    content: `${content}${uniqueMarker(variantIndex)}`,
    correct_answer: correct,
    options: shuffle(rng, pool.slice(0, 4)),
    difficulty,
    xp_reward: xp,
  };
}

function wrongs(rng: Rng, correct: number, spread: number): string[] {
  const out: string[] = [];
  for (const d of [-spread, -2, -1, 1, 2, spread, spread + 3]) {
    const s = fmtNum(correct + d);
    if (s !== fmtNum(correct) && !out.includes(s)) out.push(s);
    if (out.length >= 3) break;
  }
  while (out.length < 3) out.push(fmtNum(correct + randInt(rng, 4, 12)));
  return out.slice(0, 3);
}

function slotHash(slot: SeedTopicSlot): number {
  let h = 0;
  for (const c of `${slot.exam_type}/${slot.category}/${slot.topic}`) {
    h = (h * 31 + c.charCodeAt(0)) >>> 0;
  }
  return h;
}

function pickV(v: number, index: number, mod: number): number {
  return ((v * 1_103 + index * 917) >>> 0) % mod;
}

export function generateParametricTask(
  slot: SeedTopicSlot,
  variantIndex: number,
): TaskDraft {
  const rng = mulberry32((variantIndex + 1) * 1_000_003 + slotHash(slot));
  const v = variantIndex;
  const hard = slot.exam_type === "matura_podstawowa";

  switch (slot.topic) {
    case "potegi": {
      const a = 2 + pickV(v, 0, 18);
      const m = 2 + pickV(v, 1, 10);
      const n = 2 + pickV(v, 2, 8);
      if (pickV(v, 3, 3) === 0) {
        const c = Math.pow(a, m) * Math.pow(a, n);
        return buildMc(rng, slot, `Oblicz $${a}^{${m}} \\cdot ${a}^{${n}}$`, fmtNum(c), wrongs(rng, c, 8), hard ? 2 : 1, v);
      }
      const c = Math.pow(a, m + n);
      return buildMc(rng, slot, `Uprość $${a}^{${m}} \\cdot ${a}^{${n}}$`, fmtNum(c), wrongs(rng, c, 6), 2, v);
    }
    case "logarytmy": {
      const bases = [2, 3, 5, 10] as const;
      const a = bases[pickV(v, 0, 4)]!;
      const exp = 2 + pickV(v, 1, 12);
      const x = Math.pow(a, exp);
      return buildMc(rng, slot, `Oblicz $\\log_{${a}} ${x}$`, fmtNum(exp), wrongs(rng, exp, 2), 2, v);
    }
    case "procenty": {
      const p = 5 + pickV(v, 0, 46);
      const n = 40 + pickV(v, 1, 460);
      const c = (n * p) / 100;
      return buildMc(rng, slot, `${p}% z liczby ${n} wynosi:`, fmtNum(c), wrongs(rng, c, Math.max(3, n * 0.08)), hard ? 3 : 2, v);
    }
    case "wyrazenia_algebraiczne": {
      const x = 1 + pickV(v, 0, 90);
      if (pickV(v, 1, 2) === 0) {
        const c = x * x + 2 * x + 1;
        return buildMc(rng, slot, `Oblicz $x^2+2x+1$ dla $x=${x}$`, fmtNum(c), wrongs(rng, c, 5), 2, v);
      }
      const a = 1 + pickV(v, 2, 14);
      const b = 1 + pickV(v, 3, 14);
      return buildMc(rng, slot, `Oblicz $${a}x+${b}$ dla $x=${x}$`, fmtNum(a * x + b), wrongs(rng, a * x + b, 4), 1, v);
    }
    case "rownania_liniowe": {
      const x = -20 + pickV(v, 0, 40);
      const a = 2 + pickV(v, 1, 9);
      const b = 1 + pickV(v, 2, 30);
      return buildMc(rng, slot, `Rozwiąż $${a}x+${b}=${a * x + b}$`, fmtNum(x), wrongs(rng, x, 3), 2, v);
    }
    case "uklady_rownan": {
      const x = -12 + pickV(v, 0, 24);
      const y = -12 + pickV(v, 1, 24);
      return buildMc(rng, slot, `Układ: $x+y=${x + y}$, $x-y=${x - y}$. Wartość $x$:`, fmtNum(x), wrongs(rng, x, 2), 3, v);
    }
    case "funkcja_liniowa": {
      const m = -8 + pickV(v, 0, 16);
      const b = -12 + pickV(v, 1, 24);
      const x = 1 + pickV(v, 2, 25);
      return buildMc(rng, slot, `Dla $f(x)=${m}x+${b}$ oblicz $f(${x})$`, fmtNum(m * x + b), wrongs(rng, m * x + b, 5), 2, v);
    }
    case "funkcja_kwadratowa": {
      const x = -18 + pickV(v, 0, 36);
      const p = -5 + pickV(v, 1, 11);
      const q = -9 + pickV(v, 2, 18);
      return buildMc(rng, slot, `Dla $f(x)=x^2+${p}x+${q}$ oblicz $f(${x})$`, fmtNum(x * x + p * x + q), wrongs(rng, x * x + p * x + q, 7), 2, v);
    }
    case "planimetria": {
      if (pickV(v, 0, 2) === 0) {
        const a = 3 + pickV(v, 1, 16);
        const b = 3 + pickV(v, 2, 16);
        return buildMc(rng, slot, `Pole trójkąta: podstawa ${a}, wysokość ${b}`, fmtNum((a * b) / 2), wrongs(rng, (a * b) / 2, 5), 2, v);
      }
      const a = 5 + pickV(v, 3, 14);
      const b = 5 + pickV(v, 4, 14);
      const c = Math.round(Math.sqrt(a * a + b * b) * 10) / 10;
      return buildMc(rng, slot, `Przeciwprostokątna: przyprostokątne ${a} i ${b}`, fmtNum(c), wrongs(rng, c, 3), 2, v);
    }
    case "stereometria": {
      const mode = pickV(v, 0, 3);
      if (mode === 0) {
        const a = 2 + pickV(v, 1, 14);
        return buildMc(rng, slot, `Pole powierzchni sześcianu o krawędzi ${a}`, fmtNum(6 * a * a), wrongs(rng, 6 * a * a, 10), 2, v);
      }
      if (mode === 1) {
        const r = 2 + pickV(v, 2, 10);
        const h = 3 + pickV(v, 3, 14);
        const vol = Math.round(Math.PI * r * r * h);
        return buildMc(rng, slot, `Objętość walca $r=${r}$, $h=${h}$, $\\pi\\approx 3{,}14$`, fmtNum(vol), wrongs(rng, vol, 20), 3, v);
      }
      const a = 2 + pickV(v, 4, 8);
      const b = 2 + pickV(v, 5, 8);
      const h = 3 + pickV(v, 6, 12);
      return buildMc(rng, slot, `Objętość prostopadłościanu ${a}×${b}×${h}`, fmtNum(a * b * h), wrongs(rng, a * b * h, 12), 2, v);
    }
    case "geometria_analityczna": {
      const x1 = -8 + pickV(v, 0, 16);
      const y1 = -8 + pickV(v, 1, 16);
      const x2 = -8 + pickV(v, 2, 16);
      const y2 = -8 + pickV(v, 3, 16);
      const d = Math.round(Math.hypot(x2 - x1, y2 - y1) * 10) / 10;
      return buildMc(rng, slot, `Odległość $(${x1},${y1})$ i $(${x2},${y2})$`, fmtNum(d), wrongs(rng, d, 4), 3, v);
    }
    case "prawdopodobienstwo": {
      if (pickV(v, 0, 2) === 0) {
        const fav = 1 + pickV(v, 1, 10);
        const tot = fav + 2 + pickV(v, 2, 20);
        const g = gcd(fav, tot);
        return buildMc(rng, slot, `P(czerwona) przy ${fav} z ${tot} kulach`, `${fav / g}/${tot / g}`, [`${fav}/${tot + 1}`, `${fav + 1}/${tot}`, `${tot - fav}/${tot}`], 2, v);
      }
      const sides = 6 + pickV(v, 3, 6);
      const favorable = 1 + pickV(v, 4, sides - 1);
      const g = gcd(favorable, sides);
      return buildMc(rng, slot, `Kostka ${sides}-ścienna: P(wynik ≤ ${favorable})`, `${favorable / g}/${sides / g}`, [`${favorable}/${sides + 1}`, `1/${sides}`, `2/${sides}`], 2, v);
    }
    case "statystyka": {
      const n = 4 + pickV(v, 0, 3);
      const nums = Array.from({ length: n }, (_, i) => 2 + pickV(v, i + 1, 20));
      const avg = nums.reduce((s, x) => s + x, 0) / n;
      return buildMc(rng, slot, `Średnia z ${nums.join(", ")}`, fmtNum(Math.round(avg * 100) / 100), wrongs(rng, avg, 2), 2, v);
    }
    case "ulamki": {
      const n1 = 1 + pickV(v, 0, 9);
      const d1 = n1 + 1 + pickV(v, 1, 8);
      const n2 = 1 + pickV(v, 2, 8);
      const d2 = n2 + 1 + pickV(v, 3, 8);
      const c = Math.round((n1 / d1 + n2 / d2) * 100) / 100;
      return buildMc(rng, slot, `$\\frac{${n1}}{${d1}}+\\frac{${n2}}{${d2}}$`, fmtNum(c), wrongs(rng, c, 0.3), 2, v);
    }
    case "pola_figur": {
      if (pickV(v, 0, 2) === 0) {
        const a = 3 + pickV(v, 1, 16);
        return buildMc(rng, slot, `Pole kwadratu o boku ${a}`, fmtNum(a * a), wrongs(rng, a * a, 6), 1, v);
      }
      const a = 4 + pickV(v, 2, 12);
      const b = 3 + pickV(v, 3, 12);
      return buildMc(rng, slot, `Pole prostokąta ${a}×${b}`, fmtNum(a * b), wrongs(rng, a * b, 5), 1, v);
    }
    case "obwody": {
      const mode = pickV(v, 0, 3);
      if (mode === 0) {
        const a = 3 + pickV(v, 1, 15);
        return buildMc(rng, slot, `Obwód kwadratu o boku ${a}`, fmtNum(4 * a), wrongs(rng, 4 * a, 4), 1, v);
      }
      if (mode === 1) {
        const a = 4 + pickV(v, 2, 12);
        const b = 3 + pickV(v, 3, 11);
        return buildMc(rng, slot, `Obwód prostokąta ${a}×${b}`, fmtNum(2 * (a + b)), wrongs(rng, 2 * (a + b), 5), 1, v);
      }
      const r = 3 + pickV(v, 4, 10);
      return buildMc(rng, slot, `Obwód koła $r=${r}$, $\\pi\\approx 3{,}14$ (całkowity)`, fmtNum(Math.round(2 * Math.PI * r)), wrongs(rng, Math.round(2 * Math.PI * r), 4), 2, v);
    }
    case "katy": {
      const alpha = 15 + pickV(v, 0, 60);
      const c = 180 - alpha - 90;
      return buildMc(rng, slot, `Trójkąt prostokątny: ostry ${alpha}°. Drugi ostry:`, `${c}°`, [`${c + 7}°`, `${c - 7}°`, `90°`], 2, v);
    }
    case "wykresy": {
      const m = 1 + pickV(v, 0, 40);
      const x = 1 + pickV(v, 1, 50);
      const b = pickV(v, 2, 20);
      return buildMc(rng, slot, `Wykres $y=${m}x+${b}$: wartość dla $x=${x}$`, fmtNum(m * x + b), wrongs(rng, m * x + b, 5), 2, v);
    }
    case "srednia": {
      const len = 3 + pickV(v, 0, 3);
      const nums = Array.from({ length: len }, (_, i) => 2 + pickV(v, i + 1, 18));
      const avg = nums.reduce((s, n) => s + n, 0) / len;
      return buildMc(rng, slot, `Średnia z ${nums.join(", ")}`, fmtNum(Math.round(avg * 100) / 100), wrongs(rng, avg, 2), 1, v);
    }
    case "diagramy": {
      const total = 60 + pickV(v, 0, 200);
      const p = 5 + pickV(v, 1, 45);
      return buildMc(rng, slot, `${p}% z ${total} uczniów`, fmtNum((total * p) / 100), wrongs(rng, (total * p) / 100, 10), 2, v);
    }
    case "rownania": {
      const x = 2 + pickV(v, 0, 30);
      const b = 1 + pickV(v, 1, 35);
      return buildMc(rng, slot, `Rozwiąż $x+${b}=${x + b}$`, fmtNum(x), wrongs(rng, x, 3), 1, v);
    }
    case "notacja_wykladnicza": {
      const a = 1 + pickV(v, 0, 9);
      const e = 2 + pickV(v, 1, 6);
      const c = a * Math.pow(10, e);
      return buildMc(
        rng,
        slot,
        `Zapisz w notacji dziesiętnej: $${a}\\cdot 10^{${e}}$`,
        fmtNum(c),
        wrongs(rng, c, Math.max(10, c * 0.1)),
        2,
        v,
      );
    }
    case "wartosc_bezwzgledna": {
      const x = -20 + pickV(v, 0, 40);
      if (x === 0) {
        return buildMc(rng, slot, `Oblicz $|0|$`, "0", ["1", "-1", "2"], 1, v);
      }
      return buildMc(
        rng,
        slot,
        `Oblicz $|${x}|$`,
        fmtNum(Math.abs(x)),
        wrongs(rng, Math.abs(x), 3),
        1,
        v,
      );
    }
    case "kolejnosc_dzialan": {
      const a = 2 + pickV(v, 0, 8);
      const b = 2 + pickV(v, 1, 8);
      const c = 2 + pickV(v, 2, 8);
      const result = a + b * c;
      return buildMc(
        rng,
        slot,
        `Oblicz $${a}+${b}\\cdot ${c}$`,
        fmtNum(result),
        [fmtNum((a + b) * c), fmtNum(a * b + c), fmtNum(a * b * c)],
        1,
        v,
      );
    }
    case "wzory_skroconego_mnozenia": {
      const a = 2 + pickV(v, 0, 10);
      const b = 1 + pickV(v, 1, 8);
      const c = a * a + 2 * a * b + b * b;
      return buildMc(
        rng,
        slot,
        `Oblicz $(${a}+${b})^2$`,
        fmtNum(c),
        wrongs(rng, c, 8),
        2,
        v,
      );
    }
    case "rownania_kwadratowe": {
      const r1 = -6 + pickV(v, 0, 12);
      const r2 = -6 + pickV(v, 1, 12);
      // (x-r1)(x-r2)=0 → x^2 - (r1+r2)x + r1*r2
      const sum = r1 + r2;
      const prod = r1 * r2;
      const signSum = sum >= 0 ? `-${sum}` : `+${-sum}`;
      const signProd = prod >= 0 ? `+${prod}` : `${prod}`;
      return buildMc(
        rng,
        slot,
        `Jedno z rozwiązań $x^2${signSum}x${signProd}=0$ to:`,
        fmtNum(r1),
        wrongs(rng, r1, 3),
        3,
        v,
      );
    }
    case "nierownosci": {
      const a = 2 + pickV(v, 0, 8);
      const b = 1 + pickV(v, 1, 20);
      const c = a * (5 + pickV(v, 2, 10)) + b;
      const x = (c - b) / a;
      return buildMc(
        rng,
        slot,
        `Rozwiązaniem $${a}x+${b}<${c}$ jest:`,
        `x < ${fmtNum(x)}`,
        [`x > ${fmtNum(x)}`, `x ≤ ${fmtNum(x)}`, `x ≥ ${fmtNum(x)}`],
        2,
        v,
      );
    }
    case "wlasnosci_funkcji": {
      const a = 1 + pickV(v, 0, 8);
      const b = -5 + pickV(v, 1, 10);
      // f(x)=ax+b, miejsce zerowe
      const zero = -b / a;
      return buildMc(
        rng,
        slot,
        `Miejsce zerowe $f(x)=${a}x${b >= 0 ? "+" : ""}${b}$ to:`,
        fmtNum(zero),
        wrongs(rng, zero, 2),
        2,
        v,
      );
    }
    case "odczyt_wykresu": {
      const y1 = -4 + pickV(v, 0, 8);
      const y2 = -4 + pickV(v, 1, 8);
      const prod = y1 * y2;
      return buildMc(
        rng,
        slot,
        `Z wykresu: $f(-1)=${y1}$, $f(2)=${y2}$. Iloczyn $f(-1)\\cdot f(2)$:`,
        fmtNum(prod),
        wrongs(rng, prod, 4),
        2,
        v,
      );
    }
    case "ciag_arytmetyczny": {
      const a1 = -10 + pickV(v, 0, 30);
      const r = -5 + pickV(v, 1, 12);
      if (r === 0) {
        return buildMc(rng, slot, `Ciąg stały $a_n=${a1}$. Wtedy $a_5$:`, fmtNum(a1), wrongs(rng, a1, 2), 1, v);
      }
      const n = 5 + pickV(v, 2, 6);
      const an = a1 + (n - 1) * r;
      return buildMc(
        rng,
        slot,
        `Ciąg arytmetyczny: $a_1=${a1}$, $r=${r}$. Oblicz $a_{${n}}$`,
        fmtNum(an),
        wrongs(rng, an, Math.abs(r) + 2),
        2,
        v,
      );
    }
    case "ciag_geometryczny": {
      const a1 = 1 + pickV(v, 0, 6);
      const q = 2 + pickV(v, 1, 3);
      const n = 3 + pickV(v, 2, 3);
      const an = a1 * Math.pow(q, n - 1);
      return buildMc(
        rng,
        slot,
        `Ciąg geometryczny: $a_1=${a1}$, $q=${q}$. Oblicz $a_{${n}}$`,
        fmtNum(an),
        wrongs(rng, an, an / 2 || 4),
        2,
        v,
      );
    }
    case "sin_cos_tg": {
      const angles = [
        { deg: 30, sin: "1/2", cos: "√3/2", tg: "1/√3" },
        { deg: 45, sin: "√2/2", cos: "√2/2", tg: "1" },
        { deg: 60, sin: "√3/2", cos: "1/2", tg: "√3" },
      ] as const;
      const ang = angles[pickV(v, 0, 3)]!;
      const mode = pickV(v, 1, 3);
      if (mode === 0) {
        return buildMc(rng, slot, `$\\sin ${ang.deg}^\\circ$ =`, ang.sin, [ang.cos, "1", "0"], 2, v);
      }
      if (mode === 1) {
        return buildMc(rng, slot, `$\\cos ${ang.deg}^\\circ$ =`, ang.cos, [ang.sin, "1", "0"], 2, v);
      }
      return buildMc(rng, slot, `$\\mathrm{tg}\\, ${ang.deg}^\\circ$ =`, ang.tg, ["0", "1/2", "2"], 2, v);
    }
    case "zastosowania_trygonometrii": {
      const a = 3 + pickV(v, 0, 8);
      const b = 4 + pickV(v, 1, 8);
      const c = Math.round(Math.sqrt(a * a + b * b) * 10) / 10;
      return buildMc(
        rng,
        slot,
        `Trójkąt prostokątny: przyprostokątne ${a} i ${b}. Przeciwprostokątna:`,
        fmtNum(c),
        wrongs(rng, c, 2),
        2,
        v,
      );
    }
    case "pitagoras_i_podobienstwo":
    case "pitagoras": {
      const triples = [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [9, 12, 15],
      ] as const;
      const t = triples[pickV(v, 0, 4)]!;
      return buildMc(
        rng,
        slot,
        `Trójkąt prostokątny: przyprostokątne ${t[0]} i ${t[1]}. Przeciwprostokątna:`,
        fmtNum(t[2]),
        wrongs(rng, t[2], 3),
        2,
        v,
      );
    }
    case "podobienstwo": {
      const k = 2 + pickV(v, 0, 3);
      const a = 3 + pickV(v, 1, 10);
      return buildMc(
        rng,
        slot,
        `Trójkąty podobne w skali ${k}:1. Bok ${a} odpowiada:`,
        fmtNum(a * k),
        wrongs(rng, a * k, a),
        2,
        v,
      );
    }
    case "okrag_i_kolo": {
      const r = 2 + pickV(v, 0, 12);
      if (pickV(v, 1, 2) === 0) {
        return buildMc(
          rng,
          slot,
          `Pole koła $r=${r}$, $\\pi\\approx 3{,}14$ (całkowite):`,
          fmtNum(Math.round(Math.PI * r * r)),
          wrongs(rng, Math.round(Math.PI * r * r), 10),
          2,
          v,
        );
      }
      return buildMc(
        rng,
        slot,
        `Obwód koła $r=${r}$, $\\pi\\approx 3{,}14$ (całkowity):`,
        fmtNum(Math.round(2 * Math.PI * r)),
        wrongs(rng, Math.round(2 * Math.PI * r), 5),
        2,
        v,
      );
    }
    case "kombinatoryka":
    case "regula_mnozenia": {
      const a = 2 + pickV(v, 0, 5);
      const b = 2 + pickV(v, 1, 5);
      const c = 2 + pickV(v, 2, 4);
      return buildMc(
        rng,
        slot,
        `Na ile sposobów wybrać 1 z ${a} koszulek, 1 z ${b} spodni i 1 z ${c} butów?`,
        fmtNum(a * b * c),
        wrongs(rng, a * b * c, 6),
        2,
        v,
      );
    }
    case "pierwiastki": {
      const bases = [4, 9, 16, 25, 36, 49, 64, 81, 100];
      const n = bases[pickV(v, 0, bases.length)]!;
      return buildMc(
        rng,
        slot,
        `Oblicz $\\sqrt{${n}}$`,
        fmtNum(Math.sqrt(n)),
        wrongs(rng, Math.sqrt(n), 2),
        1,
        v,
      );
    }
    case "liczby_calkowite": {
      const a = -15 + pickV(v, 0, 30);
      const b = -10 + pickV(v, 1, 20);
      return buildMc(
        rng,
        slot,
        `Oblicz $(${a})+(${b})$`,
        fmtNum(a + b),
        wrongs(rng, a + b, 4),
        1,
        v,
      );
    }
    case "proporcje": {
      const a = 2 + pickV(v, 0, 8);
      const b = 2 + pickV(v, 1, 8);
      const c = (1 + pickV(v, 2, 6)) * a;
      // a/b = c/x → x = b*c/a
      const x = (b * c) / a;
      return buildMc(
        rng,
        slot,
        `Z proporcji $${a}:${b}=${c}:x$ wynika $x=$`,
        fmtNum(x),
        wrongs(rng, x, Math.max(2, x / 4)),
        2,
        v,
      );
    }
    case "symetrie": {
      const x = -8 + pickV(v, 0, 16);
      const y = -8 + pickV(v, 1, 16);
      if (pickV(v, 2, 2) === 0) {
        return buildMc(
          rng,
          slot,
          `Obraz $(${x},${y})$ w symetrii względem osi $OY$:`,
          `(${-x},${y})`,
          [`(${x},${-y})`, `(${-x},${-y})`, `(${y},${x})`],
          2,
          v,
        );
      }
      return buildMc(
        rng,
        slot,
        `Obraz $(${x},${y})$ w symetrii względem osi $OX$:`,
        `(${x},${-y})`,
        [`(${-x},${y})`, `(${-x},${-y})`, `(${y},${x})`],
        2,
        v,
      );
    }
    case "bryly":
    case "objetosc_i_pole": {
      const a = 2 + pickV(v, 0, 8);
      const b = 2 + pickV(v, 1, 8);
      const h = 2 + pickV(v, 2, 10);
      if (pickV(v, 3, 2) === 0) {
        return buildMc(
          rng,
          slot,
          `Objętość prostopadłościanu ${a}×${b}×${h}:`,
          fmtNum(a * b * h),
          wrongs(rng, a * b * h, 8),
          2,
          v,
        );
      }
      return buildMc(
        rng,
        slot,
        `Objętość sześcianu o krawędzi ${a}:`,
        fmtNum(a * a * a),
        wrongs(rng, a * a * a, 6),
        2,
        v,
      );
    }
    case "punkty_na_plaszczyznie": {
      const quads = [
        { x: 3, y: 4, ans: "I" },
        { x: -2, y: 5, ans: "II" },
        { x: -3, y: -1, ans: "III" },
        { x: 4, y: -2, ans: "IV" },
      ] as const;
      const q = quads[pickV(v, 0, 4)]!;
      return buildMc(
        rng,
        slot,
        `Punkt $(${q.x},${q.y})$ leży w ćwiartce:`,
        q.ans,
        (["I", "II", "III", "IV"] as const).filter((x) => x !== q.ans),
        1,
        v,
      );
    }
    case "dlugosc_odcinka": {
      const x1 = -5 + pickV(v, 0, 10);
      const y1 = -5 + pickV(v, 1, 10);
      const x2 = -5 + pickV(v, 2, 10);
      const y2 = -5 + pickV(v, 3, 10);
      const d = Math.round(Math.hypot(x2 - x1, y2 - y1) * 10) / 10;
      return buildMc(
        rng,
        slot,
        `Długość odcinka $(${x1},${y1})$—$(${x2},${y2})$:`,
        fmtNum(d),
        wrongs(rng, d, 3),
        2,
        v,
      );
    }
    case "proporcjonalnosc": {
      const k = 2 + pickV(v, 0, 8);
      const x = 1 + pickV(v, 1, 12);
      return buildMc(
        rng,
        slot,
        `y jest wprost proporcjonalne do x, $y=${k}$ gdy $x=1$. Dla $x=${x}$ y=`,
        fmtNum(k * x),
        wrongs(rng, k * x, k),
        2,
        v,
      );
    }
    case "mediana_i_dominanta": {
      const a = 2 + pickV(v, 0, 6);
      const b = a + 1 + pickV(v, 1, 4);
      const c = b + 1 + pickV(v, 2, 4);
      const d = c + pickV(v, 3, 3);
      const e = d + pickV(v, 4, 3);
      const nums = [a, b, c, d, e].sort((p, q) => p - q);
      const med = nums[2]!;
      return buildMc(
        rng,
        slot,
        `Mediana zbioru ${nums.join(", ")}:`,
        fmtNum(med),
        wrongs(rng, med, 2),
        2,
        v,
      );
    }
    default: {
      // Ostateczny fallback — nie „a+b”, tylko proste wyrażenie z kolejnością działań
      const a = 2 + pickV(v, 0, 12);
      const b = 2 + pickV(v, 1, 8);
      const c = 2 + pickV(v, 2, 8);
      const result = a * b - c;
      return buildMc(
        rng,
        slot,
        `Oblicz $${a}\\cdot ${b}-${c}$`,
        fmtNum(result),
        wrongs(rng, result, 4),
        1,
        v,
      );
    }
  }
}
