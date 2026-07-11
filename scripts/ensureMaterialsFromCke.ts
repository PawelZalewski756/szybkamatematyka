/**
 * Uzupełnia lib/trening/seed/materials.ts o brakujące tematy z drzewa CKE.
 *
 *   npm run seed:theory-ensure-materials
 */

import fs from "fs";
import path from "path";
import { listCkeTopicsForExam } from "../lib/trening/cke-curriculum";
import { CKE_EGZAMIN_8 } from "../lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "../lib/trening/cke-matura-podstawowa";
import {
  BASE_SEED_MATERIALS,
  materialKey,
  type MaterialDraft,
} from "../lib/trening/seed/materials";
import { buildMaterialStub } from "../lib/trening/seed/material-stub";
import {
  readTheoryCache,
  theoryCachePath,
} from "../lib/trening/seed/theory-cache-utils";
import type { ExamType } from "../types/database";

const SEED_PATH = path.resolve(process.cwd(), "lib/trening/seed/materials.ts");
const CACHE_DIR = path.resolve(process.cwd(), "data/theory-cache");

const EXAM_LABEL: Record<ExamType, string> = {
  matura_podstawowa: CKE_MATURA_PODSTAWOWA.label,
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": CKE_EGZAMIN_8.label,
};

function escapeTemplateLiteral(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function formatMaterialBlock(m: MaterialDraft): string {
  const content = escapeTemplateLiteral(m.content);
  return `  {
    exam_type: "${m.exam_type}",
    category: "${m.category}",
    topic: "${m.topic}",
    title: ${JSON.stringify(m.title)},
    content: \`${content}\`,
    video_url: null,
  }`;
}

function main() {
  const byKey = new Map<string, MaterialDraft>();
  for (const m of BASE_SEED_MATERIALS) {
    const cached = readTheoryCache(m);
    if (cached?.content) {
      byKey.set(materialKey(m), {
        ...m,
        title: cached.title,
        content: cached.content,
      });
    } else {
      byKey.set(materialKey(m), m);
    }
  }

  let added = 0;
  let fromCache = 0;

  const exams: ExamType[] = ["matura_podstawowa", "8_klasa"];
  for (const exam_type of exams) {
    for (const topic of listCkeTopicsForExam(exam_type)) {
      const key = `${exam_type}:${topic.category}:${topic.topic}`;
      if (byKey.has(key)) continue;

      const cached = readTheoryCache({
        exam_type,
        category: topic.category,
        topic: topic.topic,
      });

      if (cached) {
        byKey.set(key, {
          exam_type,
          category: topic.category,
          topic: topic.topic,
          title: cached.title,
          content: cached.content,
          video_url: null,
        });
        fromCache += 1;
        added += 1;
        continue;
      }

      const stub = buildMaterialStub({
        examLabel: EXAM_LABEL[exam_type],
        categoryName: topic.categoryName,
        topicName: topic.topicName,
      });

      byKey.set(key, {
        exam_type,
        category: topic.category,
        topic: topic.topic,
        title: stub.title,
        content: stub.content,
        video_url: null,
      });
      added += 1;
    }
  }

  const ordered: MaterialDraft[] = [];
  for (const exam_type of exams) {
    for (const topic of listCkeTopicsForExam(exam_type)) {
      const row = byKey.get(`${exam_type}:${topic.category}:${topic.topic}`);
      if (row) ordered.push(row);
    }
  }

  const fileBody = `import type { ExamType } from "@/types/database";
import { enrichTheoryLesson } from "@/lib/trening/seed/enrich-theory";
import { EXPANDED_THEORY } from "@/lib/trening/seed/theory-expanded";

export type MaterialDraft = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

export const BASE_SEED_MATERIALS: MaterialDraft[] = [
${ordered.map(formatMaterialBlock).join(",\n")},
];

export function materialKey(
  m: Pick<MaterialDraft, "exam_type" | "category" | "topic">,
): string {
  return \`\${m.exam_type}:\${m.category}:\${m.topic}\`;
}

function applyTheoryEnhancements(m: MaterialDraft): MaterialDraft {
  const key = materialKey(m);
  const expanded = EXPANDED_THEORY[key];
  const base = expanded
    ? { ...m, title: expanded.title, content: expanded.content }
    : m;
  return { ...base, content: enrichTheoryLesson(base.content) };
}

export const SEED_MATERIALS: MaterialDraft[] =
  BASE_SEED_MATERIALS.map(applyTheoryEnhancements);
`;

  fs.writeFileSync(SEED_PATH, fileBody, "utf8");

  console.log(`\n✓ materials.ts: ${ordered.length} tematów (${added} nowych)`);
  console.log(`  Z cache: ${fromCache}, stubów: ${added - fromCache}`);
  console.log(`  Cache dir: ${CACHE_DIR}`);
  console.log(`  Przykład pliku: ${theoryCachePath({ exam_type: "8_klasa", category: "liczby", topic: "ulamki" })}\n`);
}

main();
