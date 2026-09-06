/**
 * Repairs known-invalid records in the production `tasks` table.
 *
 * Dry run:
 *   npx tsx scripts/repairProductionTasks.ts
 *
 * Apply:
 *   npx tsx scripts/repairProductionTasks.ts --apply
 */
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  checkAnswerMatch,
  findEquivalentChoiceGroups,
} from "../lib/math/answer-equiv";
import { SEED_TOPIC_SLOTS, slotKey } from "../lib/trening/seed/topics";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type TaskRow = {
  id: string;
  exam_type: string;
  category: string;
  topic: string;
  content: string;
  correct_answer: string;
  options: unknown;
};

type TaskUpdate = {
  exam_type?: string;
  category?: string;
  topic?: string;
  correct_answer?: string;
  options?: string[];
};

const SLOT_RENAMES: Record<string, TaskUpdate> = {
  "matura_podstawowa/algebra/potegi": {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "potegi",
  },
  "matura_podstawowa/algebra/logarytmy": {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "logarytmy",
  },
  "matura_podstawowa/algebra/wartosc_bezwzgledna": {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "wartosc_bezwzgledna",
  },
  "matura_podstawowa/funkcje/liniowa": {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_liniowa",
  },
  "matura_podstawowa/planimetria/trojkaty": {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "planimetria",
  },
  "matura_podstawowa/planimetria/okregi": {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "okrag_i_kolo",
  },
  "matura_podstawowa/planimetria/czworokaty": {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "planimetria",
  },
  "egzamin_8_klasisty/arytmetyka/ulamki": {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "ulamki",
  },
  "egzamin_8_klasisty/geometria/pola_figur": {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "pola_figur",
  },
};

function parseOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function cleanContent(content: string): string {
  return content.replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

function fraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function fractionKey(numerator: number, denominator: number): string {
  return fraction(numerator, denominator);
}

function rotateOptions(options: string[], id: string): string[] {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const shift = hash % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function uniqueFractionOptions(
  correctNumerator: number,
  correctDenominator: number,
  candidates: [number, number][],
  id: string,
): { correct: string; options: string[] } {
  const correct = fraction(correctNumerator, correctDenominator);
  const seen = new Set([fractionKey(correctNumerator, correctDenominator)]);
  const options = [correct];

  const add = (numerator: number, denominator: number) => {
    if (denominator === 0) return;
    const key = fractionKey(numerator, denominator);
    if (seen.has(key)) return;
    seen.add(key);
    options.push(key);
  };

  for (const [numerator, denominator] of candidates) {
    add(numerator, denominator);
  }

  for (let denominator = 2; options.length < 4 && denominator <= 30; denominator += 1) {
    for (let numerator = 0; options.length < 4 && numerator <= denominator * 2; numerator += 1) {
      add(numerator, denominator);
    }
  }

  if (options.length < 4) {
    throw new Error(`Nie udało się zbudować czterech opcji dla ${id}`);
  }

  return { correct, options: rotateOptions(options, id) };
}

function repairPower(row: TaskRow): { correct: string; options: string[] } | null {
  const content = cleanContent(row.content);
  const match = content.match(
    /(\d+)\s*\^\s*\{?(\d+)\}?\s*\\cdot\s*(\d+)\s*\^\s*\{?(\d+)\}?/,
  );
  if (!match) return null;

  const leftBase = BigInt(match[1]);
  const leftExponent = Number(match[2]);
  const rightBase = BigInt(match[3]);
  const rightExponent = Number(match[4]);
  if (leftBase !== rightBase) return null;

  const exponent = leftExponent + rightExponent;
  const correct = leftBase ** BigInt(exponent);
  const options = [
    correct,
    leftBase ** BigInt(exponent - 1),
    leftBase ** BigInt(exponent + 1),
    leftBase ** BigInt(exponent - 2),
  ].map((value) => value.toString());

  return { correct: correct.toString(), options: rotateOptions(options, row.id) };
}

function repairProbability(
  row: TaskRow,
): { correct: string; options: string[] } | null {
  const content = cleanContent(row.content);
  const dice = content.match(
    /Kostka\s+(\d+)-ścienna:\s*P\(wynik\s*(?:≤|<=)\s*(\d+)\)/iu,
  );
  if (dice) {
    const sides = Number(dice[1]);
    const favorable = Number(dice[2]);
    return uniqueFractionOptions(
      favorable,
      sides,
      [
        [1, sides],
        [2, sides],
        [favorable + 1, sides],
        [favorable, sides + 1],
        [sides - favorable, sides],
      ],
      row.id,
    );
  }

  const balls = content.match(
    /P\(czerwona\)\s+przy\s+(\d+)\s+z\s+(\d+)\s+kulach/iu,
  );
  if (balls) {
    const favorable = Number(balls[1]);
    const total = Number(balls[2]);
    return uniqueFractionOptions(
      favorable,
      total,
      [
        [favorable, total + 1],
        [favorable + 1, total],
        [total - favorable, total],
      ],
      row.id,
    );
  }

  return null;
}

async function loadTasks() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Naprawa produkcji wymaga NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const sb = createClient(url, key);
  const rows: TaskRow[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb
      .from("tasks")
      .select("id,exam_type,category,topic,content,correct_answer,options")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as TaskRow[]));
    if (!data || data.length < pageSize) break;
  }

  return { sb, rows };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const { sb, rows } = await loadTasks();
  const knownSlots = new Set(SEED_TOPIC_SLOTS.map((slot) => slotKey(slot)));
  const updates = new Map<string, TaskUpdate>();
  const invalidIds: string[] = [];
  let duplicateRows = 0;
  let repairedDuplicates = 0;

  for (const row of rows) {
    const options = parseOptions(row.options);
    if (options.length === 0) continue;

    const hasCorrect = options.some((option) =>
      checkAnswerMatch(option, row.correct_answer),
    );
    const duplicate = findEquivalentChoiceGroups(options).length > 0;

    if (!hasCorrect) {
      invalidIds.push(row.id);
      continue;
    }

    if (duplicate) {
      duplicateRows += 1;
      const repaired =
        (row.topic === "potegi" && repairPower(row)) ||
        (row.topic === "prawdopodobienstwo" && repairProbability(row));
      if (!repaired) {
        throw new Error(`Brak bezpiecznej naprawy duplikatów dla ${row.id}`);
      }
      updates.set(row.id, {
        correct_answer: repaired.correct,
        options: repaired.options,
      });
      repairedDuplicates += 1;
    }

    const currentSlot = `${row.exam_type}/${row.category}/${row.topic}`;
    if (!knownSlots.has(`${row.exam_type}:${row.category}:${row.topic}`)) {
      const rename = SLOT_RENAMES[currentSlot];
      if (!rename) {
        throw new Error(`Brak mapowania nieznanego slotu ${currentSlot}`);
      }
      updates.set(row.id, { ...updates.get(row.id), ...rename });
    }
  }

  const unknownRows = rows.filter(
    (row) => !knownSlots.has(`${row.exam_type}:${row.category}:${row.topic}`),
  );
  const unknownWithoutMapping = unknownRows.filter(
    (row) => !SLOT_RENAMES[`${row.exam_type}/${row.category}/${row.topic}`],
  );

  console.log("\n=== Naprawa produkcyjnych zadań treningowych ===\n");
  console.log(`Pobrano: ${rows.length}`);
  console.log(`Duplikaty opcji do naprawy: ${duplicateRows}`);
  console.log(`Naprawy duplikatów: ${repairedDuplicates}`);
  console.log(`Nieprawidłowe odpowiedzi do usunięcia: ${invalidIds.length}`);
  console.log(`Nieznane sloty do ujednolicenia: ${unknownRows.length}`);

  if (unknownWithoutMapping.length > 0) {
    throw new Error(
      `Nieznane sloty bez mapowania: ${unknownWithoutMapping
        .map((row) => `${row.exam_type}/${row.category}/${row.topic}`)
        .join(", ")}`,
    );
  }

  if (!apply) {
    console.log("\n[DRY RUN] Nic nie zapisano. Użyj --apply, aby wykonać naprawę.\n");
    return;
  }

  let updated = 0;
  for (const [id, update] of updates) {
    const { error } = await sb.from("tasks").update(update).eq("id", id);
    if (error) throw new Error(`Update ${id}: ${error.message}`);
    updated += 1;
  }

  let deleted = 0;
  for (const id of invalidIds) {
    const { error } = await sb.from("tasks").delete().eq("id", id);
    if (error) throw new Error(`Delete ${id}: ${error.message}`);
    deleted += 1;
  }

  console.log(`\nZaktualizowano: ${updated}`);
  console.log(`Usunięto nieprawidłowych: ${deleted}`);
  console.log("Naprawa zakończona.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
