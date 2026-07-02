/**
 * Raport pokrycia teorii vs drzewo CKE.
 *   npm run audit:theory
 */
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { listCkeTopicsForExam } from "../lib/trening/cke-curriculum";
import {
  classifyTheoryContent,
  RICH_THEORY_MIN_LENGTH,
} from "../lib/trening/theory-content";
import type { ExamType } from "../types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const EXAMS: ExamType[] = ["matura_podstawowa", "8_klasa"];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    console.error("Brak NEXT_PUBLIC_SUPABASE_URL / klucza Supabase w .env.local");
    process.exit(1);
  }

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("materials")
    .select("exam_type, category, topic, content, title");

  if (error) {
    console.error("Supabase:", error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  const byKey = new Map<string, { title: string; tier: ReturnType<typeof classifyTheoryContent> }>();

  for (const row of rows) {
    const key = `${row.exam_type}:${row.category}:${row.topic}`;
    byKey.set(key, {
      title: String(row.title ?? ""),
      tier: classifyTheoryContent(String(row.content ?? "")),
    });
  }

  console.log("\n=== Audyt teorii (materials vs CKE) ===\n");
  console.log(`Próg pełnej lekcji: ${RICH_THEORY_MIN_LENGTH} znaków lub sekcja „Na egzaminie”\n`);

  let totalTopics = 0;
  let missing = 0;
  let basic = 0;
  let full = 0;

  for (const examType of EXAMS) {
    const topics = listCkeTopicsForExam(examType);
    console.log(`--- ${examType} (${topics.length} tematów) ---`);

    for (const topic of topics) {
      totalTopics += 1;
      const key = `${examType}:${topic.category}:${topic.topic}`;
      const row = byKey.get(key);

      if (!row) {
        missing += 1;
        console.log(`  ✗ ${topic.category}/${topic.topic} — brak materiału (${topic.topicName})`);
        continue;
      }

      if (row.tier === "full") {
        full += 1;
        console.log(`  ✓ ${topic.category}/${topic.topic} — pełna lekcja (${row.title})`);
      } else {
        basic += 1;
        console.log(`  ~ ${topic.category}/${topic.topic} — skrót (${row.title})`);
      }
    }

    console.log("");
  }

  const orphanRows = rows.filter((row) => {
    if (!EXAMS.includes(row.exam_type as ExamType)) return true;
    const topics = listCkeTopicsForExam(row.exam_type as ExamType);
    return !topics.some(
      (topic) => topic.category === row.category && topic.topic === row.topic,
    );
  });

  if (orphanRows.length > 0) {
    console.log("--- Osierocone wpisy (slug nie pasuje do CKE) ---");
    for (const row of orphanRows) {
      console.log(
        `  ? ${row.exam_type}/${row.category}/${row.topic} — ${row.title}`,
      );
    }
    console.log("");
  }

  console.log("Podsumowanie:");
  console.log(`  Tematy CKE:     ${totalTopics}`);
  console.log(`  Pełne lekcje:   ${full}`);
  console.log(`  Skróty:         ${basic}`);
  console.log(`  Brak teorii:    ${missing}`);
  console.log(`  Osierocone:     ${orphanRows.length}`);
  console.log("");
}

void main();
