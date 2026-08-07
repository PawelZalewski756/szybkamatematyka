/**
 * Czyści chaotyczne rozwiązania CKE w data/cke-matura-cache
 * (długie „coś jest nie tak / zakładając błąd…”), zostawiając pierwsze
 * sensowne kroki + pierwszą Odpowiedź.
 *
 *   npx tsx scripts/cleanupBrokenCkeSolutions.ts
 *   npx tsx scripts/cleanupBrokenCkeSolutions.ts --dry-run
 */

import fs from "fs";
import path from "path";

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-matura-cache");

const CONFUSION =
  /po ponownym sprawdzeniu|coś jest nie tak|Jest problem|źle przepisano|literówka|Przy założeniu|Uwaga: Zakładając|Przeanalizujmy ponownie|domniemamy|nie można podać odpowiedzi bez pewności/i;

function cleanupSolution(rozwiazanie: string): string | null {
  if (!CONFUSION.test(rozwiazanie)) return null;

  const cut = rozwiazanie.search(CONFUSION);
  const before = cut > 0 ? rozwiazanie.slice(0, cut).trim() : "";

  const answerMatch = przedOdpowiedź(before) ?? przedOdpowiedź(rozwiazanie);
  const steps = extractFirstSteps(before.length > 40 ? before : rozwiazanie, 4);

  if (!answerMatch && steps.length === 0) return null;

  const parts = [...steps];
  if (answerMatch) {
    parts.push(`**Odpowiedź:** ${answerMatch}`);
  } else {
    // ostatnia linia z Odpowiedź z całego tekstu
    const all = [...rozwiazanie.matchAll(/\*\*Odpowiedź:\*\*\s*([^\n*]+)/g)];
    const last = all[all.length - 1]?.[1]?.trim();
    if (last) parts.push(`**Odpowiedź:** ${last}`);
  }

  const next = parts.join("\n").trim();
  if (next.length < 40 || next === rozwiazanie.trim()) return null;
  // nie pogarszaj, jeśli wyszło krócej niż ~1/4 i bez odpowiedzi
  if (next.length < Math.min(120, rozwiazanie.length * 0.15) && !/\*\*Odpowiedź:\*\*/.test(next)) {
    return null;
  }
  return next;
}

function przedOdpowiedź(text: string): string | null {
  const m = text.match(/\*\*Odpowiedź:\*\*\s*([^\n*]+)/);
  return m?.[1]?.trim() ?? null;
}

function extractFirstSteps(text: string, max: number): string[] {
  const blocks = text.split(/\n(?=\*\*Krok|\*\*Zadanie)/).map((s) => s.trim()).filter(Boolean);
  const steps = blocks.filter((b) => /^\*\*(Krok|Zadanie)/i.test(b)).slice(0, max);
  if (steps.length > 0) return steps;
  // fallback: pierwsze akapity
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter((s) => s && !/\*\*Odpowiedź:\*\*/i.test(s))
    .slice(0, 3);
}

function main(): void {
  const dryRun = process.argv.includes("--dry-run");
  let filesTouched = 0;
  let tasksFixed = 0;

  for (const file of fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const full = path.join(CACHE_DIR, file);
    const sheet = JSON.parse(fs.readFileSync(full, "utf8")) as {
      sessionId: string;
      tasks: { numer: number; rozwiazanie: string }[];
      fetchedAt?: string;
    };
    let changed = false;

    for (const task of sheet.tasks) {
      const next = cleanupSolution(task.rozwiazanie || "");
      if (!next) continue;
      console.log(
        `  ↻ ${sheet.sessionId} z${task.numer}: ${task.rozwiazanie.length} → ${next.length} znaków`,
      );
      task.rozwiazanie = next;
      changed = true;
      tasksFixed += 1;
    }

    if (changed) {
      filesTouched += 1;
      if (!dryRun) {
        sheet.fetchedAt = new Date().toISOString();
        fs.writeFileSync(full, JSON.stringify(sheet, null, 2) + "\n", "utf8");
      }
    }
  }

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}Poprawiono ${tasksFixed} rozwiązań w ${filesTouched} plikach.\n`,
  );
}

main();
