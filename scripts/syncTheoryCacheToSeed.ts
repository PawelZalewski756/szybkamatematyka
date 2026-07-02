/**
 * Kopiuje lekcje z data/theory-cache do lib/trening/seed/materials.ts
 * (nadpisuje title + content dla pasujących kluczy).
 *
 *   npx tsx scripts/syncTheoryCacheToSeed.ts
 */

import fs from "fs";
import path from "path";
import { materialKey, SEED_MATERIALS } from "../lib/trening/seed/materials";
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
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function main() {
  if (!fs.existsSync(CACHE_DIR)) {
    console.error("Brak katalogu cache:", CACHE_DIR);
    process.exit(1);
  }

  const cacheByKey = new Map<string, CachedTheory>();
  for (const file of fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"))) {
    const entry = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file), "utf8"),
    ) as CachedTheory;
    cacheByKey.set(materialKey(entry), entry);
  }

  let merged = 0;
  const mergedMaterials = SEED_MATERIALS.map((m) => {
    const cached = cacheByKey.get(materialKey(m));
    if (!cached) return m;
    merged += 1;
    return {
      ...m,
      title: cached.title,
      content: cached.content,
    };
  });

  const blocks = mergedMaterials.map((m) => {
    const content = escapeTemplateLiteral(m.content);
    return `  {
    exam_type: "${m.exam_type}",
    category: "${m.category}",
    topic: "${m.topic}",
    title: ${JSON.stringify(m.title)},
    content: \`${content}\`,
    video_url: null,
  }`;
  });

  const fileBody = `import type { ExamType } from "@/types/database";

export type MaterialDraft = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

export const SEED_MATERIALS: MaterialDraft[] = [
${blocks.join(",\n")},
];

export function materialKey(m: MaterialDraft): string {
  return \`\${m.exam_type}:\${m.category}:\${m.topic}\`;
}
`;

  fs.writeFileSync(SEED_PATH, fileBody, "utf8");
  console.log(`\n✓ Zaktualizowano ${merged} lekcji w ${SEED_PATH}`);
  console.log(`  Cache: ${cacheByKey.size} plików, seed: ${mergedMaterials.length} tematów\n`);
}

main();
