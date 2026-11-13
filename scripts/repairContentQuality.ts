/**
 * Audyt i naprawa jakości treści zadań.
 *
 * Wykrywa i usuwa:
 *   - dokładne duplikaty w `tasks` (to samo pytanie wielokrotnie w temacie),
 *   - opcje-artefakty typu `NaN` / `undefined`,
 *   - niewidoczne znaki (ZWSP/ZWNJ/BOM) w treści,
 *   - encje HTML w arkuszach CKE (`&frasl;`, `&fnof;`, ...).
 *
 * Domyślnie tryb „dry run”: pokazuje skalę i próbki, nic nie zapisuje.
 *
 *   npx tsx scripts/repairContentQuality.ts
 *   npx tsx scripts/repairContentQuality.ts --apply
 *   npx tsx scripts/repairContentQuality.ts --only=duplicates
 *   npx tsx scripts/repairContentQuality.ts --only=options,invisible,entities
 *
 * `--apply` wymaga SUPABASE_SERVICE_ROLE_KEY (RLS blokuje zapis kluczem anon).
 */
import path from "path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decodeCkeHtmlEntities } from "../lib/baza-zadan/cke/parse-abcd";
import {
  findDuplicateTaskGroups,
  isInvalidOption,
  pickDuplicateKeeper,
  repairChoiceOptions,
  stripInvisibleChars,
} from "../lib/content/quality";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type TaskRow = {
  id: string;
  exam_type: string;
  category: string;
  topic: string;
  content: string;
  options: unknown;
  correct_answer: string;
};

type ZadanieRow = {
  id: string;
  tresc: string | null;
  rozwiazanie: string | null;
};

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const onlyArg = [...args].find((arg) => arg.startsWith("--only="));
const only = new Set(
  (onlyArg?.slice("--only=".length) ?? "duplicates,options,invisible,entities")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

const HAS_INVISIBLE = /[\u200B-\u200D\uFEFF]/;
const ENTITY_RE = /&[a-zA-Z#0-9]+;/g;

function parseOptions(raw: unknown): { values: string[]; wasString: boolean } {
  if (Array.isArray(raw)) return { values: raw.map(String), wasString: false };
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return { values: parsed.map(String), wasString: true };
      }
    } catch {
      return { values: [], wasString: false };
    }
  }
  return { values: [], wasString: false };
}

async function loadTasks(supabase: SupabaseClient): Promise<TaskRow[]> {
  const rows: TaskRow[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, exam_type, category, topic, content, options, correct_answer")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as TaskRow[]));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

async function loadZadania(supabase: SupabaseClient): Promise<ZadanieRow[]> {
  const rows: ZadanieRow[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("zadania")
      .select("id, tresc, rozwiazanie")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as ZadanieRow[]));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

function preview(value: string, length = 90): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return JSON.stringify(flat.length > length ? `${flat.slice(0, length)}...` : flat);
}

async function mapLimit<T>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      if (current !== undefined) await run(current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL i klucza Supabase w .env.local.");
  }
  if (apply && !serviceKey) {
    throw new Error(
      "--apply wymaga SUPABASE_SERVICE_ROLE_KEY (polityki RLS blokują zapis kluczem anon).",
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("\n=== Audyt jakości treści ===\n");
  console.log(`Tryb: ${apply ? "APPLY" : "dry-run"} | zakres: ${[...only].join(", ")}`);

  const tasks = await loadTasks(supabase);
  const zadania = await loadZadania(supabase);
  console.log(`Zadania treningowe: ${tasks.length}`);
  console.log(`Zadania CKE: ${zadania.length}\n`);

  // --- 1. Duplikaty -------------------------------------------------------
  const duplicateDeletes: string[] = [];
  const duplicateSamples: string[] = [];

  if (only.has("duplicates")) {
    const groups = findDuplicateTaskGroups(
      tasks,
      (task) => `${task.exam_type}/${task.category}/${task.topic}`,
    );

    for (const group of groups) {
      const keeper = pickDuplicateKeeper(group);
      for (const task of group) {
        if (task.id !== keeper.id) duplicateDeletes.push(task.id);
      }
      if (duplicateSamples.length < 8) {
        duplicateSamples.push(
          `${group.length}x [${keeper.topic}] ${preview(keeper.content, 70)}`,
        );
      }
    }

    console.log("--- Duplikaty ---");
    console.log(`grupy: ${groups.length}`);
    console.log(`do usunięcia: ${duplicateDeletes.length}`);
    for (const sample of duplicateSamples) console.log(`  ${sample}`);
    console.log();
  }

  // --- 2. Opcje-artefakty i niewidoczne znaki -----------------------------
  const deletedIds = new Set(duplicateDeletes);
  const optionUpdates: Array<{ id: string; payload: unknown }> = [];
  const invisibleUpdates: Array<{ id: string; content: string }> = [];
  const optionSamples: string[] = [];
  let invalidOptionCount = 0;
  let invisibleCount = 0;

  for (const task of tasks) {
    // Rekordy przeznaczone do usunięcia pomijamy - nie ma sensu ich naprawiać.
    if (deletedIds.has(task.id)) continue;

    if (only.has("options")) {
      const parsed = parseOptions(task.options);
      if (parsed.values.length > 0) {
        const hadInvalid = parsed.values.some((value) => isInvalidOption(value));
        if (hadInvalid) {
          const repaired = repairChoiceOptions(task.correct_answer, parsed.values);
          invalidOptionCount += parsed.values.filter((value) =>
            isInvalidOption(value),
          ).length;
          optionUpdates.push({
            id: task.id,
            payload: parsed.wasString ? JSON.stringify(repaired) : repaired,
          });
          if (optionSamples.length < 5) {
            optionSamples.push(
              `[${task.topic}] ${preview(task.content, 55)} | ${JSON.stringify(
                parsed.values,
              )} -> ${JSON.stringify(repaired)}`,
            );
          }
        }
      }
    }

    if (only.has("invisible") && HAS_INVISIBLE.test(task.content)) {
      invisibleCount += (task.content.match(/[\u200B-\u200D\uFEFF]/g) ?? []).length;
      invisibleUpdates.push({
        id: task.id,
        content: stripInvisibleChars(task.content),
      });
    }
  }

  if (only.has("options")) {
    console.log("--- Opcje-artefakty ---");
    console.log(`zadania do naprawy: ${optionUpdates.length}`);
    console.log(`uszkodzonych opcji: ${invalidOptionCount}`);
    for (const sample of optionSamples) console.log(`  ${sample}`);
    console.log();
  }

  if (only.has("invisible")) {
    console.log("--- Niewidoczne znaki ---");
    console.log(`zadania: ${invisibleUpdates.length}, znaków: ${invisibleCount}`);
    console.log();
  }

  // --- 3. Encje HTML w CKE ------------------------------------------------
  const entityUpdates: Array<{
    id: string;
    tresc?: string;
    rozwiazanie?: string;
    count: number;
  }> = [];
  let entityCount = 0;

  if (only.has("entities")) {
    for (const row of zadania) {
      const tresc = row.tresc ?? "";
      const rozwiazanie = row.rozwiazanie ?? "";
      const nextTresc = decodeCkeHtmlEntities(stripInvisibleChars(tresc));
      const nextRozwiazanie = decodeCkeHtmlEntities(
        stripInvisibleChars(rozwiazanie),
      );
      if (nextTresc === tresc && nextRozwiazanie === rozwiazanie) continue;

      const count =
        (tresc.match(ENTITY_RE) ?? []).length +
        (rozwiazanie.match(ENTITY_RE) ?? []).length;
      entityCount += count;
      entityUpdates.push({
        id: row.id,
        tresc: nextTresc !== tresc ? nextTresc : undefined,
        rozwiazanie: nextRozwiazanie !== rozwiazanie ? nextRozwiazanie : undefined,
        count,
      });
    }

    console.log("--- Encje HTML w CKE ---");
    console.log(`zadania: ${entityUpdates.length}, encji: ${entityCount}`);
    console.log();
  }

  const totalChanges =
    duplicateDeletes.length +
    optionUpdates.length +
    invisibleUpdates.length +
    entityUpdates.length;

  if (totalChanges === 0) {
    console.log("✓ Brak problemów jakości treści.\n");
    return;
  }

  if (!apply) {
    console.log(
      `[DRY RUN] Łącznie zmian: ${totalChanges}. Użyj --apply, aby zapisać.\n`,
    );
    process.exit(1);
  }

  // --- Zapis --------------------------------------------------------------
  let updated = 0;
  let deleted = 0;

  await mapLimit(optionUpdates, 10, async (update) => {
    const { error } = await supabase
      .from("tasks")
      .update({ options: update.payload })
      .eq("id", update.id);
    if (error) throw new Error(`Update options ${update.id}: ${error.message}`);
    updated += 1;
  });

  await mapLimit(invisibleUpdates, 10, async (update) => {
    const { error } = await supabase
      .from("tasks")
      .update({ content: update.content })
      .eq("id", update.id);
    if (error) throw new Error(`Update content ${update.id}: ${error.message}`);
    updated += 1;
  });

  await mapLimit(entityUpdates, 10, async (update) => {
    const payload: Record<string, string> = {};
    if (update.tresc !== undefined) payload.tresc = update.tresc;
    if (update.rozwiazanie !== undefined) payload.rozwiazanie = update.rozwiazanie;
    const { error } = await supabase
      .from("zadania")
      .update(payload)
      .eq("id", update.id);
    if (error) throw new Error(`Update zadanie ${update.id}: ${error.message}`);
    updated += 1;
  });

  for (let i = 0; i < duplicateDeletes.length; i += 100) {
    const ids = duplicateDeletes.slice(i, i + 100);
    const { error } = await supabase.from("tasks").delete().in("id", ids);
    if (error) throw new Error(`Delete duplicates: ${error.message}`);
    deleted += ids.length;
  }

  console.log("=== Zapisane ===");
  console.log(`zaktualizowane: ${updated}`);
  console.log(`usunięte duplikaty: ${deleted}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
