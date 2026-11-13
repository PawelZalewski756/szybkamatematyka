/**
 * Naprawa formatowania treści matematycznych (LaTeX) w zadaniach i materiałach.
 *
 * Domyślnie tryb „dry run”: pokazuje, co zostałoby poprawione, ale nic nie zapisuje.
 *
 *   npx tsx scripts/repairFormatting.ts                 # cache + baza (jeśli jest .env.local)
 *   npx tsx scripts/repairFormatting.ts --cache-only    # tylko data/tasks-cache i data/theory-cache
 *   npx tsx scripts/repairFormatting.ts --db-only       # tylko Supabase
 *   npx tsx scripts/repairFormatting.ts --apply         # zapisuje poprawki
 *
 * Naprawia dokładnie te same artefakty, które renderowanie poprawia w locie
 * (`normalizeMathText`): zjedzone `\times` / `\frac` / `\theta`, nadmiarowe
 * lub brakujące `$`, surowy LaTeX poza formułą.
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  findMathTextIssues,
  normalizeMathText,
} from "../lib/math/normalize-math-text";
import {
  listAllTaskSlots,
  readTaskCache,
  writeTaskCache,
} from "../lib/trening/seed/tasks-cache-utils";
import type { CachedGeminiTask } from "../lib/trening/seed/tasks-cache-utils";
import {
  listAllTheorySlots,
  theoryCachePath,
} from "../lib/trening/seed/theory-cache-utils";
import type { CachedTheoryFile } from "../lib/trening/seed/theory-cache-utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const cacheOnly = args.has("--cache-only");
const dbOnly = args.has("--db-only");

type Change = {
  where: string;
  field: string;
  before: string;
  after: string;
  issues: string[];
};

const changes: Change[] = [];
let scanned = 0;

function normalizeField(where: string, field: string, value: string): string {
  scanned += 1;
  const normalized = normalizeMathText(value);
  if (normalized !== value) {
    changes.push({
      where,
      field,
      before: value,
      after: normalized,
      issues: findMathTextIssues(value),
    });
  }
  return normalized;
}

function preview(value: string): string {
  return JSON.stringify(value.length > 120 ? `${value.slice(0, 117)}...` : value);
}

function repairCachedTasks(): void {
  for (const slot of listAllTaskSlots()) {
    const bundle = readTaskCache(slot);
    if (!bundle?.tasks.length) continue;
    const where = `tasks-cache/${slot.exam_type}__${slot.category}__${slot.topic}`;
    let changed = false;

    const tasks: CachedGeminiTask[] = bundle.tasks.map((task) => {
      const content = normalizeField(where, "content", task.content);
      const explanation = normalizeField(where, "explanation", task.explanation);
      const options = task.options.map((option, index) =>
        normalizeField(where, `options[${index}]`, option),
      );
      const next = { ...task, content, explanation, options };
      if (
        next.content !== task.content ||
        next.explanation !== task.explanation ||
        next.options.some((option, index) => option !== task.options[index])
      ) {
        changed = true;
      }
      return next;
    });

    if (changed && apply) writeTaskCache({ ...bundle, tasks });
  }
}

function repairCachedTheory(): void {
  for (const slot of listAllTheorySlots()) {
    const file = theoryCachePath(slot);
    if (!fs.existsSync(file)) continue;
    let entry: CachedTheoryFile;
    try {
      entry = JSON.parse(fs.readFileSync(file, "utf8")) as CachedTheoryFile;
    } catch {
      continue;
    }
    if (!entry?.content) continue;

    const where = `theory-cache/${path.basename(file)}`;
    const content = normalizeField(where, "content", entry.content);
    if (content !== entry.content && apply) {
      fs.writeFileSync(file, JSON.stringify({ ...entry, content }, null, 2), "utf8");
    }
  }
}

function parseOptionsValue(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    return raw.map(String);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return null;
    }
  }
  return null;
}

async function repairDatabase(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.log("Pominięto bazę: brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n");
    return;
  }

  const supabase = createClient(url, key);
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, exam_type, category, topic, content, explanation, options")
      .range(from, from + pageSize - 1);
    if (error) throw error;

    const rows = (data ?? []) as Array<{
      id: string;
      exam_type: string;
      category: string;
      topic: string;
      content: string;
      explanation: string | null;
      options: unknown;
    }>;

    for (const row of rows) {
      const where = `tasks/${row.exam_type}/${row.category}/${row.topic}/${row.id}`;
      const content = normalizeField(where, "content", row.content);
      const explanation = row.explanation
        ? normalizeField(where, "explanation", row.explanation)
        : null;

      const options = parseOptionsValue(row.options);
      let nextOptions: unknown = row.options;
      if (options) {
        const normalized = options.map((option, index) =>
          normalizeField(where, `options[${index}]`, option),
        );
        if (normalized.some((option, index) => option !== options[index])) {
          nextOptions =
            Array.isArray(row.options) ? normalized : JSON.stringify(normalized);
        }
      }

      if (!apply) continue;
      if (
        content !== row.content ||
        explanation !== row.explanation ||
        nextOptions !== row.options
      ) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ content, explanation, options: nextOptions })
          .eq("id", row.id);
        if (updateError) {
          throw new Error(`Update ${row.id}: ${updateError.message}`);
        }
      }
    }

    if (!data || data.length < pageSize) break;
  }

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("materials")
      .select("id, exam_type, category, topic, content")
      .range(from, from + pageSize - 1);
    if (error) throw error;

    const rows = (data ?? []) as Array<{
      id: string;
      exam_type: string;
      category: string;
      topic: string;
      content: string | null;
    }>;

    for (const row of rows) {
      if (!row.content) continue;
      const where = `materials/${row.exam_type}/${row.category}/${row.topic}/${row.id}`;
      const content = normalizeField(where, "content", row.content);
      if (apply && content !== row.content) {
        const { error: updateError } = await supabase
          .from("materials")
          .update({ content })
          .eq("id", row.id);
        if (updateError) {
          throw new Error(`Update material ${row.id}: ${updateError.message}`);
        }
      }
    }

    if (!data || data.length < pageSize) break;
  }
}

async function main() {
  console.log("\n=== Naprawa formatowania treści matematycznych ===\n");

  if (!dbOnly) {
    repairCachedTasks();
    repairCachedTheory();
  }
  if (!cacheOnly) {
    await repairDatabase();
  }

  console.log(`Sprawdzone pola: ${scanned}`);
  console.log(`Do poprawy: ${changes.length}\n`);

  for (const change of changes.slice(0, 25)) {
    console.log(`[${change.where}] ${change.field}`);
    console.log(`  problem: ${change.issues.join("; ") || "formatowanie"}`);
    console.log(`  przed  : ${preview(change.before)}`);
    console.log(`  po     : ${preview(change.after)}`);
  }
  if (changes.length > 25) {
    console.log(`… i ${changes.length - 25} więcej`);
  }

  if (changes.length === 0) {
    console.log("\n✓ Brak problemów z formatowaniem.\n");
    return;
  }

  if (!apply) {
    console.log("\n[DRY RUN] Nic nie zapisano. Użyj --apply, aby wykonać naprawę.\n");
    process.exit(1);
  }

  console.log("\n✓ Poprawki zapisane.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
