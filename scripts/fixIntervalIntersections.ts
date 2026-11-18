/**
 * Naprawa 20 zadań o części wspólnej przedziałów: stary generator wpisywał
 * w klucz wartość [lewy+shift, lewy+shift+?] zamiast [max(lewy), min(prawy)].
 *
 *   npx tsx scripts/fixIntervalIntersections.ts
 */
import fs from "node:fs";
import path from "node:path";

const file = path.resolve(
  process.cwd(),
  "data/tasks-cache/matura_podstawowa__liczby_rzeczywiste__zbiory_i_przedzialy.json",
);

type Task = {
  id: string;
  content: string;
  correct_answer: string;
  options: string[];
  explanation: string;
};

const bundle = JSON.parse(fs.readFileSync(file, "utf8")) as {
  tasks: Task[];
};

let fixed = 0;

for (const task of bundle.tasks) {
  const match = task.content.match(
    /\$\[(-?\d+),\s*(-?\d+)\]\$\s*i\s*\$\[(-?\d+),\s*(-?\d+)\]\$/,
  );
  if (!match) continue;

  const [a, b, c, d] = match.slice(1).map(Number) as [number, number, number, number];
  const left = Math.max(a, c);
  const right = Math.min(b, d);
  const correct = `[${left}, ${right}]`;

  if (task.correct_answer === correct) continue;

  const candidates = [
    `[${a}, ${b}]`,
    `[${c}, ${d}]`,
    `[${left - 1}, ${right}]`,
    `[${left}, ${right + 1}]`,
    `(${left}, ${right})`,
  ];
  const options = [correct];
  for (const candidate of candidates) {
    if (!options.includes(candidate)) options.push(candidate);
  }

  task.correct_answer = correct;
  task.options = options.slice(0, 4);
  task.explanation = [
    `Część wspólna to liczby należące do obu przedziałów.`,
    `Lewy koniec: $\\max(${a}, ${c}) = ${left}$, prawy koniec: $\\min(${b}, ${d}) = ${right}$.`,
    `Zatem $[${a},${b}]\\cap[${c},${d}] = ${correct}$.`,
    `**Odpowiedź:** ${correct}`,
  ].join("\n");
  fixed += 1;
}

fs.writeFileSync(file, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
console.log(`Naprawiono ${fixed} zadań.`);
