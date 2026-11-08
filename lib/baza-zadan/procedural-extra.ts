import type { Task } from "@/lib/baza-zadan/types";
import {
  exactPriceAfterIncrease,
  exactWhatPercent,
  gcd,
  integerChoices,
  shuffle,
  uniqueChoices,
} from "@/lib/baza-zadan/task-generators";

function t(id: string, data: Omit<Task, "id">): Task {
  return { id, ...data };
}

function lcm(a: number, b: number): number {
  return Math.abs((a * b) / gcd(a, b));
}

/** Dodatkowe generatory proceduralne - rozbudowa bazy. */
export function generateExtraProceduralTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 1; i <= 80; i++) {
    const a = 10 + (i % 20);
    const b = 5 + (i % 15);
    const correct = a + b;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-add-${i}`, {
        title: `Dodawanie #${i}`,
        category: "arytmetyka",
        difficulty: "latwy",
        forPaths: ["sp"],
        prompt: `Oblicz: ${a} + ${b}`,
        choices,
        correctIndex,
        explanation: `${a} + ${b} = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 80; i++) {
    let a = 15 + (i % 25);
    let b = 3 + (i % 12);
    if (a < b) [a, b] = [b, a];
    const correct = a - b;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-sub-${i}`, {
        title: `Odejmowanie #${i}`,
        category: "arytmetyka",
        difficulty: i % 4 === 0 ? "sredni" : "latwy",
        forPaths: ["sp"],
        prompt: `Oblicz: ${a} − ${b}`,
        choices,
        correctIndex,
        explanation: `${a} − ${b} = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 60; i++) {
    const b = 2 + (i % 11);
    const q = 3 + (i % 14);
    const a = b * q;
    const { choices, correctIndex } = integerChoices(q);
    tasks.push(
      t(`proc-div-${i}`, {
        title: `Dzielenie #${i}`,
        category: "arytmetyka",
        difficulty: "latwy",
        forPaths: ["klasa-4", "klasa-5", "klasa-6", "klasa-7", "klasa-8"],
        prompt: `Oblicz: ${a} ÷ ${b}`,
        choices,
        correctIndex,
        explanation: `${a} ÷ ${b} = ${q}.`,
      }),
    );
  }

  for (let i = 1; i <= 50; i++) {
    const d = [2, 3, 4, 5, 6, 8][i % 6];
    const n1 = 1 + (i % 4);
    const n2 = 1 + ((i + 2) % 4);
    const sum = n1 + n2;
    const opts = shuffle([
      `${sum}/${d}`,
      `${n1 + n2 + 1}/${d}`,
      `${sum}/${d * 2}`,
      `${n1 * n2}/${d}`,
    ]);
    tasks.push(
      t(`proc-frac-add-${i}`, {
        title: `Ułamki - suma #${i}`,
        category: "ulamki",
        difficulty: "latwy",
        forPaths: ["klasa-5", "klasa-6", "klasa-7", "klasa-8"],
        prompt: `Oblicz: ${n1}/${d} + ${n2}/${d}`,
        choices: opts,
        correctIndex: opts.indexOf(`${sum}/${d}`),
        explanation: `${n1}+${n2}=${sum}, mianownik ${d}.`,
      }),
    );
  }

  for (let i = 1; i <= 45; i++) {
    const w = 3 + (i % 12);
    const h = 2 + (i % 10);
    const correct = 2 * (w + h);
    const { choices, correctIndex } = integerChoices(correct);
    const withUnit = choices.map((c) => `${c} cm`);
    tasks.push(
      t(`proc-perim-${i}`, {
        title: `Obwód #${i}`,
        category: "geometria",
        difficulty: "latwy",
        forPaths: ["klasa-4", "klasa-5", "klasa-6", "klasa-7", "klasa-8"],
        prompt: `Obwód prostokąta ${w} cm × ${h} cm`,
        choices: withUnit,
        correctIndex,
        explanation: `O = 2(${w}+${h}) = ${correct} cm.`,
      }),
    );
  }

  for (let i = 1; i <= 35; i++) {
    const a = 4 + (i % 10);
    const b = 6 + (i % 12);
    const correct = lcm(a, b);
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-nww-${i}`, {
        title: `NWW #${i}`,
        category: "algebra",
        difficulty: "sredni",
        forPaths: ["klasa-7", "klasa-8", "egzamin-8", "liceum"],
        prompt: `NWW(${a}, ${b}) = ?`,
        choices,
        correctIndex,
        explanation: `Najmniejsza wspólna wielokrotność to ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 45; i++) {
    const { part, total, pct } = exactWhatPercent(i);
    const { choices, correctIndex } = integerChoices(pct);
    tasks.push(
      t(`proc-pct-rev-${i}`, {
        title: `Jaki procent #${i}`,
        category: "procenty",
        difficulty: "sredni",
        forPaths: ["klasa-7", "klasa-8", "egzamin-8", "liceum"],
        prompt: `${part} z ${total} to ile procent?`,
        choices: choices.map((c) => `${c}%`),
        correctIndex,
        explanation: `${part}/${total} × 100% = ${pct}%.`,
      }),
    );
  }

  for (let i = 1; i <= 30; i++) {
    const n = -(5 + (i % 15));
    const correct = Math.abs(n);
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-abs-${i}`, {
        title: `Wartość bezwzględna #${i}`,
        category: "algebra",
        difficulty: "latwy",
        forPaths: ["klasa-7", "klasa-8", "liceum", "technikum", "zawodowa"],
        prompt: `Oblicz: |${n}|`,
        choices,
        correctIndex,
        explanation: `|${n}| = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 40; i++) {
    const base = 4 + (i % 6);
    const h = 3 + (i % 8);
    const correct = (base * h) / 2;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-tri-${i}`, {
        title: `Pole trójkąta #${i}`,
        category: "geometria",
        difficulty: "sredni",
        forPaths: ["klasa-6", "klasa-7", "klasa-8", "egzamin-8"],
        prompt: `Pole trójkąta: podstawa ${base} cm, h = ${h} cm`,
        choices: choices.map((c) => `${c} cm²`),
        correctIndex,
        explanation: `P = ${base}·${h}/2 = ${correct} cm².`,
      }),
    );
  }

  for (let i = 1; i <= 50; i++) {
    const { price, pct, newPrice } = exactPriceAfterIncrease(i);
    const { choices, correctIndex } = integerChoices(newPrice);
    tasks.push(
      t(`proc-e8-pct-${i}`, {
        title: `E8 - procent #${i}`,
        category: "egzamin-8",
        difficulty: i % 3 === 0 ? "trudny" : "sredni",
        forPaths: ["klasa-7", "klasa-8", "egzamin-8"],
        prompt: `Cena ${price} zł wzrosła o ${pct}%. Nowa cena?`,
        choices: choices.map((c) => `${c} zł`),
        correctIndex,
        explanation: `${price} × ${(100 + pct) / 100} = ${newPrice} zł.`,
        examTags: ["egzamin-8-klasisty"],
      }),
    );
  }

  for (let i = 1; i <= 40; i++) {
    const a = 2 + (i % 4);
    const b = 1 + (i % 6);
    const x = 3 + (i % 8);
    const c = a * x + b;
    const opts = [`x = ${x - 1}`, `x = ${x}`, `x = ${x + 1}`, `x = ${x + 2}`];
    tasks.push(
      t(`proc-e8-eq-${i}`, {
        title: `E8 - równanie #${i}`,
        category: "egzamin-8",
        difficulty: "sredni",
        forPaths: ["klasa-8", "egzamin-8"],
        prompt: `Rozwiąż: ${a}x + ${b} = ${c}`,
        choices: opts,
        correctIndex: 1,
        explanation: `x = ${x}.`,
        examTags: ["egzamin-8-klasisty"],
      }),
    );
  }

  for (let i = 1; i <= 45; i++) {
    const base = 2 + (i % 3);
    const exp = 2 + (i % 4);
    const correct = base ** exp;
    const { choices: opts, correctIndex } = uniqueChoices(String(correct), [
      String(correct + base),
      String(base ** (exp + 1)),
      String(correct * 2),
    ]);
    tasks.push(
      t(`proc-mat-pow-${i}`, {
        title: `Matura - potęga #${i}`,
        category: "matura",
        difficulty: "sredni",
        forPaths: ["matura"],
        prompt: `Oblicz: ${base}^${exp}`,
        choices: opts,
        correctIndex,
        explanation: `${base}^${exp} = ${correct}.`,
        examTags: ["matura-podstawowa"],
      }),
    );
  }

  for (let i = 1; i <= 35; i++) {
    const a = 2 + (i % 5);
    const x = 2 + (i % 6);
    const correct = a * x + (i % 4);
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-mat-fx-${i}`, {
        title: `Matura - funkcja #${i}`,
        category: "matura",
        difficulty: "sredni",
        forPaths: ["matura"],
        prompt: `f(x) = ${a}x + ${i % 4}, oblicz f(${x})`,
        choices,
        correctIndex,
        explanation: `f(${x}) = ${correct}.`,
        examTags: ["matura-podstawowa"],
      }),
    );
  }

  for (let i = 1; i <= 25; i++) {
    const labels = ["sin(30°)", "cos(60°)", "tg(45°)", "sin(90°)"];
    const vals = ["1/2", "1/2", "1", "1"];
    const idx = i % labels.length;
    const opts = ["0", "1/2", "√2/2", "1"];
    tasks.push(
      t(`proc-mat-trig-${i}`, {
        title: `Matura - trygonometria #${i}`,
        category: "matura",
        difficulty: "latwy",
        forPaths: ["matura"],
        prompt: `${labels[idx]} = ?`,
        choices: opts,
        correctIndex: opts.indexOf(vals[idx]),
        explanation: `${labels[idx]} = ${vals[idx]}.`,
        examTags: ["matura-podstawowa"],
      }),
    );
  }

  return tasks;
}
