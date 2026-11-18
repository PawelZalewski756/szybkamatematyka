/**
 * Uzupełnia data/theory-cache brakującymi lekcjami z SEED_MATERIALS.
 *
 *   npx tsx scripts/exportTheoryCacheFromSeed.ts
 */
import fs from "node:fs";
import path from "node:path";
import { SEED_MATERIALS } from "@/lib/trening/seed/materials";

const OUT = path.resolve(process.cwd(), "data/theory-cache");
fs.mkdirSync(OUT, { recursive: true });

let added = 0;
for (const material of SEED_MATERIALS) {
  const file = path.join(
    OUT,
    `${material.exam_type}__${material.category}__${material.topic}.json`,
  );
  if (fs.existsSync(file)) continue;
  fs.writeFileSync(
    file,
    `${JSON.stringify(
      {
        exam_type: material.exam_type,
        category: material.category,
        topic: material.topic,
        title: material.title,
        content: material.content,
        generatedAt: new Date().toISOString(),
        model: "seed-v1",
        source: "seed",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  added += 1;
}

console.log(`Dodano ${added} plików teorii (łącznie ${SEED_MATERIALS.length} lekcji).`);
