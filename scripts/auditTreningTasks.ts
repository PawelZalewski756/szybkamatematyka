/**
 * Audyt jakości zadań areny treningowej w Supabase (tabela tasks).
 *   npx tsx scripts/auditTreningTasks.ts
 */
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  checkAnswerMatch,
  findEquivalentChoiceGroups,
} from "../lib/math/answer-equiv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type TaskRow = {
  id: string;
  exam_type: string;
  category: string;
  topic: string;
  content: string;
  correct_answer: string;
  options: string | string[] | null;
};

function parseOptions(raw: string | string[] | null): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Brak Supabase w .env.local");
  }

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("tasks")
    .select("id,exam_type,category,topic,content,correct_answer,options")
    .limit(10000);

  if (error) throw error;

  const rows = (data ?? []) as TaskRow[];
  const issues: { id: string; detail: string }[] = [];

  for (const row of rows) {
    const options = parseOptions(row.options);
    if (options.length === 0) continue;

    const groups = findEquivalentChoiceGroups(options);
    if (groups.length > 0) {
      issues.push({
        id: row.id,
        detail: `Duplikaty równoważne: ${groups.map((g) => g.map((i) => options[i]).join("=")).join("; ")}`,
      });
    }

    const hasCorrect = options.some((o) =>
      checkAnswerMatch(o, row.correct_answer),
    );
    if (!hasCorrect) {
      issues.push({
        id: row.id,
        detail: `correct_answer „${row.correct_answer}" nie pasuje do żadnej opcji: [${options.join(", ")}]`,
      });
    }

    const matching = options.filter((o) =>
      checkAnswerMatch(o, row.correct_answer),
    );
    if (matching.length > 1) {
      issues.push({
        id: row.id,
        detail: `Wiele poprawnych opcji: ${matching.join(" | ")}`,
      });
    }
  }

  console.log("\n=== Audyt zadań treningowych (Supabase tasks) ===\n");
  console.log(`Pobrano: ${rows.length} wierszy`);
  console.log(`Z opcjami MC: ${rows.filter((r) => parseOptions(r.options).length > 0).length}`);
  console.log(`Problemów: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log("✓ Brak wykrytych problemów.");
    return;
  }

  for (const issue of issues.slice(0, 40)) {
    console.log(`✗ [${issue.id}] ${issue.detail}`);
  }
  if (issues.length > 40) {
    console.log(`… i ${issues.length - 40} więcej`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
