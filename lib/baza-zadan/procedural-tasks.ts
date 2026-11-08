import { generateExtraProceduralTasks } from "@/lib/baza-zadan/procedural-extra";
import {
  exactAverage,
  exactPercentOf,
  gcd,
  integerChoices,
  uniqueChoices,
} from "@/lib/baza-zadan/task-generators";
import type { Task } from "@/lib/baza-zadan/types";

function t(id: string, data: Omit<Task, "id">): Task {
  return { id, ...data };
}

/** Generuje setki wariantów z szablonów - rozszerza bazę dynamicznie. */
export function generateProceduralTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 1; i <= 80; i++) {
    const a = 5 + (i % 12);
    const b = 3 + (i % 9);
    const correct = a * b;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-mul-${i}`, {
        title: `Mnożenie #${i}`,
        category: "arytmetyka",
        difficulty: i % 3 === 0 ? "sredni" : "latwy",
        forPaths: ["sp"],
        prompt: `Oblicz: ${a} × ${b}`,
        choices,
        correctIndex,
        explanation: `${a} × ${b} = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 70; i++) {
    const { pct, base, value } = exactPercentOf(i);
    const { choices, correctIndex } = integerChoices(value);
    tasks.push(
      t(`proc-pct-${i}`, {
        title: `Procent #${i}`,
        category: "procenty",
        difficulty: "latwy",
        forPaths: ["klasa-6", "klasa-7", "klasa-8", "liceum"],
        prompt: `Ile to ${pct}% z ${base}?`,
        choices,
        correctIndex,
        explanation: `${pct}% z ${base} = ${value}.`,
      }),
    );
  }

  for (let i = 1; i <= 70; i++) {
    const x = 2 + (i % 10);
    const a = 2 + (i % 4);
    const b = 1 + (i % 8);
    const c = a * x + b;
    const opts = [`x = ${x - 1}`, `x = ${x}`, `x = ${x + 1}`, `x = ${x + 2}`];
    tasks.push(
      t(`proc-eq-${i}`, {
        title: `Równanie #${i}`,
        category: "rownania",
        difficulty: i % 4 === 0 ? "trudny" : "sredni",
        forPaths: ["klasa-7", "klasa-8", "liceum", "technikum", "zawodowa"],
        prompt: `Rozwiąż: ${a}x + ${b} = ${c}`,
        choices: opts,
        correctIndex: 1,
        explanation: `${a}x = ${c - b}, x = ${x}.`,
      }),
    );
  }

  for (let i = 1; i <= 40; i++) {
    const w = 4 + (i % 10);
    const h = 3 + (i % 8);
    const correct = w * h;
    const { choices, correctIndex } = integerChoices(correct);
    const choicesWithUnit = choices.map((o) => `${o} cm²`);
    tasks.push(
      t(`proc-geo-${i}`, {
        title: `Pole prostokąta #${i}`,
        category: "geometria",
        difficulty: "latwy",
        forPaths: ["klasa-5", "klasa-6", "klasa-7", "klasa-8"],
        prompt: `Pole prostokąta: a = ${w} cm, b = ${h} cm`,
        choices: choicesWithUnit,
        correctIndex,
        explanation: `P = ${w} × ${h} = ${correct} cm².`,
      }),
    );
  }

  for (let i = 1; i <= 35; i++) {
    const base = 2 + (i % 5);
    const exp = 2 + (i % 4);
    const correct = base ** exp;
    const { choices: opts, correctIndex } = uniqueChoices(String(correct), [
      String(correct + base),
      String(correct * 2),
      String(base ** (exp + 1)),
    ]);
    tasks.push(
      t(`proc-pow-${i}`, {
        title: `Potęga #${i}`,
        category: "potegi",
        difficulty: "sredni",
        forPaths: ["klasa-7", "klasa-8", "liceum", "technikum", "zawodowa"],
        prompt: `Oblicz: ${base}^${exp}`,
        choices: opts,
        correctIndex,
        explanation: `${base}^${exp} = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 30; i++) {
    const root = 2 + (i % 12);
    const sq = root * root;
    const { choices, correctIndex } = integerChoices(root);
    tasks.push(
      t(`proc-sqrt-${i}`, {
        title: `Pierwiastek #${i}`,
        category: "pierwiastki",
        difficulty: "latwy",
        forPaths: ["klasa-7", "klasa-8", "egzamin-8"],
        prompt: `Oblicz: √${sq}`,
        choices,
        correctIndex,
        explanation: `√${sq} = ${root}, bo ${root}² = ${sq}.`,
      }),
    );
  }

  for (let i = 1; i <= 35; i++) {
    const x = 2 + (i % 7);
    const a = 2 + (i % 5);
    const correct = a * x + (i % 6);
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-fx-${i}`, {
        title: `Funkcja #${i}`,
        category: "funkcje",
        difficulty: "sredni",
        forPaths: ["liceum", "technikum", "zawodowa"],
        prompt: `f(x) = ${a}x + ${i % 6},  oblicz f(${x})`,
        choices,
        correctIndex,
        explanation: `f(${x}) = ${a}·${x} + ${i % 6} = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 25; i++) {
    const start = 2 + (i % 5);
    const diff = 3 + (i % 4);
    const seq = [start, start + diff, start + 2 * diff, start + 3 * diff];
    const correct = start + 4 * diff;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-seq-${i}`, {
        title: `Ciąg #${i}`,
        category: "ciagi",
        difficulty: "sredni",
        forPaths: ["klasa-7", "klasa-8", "liceum", "technikum", "zawodowa"],
        prompt: `Następny wyraz: ${seq.join(", ")}, ?`,
        choices,
        correctIndex,
        explanation: `Różnica ${diff}, więc ${seq[3]} + ${diff} = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 30; i++) {
    const a = 6 + (i % 8) * 2;
    const b = 8 + (i % 6) * 3;
    const g = gcd(a, b);
    const { choices, correctIndex } = integerChoices(g);
    tasks.push(
      t(`proc-nwd-${i}`, {
        title: `NWD #${i}`,
        category: "algebra",
        difficulty: "sredni",
        forPaths: ["klasa-7", "klasa-8", "egzamin-8", "liceum"],
        prompt: `NWD(${a}, ${b}) = ?`,
        choices,
        correctIndex,
        explanation: `Największy wspólny dzielnik ${a} i ${b} to ${g}.`,
      }),
    );
  }

  for (let i = 1; i <= 25; i++) {
    const n = 3 + (i % 12);
    const correct = n * n;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-sq-${i}`, {
        title: `Kwadrat liczby #${i}`,
        category: "potegi",
        difficulty: "latwy",
        forPaths: ["klasa-6", "klasa-7", "klasa-8", "egzamin-8"],
        prompt: `Oblicz: ${n}²`,
        choices,
        correctIndex,
        explanation: `${n}² = ${correct}.`,
      }),
    );
  }

  for (let i = 1; i <= 25; i++) {
    const d = [2, 3, 4, 5, 6, 8, 10][i % 7];
    const n1 = 2 + (i % (d * 2));
    const n2 = 1 + (i % n1);
    const correctNum = n1 - n2;
    const { choices: opts, correctIndex } = uniqueChoices(`${correctNum}/${d}`, [
      `${n1 + n2}/${d}`,
      `${correctNum + 1}/${d}`,
      `${n1}/${d * 2}`,
    ]);
    tasks.push(
      t(`proc-frac-sub-${i}`, {
        title: `Ułamki - odejmowanie #${i}`,
        category: "ulamki",
        difficulty: "latwy",
        forPaths: ["klasa-5", "klasa-6", "klasa-7", "klasa-8"],
        prompt: `Oblicz: ${n1}/${d} − ${n2}/${d}`,
        choices: opts,
        correctIndex,
        explanation: `${n1} − ${n2} = ${correctNum}, mianownik ${d}.`,
      }),
    );
  }

  for (let i = 1; i <= 20; i++) {
    const { nums, avg } = exactAverage(i);
    const { choices, correctIndex } = integerChoices(avg);
    tasks.push(
      t(`proc-avg-${i}`, {
        title: `Średnia #${i}`,
        category: "arytmetyka",
        difficulty: "sredni",
        forPaths: ["klasa-6", "klasa-7", "klasa-8", "liceum", "technikum", "zawodowa"],
        prompt: `Średnia z: ${nums.join(", ")}`,
        choices,
        correctIndex,
        explanation: `Suma ${nums.reduce((s, v) => s + v, 0)}, dzielimy przez ${nums.length} → ${avg}.`,
      }),
    );
  }

  for (let i = 1; i <= 20; i++) {
    const r = 2 + (i % 9);
    const correct = Math.round(3.14 * r * r * 10) / 10;
    const trap = Math.round(r * r * 10) / 10;
    const { choices: opts, correctIndex } = uniqueChoices(`${correct} cm²`, [
      `${Math.round(3.14 * r * 2 * 10) / 10} cm²`,
      `${trap} cm²`,
      `${Math.round(3.14 * (r + 1) ** 2 * 10) / 10} cm²`,
    ]);
    tasks.push(
      t(`proc-circle-${i}`, {
        title: `Pole koła #${i}`,
        category: "geometria",
        difficulty: "sredni",
        forPaths: ["klasa-8", "egzamin-8", "matura"],
        prompt: `Pole koła o promieniu r = ${r} cm (π ≈ 3,14)`,
        choices: opts,
        correctIndex,
        explanation: `P = πr² ≈ 3,14 × ${r}² = ${correct} cm².`,
      }),
    );
  }

  for (let i = 1; i <= 15; i++) {
    const angles = [
      { val: "1/2", label: "sin(30°)" },
      { val: "1/2", label: "cos(60°)" },
      { val: "1", label: "sin(90°)" },
    ] as const;
    const { val, label } = angles[i % angles.length];
    const opts = ["0", "1/2", "√2/2", "1"];
    tasks.push(
      t(`proc-trig-${i}`, {
        title: `Trygonometria #${i}`,
        category: "trygonometria",
        difficulty: "latwy",
        forPaths: ["liceum", "technikum", "zawodowa"],
        prompt: `${label} = ?`,
        choices: opts,
        correctIndex: opts.indexOf(val),
        explanation: `${label} = ${val}.`,
      }),
    );
  }

  for (let i = 1; i <= 15; i++) {
    const base = 2;
    const exp = 3 + (i % 5);
    const arg = base ** exp;
    const correct = exp;
    const { choices, correctIndex } = integerChoices(correct);
    tasks.push(
      t(`proc-log-${i}`, {
        title: `Logarytm #${i}`,
        category: "logarytmy",
        difficulty: "sredni",
        forPaths: ["liceum-3", "liceum-4", "technikum", "zawodowa"],
        prompt: `log₂(${arg}) = ?`,
        choices,
        correctIndex,
        explanation: `2^${exp} = ${arg}, więc log₂(${arg}) = ${exp}.`,
      }),
    );
  }

  return [...tasks, ...generateExtraProceduralTasks()];
}
