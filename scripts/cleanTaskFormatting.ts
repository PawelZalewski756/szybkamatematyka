/**
 * Porządki w zapisie matematyki w data/tasks-cache:
 * - usuwa zbędne wyrazy zerowe: `+0`, `+0x`, `y=x+0`, `x^2+6x+0=0`,
 * - zwija `1x` do `x`, `-1x` do `-x`, `1n` do `n`,
 * - naprawia sklejone znaki `--`, `+-`, `-+`, `++`,
 * - zaokrągla długie rozwinięcia dziesiętne do 2 miejsc i stawia przecinek.
 *
 *   npx tsx scripts/cleanTaskFormatting.ts
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.cwd(), "data/tasks-cache");

function roundLongDecimals(text: string): string {
  return text.replace(/(\d+)[.,](\d{6,})/g, (_match, whole: string, frac: string) => {
    const value = Number(`${whole}.${frac}`);
    if (!Number.isFinite(value)) return `${whole},${frac.slice(0, 2)}`;
    const rounded = Math.round(value * 100) / 100;
    return String(rounded).replace(".", ",");
  });
}

function cleanMath(inner: string): string {
  let out = inner
    .replace(/--/g, "+")
    .replace(/\+-/g, "-")
    .replace(/-\+/g, "-")
    .replace(/\+\+/g, "+");

  // +0x / -0x przed kolejnym składnikiem: x^2+0x+9 -> x^2+9
  out = out.replace(/([+\-])0([a-zA-Z])(?=[+\-=])/g, "");
  // 0x na początku lub po znaku: y=0x+1 -> y=1
  out = out.replace(/(^|[=+\-])0([a-zA-Z])(?=[+\-=]|$)/g, "$1");
  // końcowe +0 / -0: 3n+0, y=x+0, x^2+6x+0=0, (x-2)^2+0
  out = out.replace(/[+\-]0(?=[=}\])$,;]|$)/g, "");
  // 1x -> x, -1x -> -x, +1x -> +x
  out = out.replace(/(^|[=+\-(])1([a-zA-Z])(?![a-zA-Z0-9])/g, "$1$2");
  out = out.replace(/(^|[=+\-(])-1([a-zA-Z])(?![a-zA-Z0-9])/g, "$1-$2");
  // \cdot 1 -> \cdot (bez zmiany wartości, tylko czytelniej)
  out = out.replace(/\\cdot\s*1(?![0-9])/g, "");

  return roundLongDecimals(out);
}

function cleanText(text: string): string {
  if (!text) return text;
  return text.replace(/\$([^$]*)\$/g, (_match, inner: string) => `$${cleanMath(inner)}$`);
}

let files = 0;
let changed = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith(".json")) continue;
  const full = path.join(DIR, file);
  const bundle = JSON.parse(fs.readFileSync(full, "utf8")) as {
    tasks?: Array<Record<string, unknown>>;
  };
  if (!Array.isArray(bundle.tasks)) continue;
  files += 1;

  for (const task of bundle.tasks) {
    for (const key of ["content", "correct_answer", "explanation"] as const) {
      const value = task[key];
      if (typeof value !== "string") continue;
      const next = cleanText(value);
      if (next !== value) {
        task[key] = next;
        changed += 1;
      }
    }
    if (Array.isArray(task.options)) {
      task.options = task.options.map((option) =>
        typeof option === "string" ? cleanText(option) : option,
      );
    }
  }

  fs.writeFileSync(full, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
}

console.log(`Pliki: ${files}, zmienione pola: ${changed}`);
