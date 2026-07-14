/**
 * Dzieli tasks-gemini-insert.sql na mniejsze pliki (Supabase SQL Editor limit).
 *
 *   npm run seed:tasks-sql-split
 *   → supabase/tasks-gemini-insert/001.sql, 002.sql, ...
 */

import fs from "fs";
import path from "path";

const SRC = path.resolve(process.cwd(), "supabase/tasks-gemini-insert.sql");
const OUT_DIR = path.resolve(process.cwd(), "supabase/tasks-gemini-insert");
const CHUNK_SIZE = 40;

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Brak pliku: ${SRC}\nNajpierw: npm run seed:tasks-sql`);
    process.exit(1);
  }

  const raw = fs.readFileSync(SRC, "utf8");
  const blocks = raw
    .split(/(?=INSERT INTO public\.tasks)/)
    .map((b) => b.trim())
    .filter((b) => b.startsWith("INSERT INTO"));

  if (blocks.length === 0) {
    console.error("Nie znaleziono INSERTów w pliku.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const header =
    "-- Fragment importu zadań Gemini. Uruchom pliki po kolei (001, 002, …) w Supabase SQL Editor.\n\n";

  let fileIndex = 0;
  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
    fileIndex += 1;
    const chunk = blocks.slice(i, i + CHUNK_SIZE);
    const name = `${String(fileIndex).padStart(3, "0")}.sql`;
    const body = header + chunk.join("\n\n") + "\n";
    fs.writeFileSync(path.join(OUT_DIR, name), body, "utf8");
  }

  console.log(`\n✓ Podzielono ${blocks.length} INSERTów → ${fileIndex} plików`);
  console.log(`  Katalog: ${OUT_DIR}`);
  console.log(`  Po ${CHUNK_SIZE} zadań na plik — uruchamiaj 001.sql, 002.sql, … po kolei.\n`);
}

main();
