/**
 * Generuje lekki indeks teorii (55 wpisów) do bundla klienta.
 *
 *   npm run seed:theory-index
 *   → lib/trening/seed/theory-index.ts
 */

import fs from "fs";
import path from "path";
import { SEED_MATERIALS } from "../lib/trening/seed/materials";
import { classifyTheoryContent } from "../lib/trening/theory-content";

const OUT = path.resolve(process.cwd(), "lib/trening/seed/theory-index.ts");

function main() {
  const entries = SEED_MATERIALS.map((m) => ({
    exam_type: m.exam_type,
    category: m.category,
    topic: m.topic,
    tier: classifyTheoryContent(m.content),
  }));

  const lines = [
    "/** AUTO-GENERATED — npm run seed:theory-index. Nie edytuj ręcznie. */",
    'import type { ExamType } from "@/types/database";',
    'import type { TheoryTier } from "@/lib/trening/theory-content";',
    "",
    "export type TheoryIndexEntry = {",
    "  exam_type: ExamType;",
    "  category: string;",
    "  topic: string;",
    "  tier: TheoryTier;",
    "};",
    "",
    `export const THEORY_INDEX: TheoryIndexEntry[] = ${JSON.stringify(entries, null, 2)} as const;`,
    "",
    "export function seedTheoryTierForTopic(",
    "  examType: ExamType,",
    "  category: string,",
    "  topic: string,",
    "): TheoryTier {",
    "  const hit = THEORY_INDEX.find(",
    "    (e) =>",
    "      e.exam_type === examType &&",
    "      e.category === category &&",
    "      e.topic === topic,",
    "  );",
    "  return hit?.tier ?? \"none\";",
    "}",
    "",
    "export function seedTheorySummariesForExam(examType: ExamType) {",
    "  return THEORY_INDEX.filter((e) => e.exam_type === examType).map(",
    "    ({ category, topic, tier }) => ({ category, topic, tier }),",
    "  );",
    "}",
    "",
    "export type TheorySummary = {",
    "  category: string;",
    "  topic: string;",
    "  tier: TheoryTier;",
    "};",
    "",
    "export function mergeTheorySummaries(",
    "  examType: ExamType,",
    "  fromDb: TheorySummary[],",
    "): TheorySummary[] {",
    "  const byKey = new Map<string, TheoryTier>();",
    "  for (const entry of seedTheorySummariesForExam(examType)) {",
    "    byKey.set(`${entry.category}:${entry.topic}`, entry.tier);",
    "  }",
    "  for (const row of fromDb) {",
    "    byKey.set(`${row.category}:${row.topic}`, row.tier);",
    "  }",
    "  return [...byKey.entries()].map(([key, tier]) => {",
    "    const [category, topic] = key.split(\":\");",
    "    return { category: category!, topic: topic!, tier };",
    "  });",
    "}",
    "",
  ];

  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`\n✓ Zapisano ${entries.length} wpisów → ${OUT}\n`);
}

main();
