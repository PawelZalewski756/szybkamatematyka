/**
 * Nocny generator teorii — Gemini w pętli aż 100% tematów CKE.
 * Przy limicie API czeka responsywnie (czas z komunikatu Gemini) i wznawia.
 *
 * Log: data/theory-cache/overnight.log
 *
 *   npm run seed:theory-overnight
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import {
  countTheoryCacheProgress,
  countTheoryCacheProgressByExam,
  isExamTheoryComplete,
  listIncompleteTheorySlots,
  listIncompleteTheorySlotsForExam,
} from "../lib/trening/seed/theory-cache-utils";

const LOG = path.resolve(process.cwd(), "data/theory-cache/overnight.log");
const STALL_WAIT_MS = 30_000;

function log(line: string): void {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, row, "utf8");
  console.log(line);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCommand(command: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    log(`▶ ${command} ${args.join(" ")}`);
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      shell: true,
    });

    const pipe = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      process.stdout.write(text);
      fs.appendFileSync(LOG, text, "utf8");
    };

    child.stdout?.on("data", pipe);
    child.stderr?.on("data", pipe);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function runNpm(script: string, extraArgs: string[] = []): Promise<number> {
  return runCommand("npm", [
    "run",
    script,
    ...(extraArgs.length ? ["--", ...extraArgs] : []),
  ]);
}

function logExamPhase(): void {
  const matura = countTheoryCacheProgressByExam("matura_podstawowa");
  const eight = countTheoryCacheProgressByExam("8_klasa");
  log(`Matura: ${matura.complete}/${matura.total}, 8 klasa: ${eight.complete}/${eight.total}`);

  if (!isExamTheoryComplete("matura_podstawowa")) {
    const missing = listIncompleteTheorySlotsForExam("matura_podstawowa");
    log(
      `  → faza matura — brakuje ${missing.length}: ${missing
        .map((s) => `${s.category}:${s.topic}`)
        .join(", ")}`,
    );
    return;
  }

  log("  ✅ Matura kompletna (28/28) — lecę z egzaminem 8-klasisty");
  const missingEight = listIncompleteTheorySlotsForExam("8_klasa");
  if (missingEight.length > 0) {
    log(
      `  → brakuje ${missingEight.length} tematów 8 klasy: ${missingEight
        .map((s) => `${s.category}:${s.topic}`)
        .join(", ")}`,
    );
  }
}

async function main() {
  log("=== Start nocnego generatora teorii ===");

  const ensureCode = await runNpm("seed:theory-ensure-materials");
  if (ensureCode !== 0) {
    log(`⚠ ensure-materials kod ${ensureCode} — kontynuuję`);
  }

  let round = 0;

  while (true) {
    round += 1;
    const before = countTheoryCacheProgress();
    log(
      `--- Runda ${round}: ${before.complete}/${before.total} pełnych lekcji w cache ---`,
    );
    logExamPhase();

    if (before.missing === 0) {
      log("✅ Wszystkie tematy mają pełne lekcje Phase 3a w cache");
      break;
    }

    const incomplete = listIncompleteTheorySlots();
    log(
      `Brakuje ${incomplete.length} tematów, np. ${incomplete
        .slice(0, 3)
        .map((s) => `${s.exam_type}:${s.category}:${s.topic}`)
        .join(", ")}`,
    );

    const geminiCode = await runNpm("seed:theory-gemini", [
      "--cache-only",
      "--no-db",
      "--delay=2000",
    ]);

    const after = countTheoryCacheProgress();
    log(
      `Po rundzie: ${after.complete}/${after.total} (+${after.complete - before.complete}), kod=${geminiCode}`,
    );

    if (after.missing === 0) {
      log("✅ 100% tematów ukończonych");
      break;
    }

    if (after.complete === before.complete) {
      log(
        `⏸ Brak postępu w rundzie (kod ${geminiCode}) — ponawiam za ${STALL_WAIT_MS / 1000} s…`,
      );
      await sleep(STALL_WAIT_MS);
      continue;
    }

    await sleep(5000);
  }

  log("▶ Sync cache → seed");
  await runNpm("seed:theory-sync");

  log("▶ Eksport SQL");
  await runNpm("seed:theory-sql");

  const final = countTheoryCacheProgress();
  log(
    `=== Koniec — ${final.complete}/${final.total} tematów, plik: supabase/theory-lessons-update.sql ===`,
  );
}

main().catch((err) => {
  log(`✗ Błąd krytyczny: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
