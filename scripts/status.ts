/**
 * Generuje `docs/STATUS.md` - jedno miejsce z aktualnymi liczbami projektu.
 *
 *   npm run status        # zapisz docs/STATUS.md
 *   npm run status:check  # tylko sprawdź, czy plik jest aktualny (CI)
 *
 * Blok między markerami jest deterministyczny: nie zawiera daty ani SHA,
 * więc CI może porównać go bez fałszywych alarmów po każdym commicie.
 * Data, branch i commit są w nagłówku, poza blokiem.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getAllTasks, getPrerenderTaskIds } from "../lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "../lib/baza-zadan/exam-sheets";
import {
  EXAM_ARCHIVE_SHEETS,
  EXAM_ARCHIVE_TASKS,
} from "../lib/baza-zadan/exams/cke-archive.generated";
import { SEED_MATERIALS } from "../lib/trening/seed/materials";
import { THEORY_INDEX } from "../lib/trening/seed/theory-index";

const ROOT = process.cwd();
const STATUS_PATH = join(ROOT, "docs/STATUS.md");
const START = "<!-- STATUS:START -->";
const END = "<!-- STATUS:END -->";

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "test-results",
  "playwright-report",
  "coverage",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), out);
    } else {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function countFiles(dir: string, extension: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((name) => name.endsWith(extension)).length;
}

function git(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: "utf8" }).trim();
  } catch {
    return "brak";
  }
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function buildBlock(): string {
  const files = walk(ROOT);
  const sourceFiles = files.filter(
    (file) => file.endsWith(".ts") || file.endsWith(".tsx"),
  );

  const testFiles = files.filter(
    (file) => file.includes(`${join(ROOT, "tests")}`) && file.endsWith(".test.ts"),
  );
  const testAssertions = testFiles.reduce(
    (sum, file) =>
      sum +
      (readFileSync(file, "utf8").match(/\b(it|test)\(/g) ?? []).length,
    0,
  );

  const e2eFiles = files.filter(
    (file) => file.includes(`${join(ROOT, "e2e")}`) && file.endsWith(".spec.ts"),
  );
  const e2eTests = e2eFiles.reduce(
    (sum, file) => sum + (readFileSync(file, "utf8").match(/\btest\(/g) ?? []).length,
    0,
  );

  const appFiles = files
    .map((file) => file.slice(ROOT.length + 1).replace(/\\/g, "/"))
    .filter((path) => path.startsWith("app/"));
  const pages = appFiles.filter((path) => path.endsWith("/page.tsx"));
  const apiRoutes = appFiles.filter((path) => path.endsWith("/route.ts"));

  const rows: Array<[string, string, string]> = [
    ["Zadania w katalogu statycznym", String(getAllTasks().length), "`lib/baza-zadan/catalog.ts`"],
    ["Zadania prerenderowane", String(getPrerenderTaskIds().length), "`getPrerenderTaskIds()`"],
    ["Zadania w archiwum CKE", String(EXAM_ARCHIVE_TASKS.length), "`cke-archive.generated.ts`"],
    ["Sesje CKE", String(EXAM_ARCHIVE_SHEETS.length), "`EXAM_ARCHIVE_SHEETS`"],
    ["Arkusze treningowe", String(EXAM_SHEETS.length), "`exam-sheets.ts`"],
    ["Tematy teorii", String(THEORY_INDEX.length), "`theory-index.ts`"],
    ["Lekcje teorii (seed)", String(SEED_MATERIALS.length), "`materials.ts`"],
    ["Pliki cache zadań (JSON)", String(countFiles(join(ROOT, "data/tasks-cache"), ".json")), "`data/tasks-cache`"],
    ["Pliki cache teorii (JSON)", String(countFiles(join(ROOT, "data/theory-cache"), ".json")), "`data/theory-cache`"],
    ["Migracje Supabase", String(countFiles(join(ROOT, "supabase/migrations"), ".sql")), "`supabase/migrations`"],
    ["Strony App Router", String(pages.length), "`app/**/page.tsx`"],
    ["Endpointy API", String(apiRoutes.length), "`app/**/route.ts`"],
    ["Pliki źródłowe TS/TSX", String(sourceFiles.length), "bez `node_modules`"],
    ["Pliki testów jednostkowych", String(testFiles.length), "`tests/*.test.ts`"],
    ["Asercje `it`/`test` w testach", String(testAssertions), "statycznie"],
    ["Pliki E2E", String(e2eFiles.length), "`e2e/*.spec.ts`"],
    ["Scenariusze E2E", String(e2eTests), "statycznie"],
  ];

  return [
    "| Co | Wartość | Źródło |",
    "|---|---:|---|",
    ...rows.map(
      ([label, value, source]) =>
        `| ${escapeCell(label)} | ${value} | ${escapeCell(source)} |`,
    ),
  ].join("\n");
}

function readExistingBlock(): string | null {
  if (!existsSync(STATUS_PATH)) return null;
  const content = readFileSync(STATUS_PATH, "utf8");
  const start = content.indexOf(START);
  const end = content.indexOf(END);
  if (start === -1 || end === -1) return null;
  return content.slice(start + START.length, end).trim();
}

function writeStatus(block: string): void {
  const date = new Date().toISOString().slice(0, 16).replace("T", " ");
  const branch = git("rev-parse --abbrev-ref HEAD");
  const sha = git("rev-parse --short HEAD");
  const content = [
    "# STATUS - Szybka Matematyka",
    "",
    "> Plik generowany przez `npm run status`. Nie edytuj ręcznie.",
    `> Ostatnia aktualizacja: ${date} UTC · branch \`${branch}\` · commit \`${sha}\``,
    "",
    "Liczby poniżej pochodzą z kodu i danych w repo. Stan bazy Supabase,",
    "płatności i ruchu nie jest tutaj mierzony - to sprawdza się w panelach.",
    "",
    START,
    block,
    END,
    "",
  ].join("\n");
  writeFileSync(STATUS_PATH, content, "utf8");
}

function main(): void {
  const check = process.argv.includes("--check");
  const block = buildBlock();

  if (check) {
    const existing = readExistingBlock();
    // Windows/autocrlf potrafi zapisać plik z CRLF - porównujemy po normalizacji.
    const normalize = (value: string | null) =>
      (value ?? "").replace(/\r\n/g, "\n").trim();
    if (normalize(existing) !== normalize(block)) {
      console.error(
        "docs/STATUS.md jest nieaktualny. Uruchom `npm run status` i zacommituj zmianę.",
      );
      process.exit(1);
    }
    console.log("docs/STATUS.md aktualny.");
    return;
  }

  writeStatus(block);
  console.log(`Zapisano ${STATUS_PATH}`);
}

main();
