#!/usr/bin/env node
/**
 * Audyt odpowiedzi w tabeli `tasks` (Supabase) dla czystych wyrażeń arytmetycznych.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *     npm run audit:db-tasks
 *
 * Opcjonalnie zapisuje SQL z poprawkami:
 *
 *   npm run audit:db-tasks -- --sql docs/sql/fix-tasks.sql
 *
 * Skrypt czyta tylko zadania z `tasks`, których treść jest czystym wyrażeniem
 * (zaczyna się od „Oblicz wartość wyrażenia”, „Uprość”, „Wartość wyrażenia”,
 * „Oblicz:”) i porównuje `correct_answer` z wynikiem policzonym lokalnie.
 * Nie modyfikuje bazy - SQL trzeba uruchomić samodzielnie.
 */
import fs from "node:fs";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/$/, "");
const API_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

if (!SUPABASE_URL || !API_KEY) {
  console.error(
    "Brak NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY w środowisku.",
  );
  process.exit(2);
}

const sqlFlagIndex = process.argv.indexOf("--sql");
const sqlPath =
  sqlFlagIndex !== -1 && process.argv[sqlFlagIndex + 1]
    ? process.argv[sqlFlagIndex + 1]
    : null;

async function fetchAllTasks() {
  const rows = [];
  let offset = 0;
  for (;;) {
    const url = `${SUPABASE_URL}/rest/v1/tasks?select=id,content,options,correct_answer,topic,exam_type,difficulty&limit=1000&offset=${offset}`;
    const response = await fetch(url, { headers: { apikey: API_KEY } });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const page = await response.json();
    rows.push(...page);
    if (page.length < 1000) break;
    offset += 1000;
  }
  return rows;
}

function normalize(raw) {
  let text = raw.replace(/\$/g, "");
  text = text.replace(/\\sqrt\s*\{([^{}]+)\}/g, "sqrt($1)");
  text = text.replace(/\\sqrt\s*(\d+)/g, "sqrt($1)");
  text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "(($1)/($2))");
  text = text.replace(/\\times|\\cdot/g, "*");
  text = text.replace(/\\div/g, "/");
  text = text.replace(/:/g, "/");
  text = text.replace(/\\left|\\right/g, "");
  text = text.replace(/\\[,;!]/g, "");
  text = text.replace(/\^\{([^{}]+)\}/g, "^($1)");
  text = text.replace(/\s+/g, "");
  text = text.replace(/(\d),(\d)/g, "$1.$2");
  return text;
}

function parseExpression(text) {
  let index = 0;
  function expression() {
    let value = term();
    for (;;) {
      const op = text[index];
      if (op !== "+" && op !== "-") break;
      index += 1;
      const right = term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }
  function term() {
    let value = factor();
    for (;;) {
      const op = text[index];
      if (op !== "*" && op !== "/") break;
      index += 1;
      const right = factor();
      if (op === "/" && right === 0) throw new Error("dzielenie przez 0");
      value = op === "*" ? value * right : value / right;
    }
    return value;
  }
  function factor() {
    let value = unary();
    if (text[index] === "^") {
      index += 1;
      value = value ** factor();
    }
    return value;
  }
  function unary() {
    if (text[index] === "-") {
      index += 1;
      return -unary();
    }
    if (text[index] === "+") {
      index += 1;
      return unary();
    }
    return primary();
  }
  function primary() {
    if (text.startsWith("sqrt(", index)) {
      index += 5;
      const inner = expression();
      if (text[index] !== ")") throw new Error("brak )");
      index += 1;
      if (inner < 0) throw new Error("pierwiastek z liczby ujemnej");
      return Math.sqrt(inner);
    }
    if (text[index] === "(") {
      index += 1;
      const inner = expression();
      if (text[index] !== ")") throw new Error("brak )");
      index += 1;
      return inner;
    }
    const match = /^\d+(?:\.\d+)?/.exec(text.slice(index));
    if (!match) throw new Error(`nieznany token: ${text.slice(index)}`);
    index += match[0].length;
    return Number(match[0]);
  }
  const value = expression();
  if (index !== text.length) throw new Error(`nadmiar: ${text.slice(index)}`);
  return value;
}

function answerNumber(raw) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/(\d),(\d)/g, "$1.$2").replace(/\s/g, "");
  if (!/^-?\d+(?:\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

function expressionFromContent(content) {
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  const stems = [
    "Oblicz wartość wyrażenia",
    "Uprość",
    "Wartość wyrażenia",
    "Oblicz:",
  ];
  if (!stems.some((stem) => trimmed.startsWith(stem))) return null;
  const math = trimmed.match(/\$([^$]+)\$/);
  const candidate = math ? math[1] : trimmed;
  const normalized = normalize(candidate);
  if (!/^[0-9+\-*/^().sqrt]+$/.test(normalized)) return null;
  if (!/[+\-*/^]/.test(normalized.replace(/^-/, ""))) return null;
  return normalized;
}

const round = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits;

const tasks = await fetchAllTasks();
const checked = [];
const mismatched = [];
const notInOptions = [];

for (const task of tasks) {
  const options = Array.isArray(task.options) ? task.options : [];
  const stored = answerNumber(task.correct_answer);
  const expression = expressionFromContent(task.content);
  if (!expression || stored === null) continue;

  let computed = null;
  try {
    computed = parseExpression(expression);
  } catch {
    continue;
  }
  if (!Number.isFinite(computed) || Math.abs(computed) > 1e9) continue;

  const exact = Math.abs(computed - stored) < 1e-9;
  const rounded =
    Math.abs(round(computed, 1) - stored) < 1e-9 ||
    Math.abs(round(computed, 2) - stored) < 1e-9;
  checked.push({ id: task.id, exact, rounded });

  if (exact || rounded) continue;
  mismatched.push({ ...task, computed });

  const hasComputed = options.some((option) => {
    const value = answerNumber(String(option));
    return value !== null && Math.abs(value - computed) < 1e-9;
  });
  if (!hasComputed) notInOptions.push({ ...task, computed });
}

console.log(`Zadań w tabeli: ${tasks.length}`);
console.log(`Sprawdzone wyrażenia arytmetyczne: ${checked.length}`);
console.log(`Niezgodne z kluczem: ${mismatched.length}`);
console.log(`  z tego poprawna odpowiedź nie jest w opcjach: ${notInOptions.length}`);

for (const row of mismatched.slice(0, 20)) {
  console.log(
    `- ${row.id} | klucz=${row.correct_answer} | policzone=${row.computed} | ${String(row.content).replace(/\s+/g, " ").slice(0, 90)}`,
  );
}
if (mismatched.length > 20) {
  console.log(`... i ${mismatched.length - 20} więcej`);
}

if (sqlPath) {
  const escape = (value) => String(value).replace(/'/g, "''");
  const lines = [
    "-- Poprawki zadań po audycie arytmetyki (npm run audit:db-tasks --sql).",
    "begin;",
  ];
  for (const row of mismatched) {
    const computed = String(round(row.computed, 2));
    const options = Array.isArray(row.options) ? row.options : [];
    const hasComputed = options.some((option) => {
      const value = answerNumber(String(option));
      return value !== null && Math.abs(value - row.computed) < 1e-9;
    });
    if (options.length === 0 || hasComputed) {
      lines.push(
        `update public.tasks set correct_answer = '${escape(computed)}' where id = '${row.id}';`,
      );
    } else {
      lines.push(
        `update public.tasks set correct_answer = '${escape(computed)}', options = array_replace(options, '${escape(row.correct_answer)}', '${escape(computed)}') where id = '${row.id}';`,
      );
    }
  }
  lines.push("commit;", "");
  fs.writeFileSync(sqlPath, lines.join("\n"), "utf8");
  console.log(`SQL zapisany: ${sqlPath}`);
}

process.exitCode = 0;
