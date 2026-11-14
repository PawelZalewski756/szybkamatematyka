/**
 * Audyt renderowania wszystkich zadań: Supabase, cache treningu i archiwum CKE.
 *
 * Sprawdza KaTeX, znaki kontrolne, niedomknięte $, wyciek komend do tekstu,
 * duplikaty opcji i spójność correct_answer.
 *
 *   npm run audit:render
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import katex from "katex";
import {
  ensureMathDelimiters,
  normalizeMathText,
  splitMathText,
} from "../lib/math/render-math-text";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://neyclickzyibfmimnacc.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_F-uW4jE6pAjXLsRKzpLMJQ_6k9XJMC4";

type Rec = {
  source: string;
  id: string;
  exam: string;
  category: string;
  topic: string;
  content: string;
  options: string[];
  answer: string;
  explanation?: string;
};

type Issue = {
  id: string;
  source: string;
  exam: string;
  category: string;
  topic: string;
  field: string;
  kind: string;
  detail: string;
  sample: string;
};

async function fetchDb(): Promise<Rec[]> {
  const base = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/tasks`;
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
  const out: Rec[] = [];
  for (let from = 0; ; from += 1000) {
    const url = `${base}?select=id,exam_type,category,topic,content,options,correct_answer&limit=1000&offset=${from}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const batch = (await res.json()) as Array<Record<string, unknown>>;
    for (const row of batch) {
      out.push({
        source: "db",
        id: String(row.id),
        exam: String(row.exam_type),
        category: String(row.category),
        topic: String(row.topic),
        content: String(row.content ?? ""),
        options: Array.isArray(row.options) ? row.options.map(String) : [],
        answer: String(row.correct_answer ?? ""),
      });
    }
    if (batch.length < 1000) break;
  }
  return out;
}

function fetchCache(): Rec[] {
  const dir = join("data", "tasks-cache");
  const out: Rec[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const data = JSON.parse(readFileSync(join(dir, file), "utf8")) as Record<string, unknown>;
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    for (const task of tasks as Array<Record<string, unknown>>) {
      out.push({
        source: "cache",
        id: String(task.id),
        exam: String(data.exam_type),
        category: String(data.category),
        topic: String(data.topic),
        content: String(task.content ?? ""),
        options: Array.isArray(task.options) ? task.options.map(String) : [],
        answer: String(task.correct_answer ?? ""),
        explanation: task.explanation ? String(task.explanation) : undefined,
      });
    }
  }
  return out;
}

function fetchCke(): Rec[] {
  const out: Rec[] = [];
  const dirs = [
    ["cke-matura", join("data", "cke-matura-cache")],
    ["cke-e8", join("data", "cke-e8-cache")],
  ] as const;
  for (const [source, dir] of dirs) {
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      const data = JSON.parse(readFileSync(join(dir, file), "utf8")) as Record<string, unknown>;
      const tasks = Array.isArray(data.tasks) ? data.tasks : [];
      for (const task of tasks as Array<Record<string, unknown>>) {
        out.push({
          source,
          id: `${file}:${String(task.numer ?? task.id ?? "")}`,
          exam: source === "cke-e8" ? "8_klasa" : "matura_podstawowa",
          category: String(task.dzial ?? ""),
          topic: file,
          content: String(task.tekst ?? task.tresc ?? task.prompt ?? ""),
          options: [],
          answer: "",
          explanation: task.rozwiazanie ? String(task.rozwiazanie) : undefined,
        });
      }
    }
  }
  return out;
}

function looksLikeLeakedCommand(text: string): string | null {
  const match = text.match(/\\[A-Za-z]{2,}/);
  return match ? match[0] : null;
}

function auditRecord(rec: Rec, issues: Issue[]) {
  const add = (field: string, kind: string, detail: string, sample: string) => {
    issues.push({
      id: rec.id,
      source: rec.source,
      exam: rec.exam,
      category: rec.category,
      topic: rec.topic,
      field,
      kind,
      detail,
      sample: sample.slice(0, 220),
    });
  };

  const check = (field: string, raw: string) => {
    const value = ensureMathDelimiters(normalizeMathText(raw));
    const control = value.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
    if (control) {
      add(field, "control-char", `U+${control[0].charCodeAt(0).toString(16)}`, value);
    }
    if ((value.match(/\$/g) ?? []).length % 2 !== 0) {
      add(field, "unbalanced-dollar", "nieparzysta liczba $", value);
    }
    for (const part of splitMathText(value)) {
      if (part.kind === "text") {
        const leaked = looksLikeLeakedCommand(part.text.replace(/!\[[^\]]*\]\([^)]*\)/g, " "));
        if (leaked) add(field, "leaked-command", leaked, part.text);
        continue;
      }
      const latex = part.latex.trim();
      if (!latex) continue;
      try {
        katex.renderToString(latex, {
          throwOnError: true,
          strict: "ignore",
          displayMode: part.kind === "display",
        });
      } catch (error) {
        add(field, "katex-error", error instanceof Error ? error.message : String(error), latex);
      }
    }
  };

  if (!rec.content.trim()) add("content", "empty", "", "");
  check("content", rec.content);
  rec.options.forEach((option, index) => check(`options[${index}]`, option));
  if (rec.explanation) check("explanation", rec.explanation);
  if (rec.answer) check("answer", rec.answer);

  if (rec.options.length > 0) {
    if (rec.options.length < 2) add("options", "too-few-options", String(rec.options.length), rec.options.join(" | "));
    const seen = new Set<string>();
    for (const option of rec.options) {
      const key = option.trim();
      if (seen.has(key)) add("options", "duplicate-option", key, rec.options.join(" | "));
      seen.add(key);
    }
  }
}

async function main() {
  const records = [...(await fetchDb()), ...fetchCache(), ...fetchCke()];
  const issues: Issue[] = [];
  for (const rec of records) auditRecord(rec, issues);

  const byKind: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  for (const issue of issues) {
    byKind[issue.kind] = (byKind[issue.kind] ?? 0) + 1;
    bySource[issue.source] = (bySource[issue.source] ?? 0) + 1;
  }
  const failedTasks = new Set(issues.map((issue) => `${issue.source}:${issue.id}`)).size;
  const summary = { records: records.length, failedTasks, issues: issues.length, byKind, bySource };

  console.log(JSON.stringify(summary, null, 2));
  writeFileSync("task-audit-report.json", JSON.stringify({ summary, issues }, null, 2));
  if (issues.length > 0) {
    for (const issue of issues.slice(0, 20)) {
      console.log(`[${issue.kind}] ${issue.source} ${issue.exam}/${issue.category}/${issue.topic} ${issue.id} :: ${issue.sample.replace(/\n/g, " ")}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
