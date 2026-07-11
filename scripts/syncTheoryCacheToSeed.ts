/**
 * Kopiuje lekcje z data/theory-cache do lib/trening/seed/materials.ts
 * (nadpisuje title + content w BASE_SEED_MATERIALS; zachowuje enrich + expanded).
 *
 *   npm run seed:theory-sync
 */

import fs from "fs";
import path from "path";
import {
  BASE_SEED_MATERIALS,
  materialKey,
  type MaterialDraft,
} from "../lib/trening/seed/materials";
import type { ExamType } from "../types/database";

const CACHE_DIR = path.resolve(process.cwd(), "data/theory-cache");
const SEED_PATH = path.resolve(process.cwd(), "lib/trening/seed/materials.ts");

type CachedTheory = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
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
  if (!fs.existsSync(CACHE_DIR)) {
    console.error("Brak katalogu cache:", CACHE_DIR);
    process.exit(1);
  }

  const cacheByKey = new Map<string, CachedTheory>();
  for (const file of fs
    .readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith(".json"))) {
    const entry = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file), "utf8"),
    ) as CachedTheory;
    cacheByKey.set(materialKey(entry), entry);
  }

  let merged = 0;
  const mergedBase = BASE_SEED_MATERIALS.map((m) => {
    const cached = cacheByKey.get(materialKey(m));
    if (!cached) return m;
    merged += 1;
    return {
      ...m,
      title: cached.title,
      content: cached.content,
    };
  });

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
${mergedBase.map(formatMaterialBlock).join(",\n")},
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
  console.log(`\n✓ Zaktualizowano ${merged} lekcji w ${SEED_PATH}`);
  console.log(
    `  Cache: ${cacheByKey.size} plików, seed: ${mergedBase.length} tematów\n`,
  );
}

main();
