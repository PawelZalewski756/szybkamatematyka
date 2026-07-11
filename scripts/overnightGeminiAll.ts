/**
 * Nocna sesja Gemini — teoria, walidacja, rozwiązania CKE, audyty.
 *
 *   npm run seed:overnight-all
 *
 * Log: data/overnight-gemini.log
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import {
  countTheoryCacheProgress,
  countTheoryCacheProgressByExam,
} from "../lib/trening/seed/theory-cache-utils";
import { gitCheckpoint } from "./gitCheckpoint";

const LOG = path.resolve(process.cwd(), "data/overnight-gemini.log");

function log(line: string): void {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, row, "utf8");
  console.log(line);
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

async function runPhase(name: string, fn: () => Promise<number>): Promise<void> {
  log(`\n═══ ${name} ═══`);
  const code = await fn();
  if (code !== 0) {
    log(`⚠ ${name} — kod wyjścia ${code} (kontynuuję)`);
  } else {
    log(`✓ ${name} — OK`);
  }
}

function logTheorySnapshot(label: string): void {
  const total = countTheoryCacheProgress();
  const matura = countTheoryCacheProgressByExam("matura_podstawowa");
  const eight = countTheoryCacheProgressByExam("8_klasa");
  log(
    `${label}: teoria ${total.complete}/${total.total} | matura ${matura.complete}/${matura.total} | 8 klasa ${eight.complete}/${eight.total}`,
  );
}

async function main() {
  log("🌙 Start nocnej sesji Gemini (teoria → testy → DB → CKE → audyty)");

  logTheorySnapshot("Stan początkowy");

  await runPhase("1/7 Teoria CKE (55 tematów)", () =>
    runNpm("seed:theory-overnight"),
  );

  logTheorySnapshot("Po teorii");
  await gitCheckpoint(
    `Faza 3a: teoria Gemini ${countTheoryCacheProgress().complete}/55 (matura ${countTheoryCacheProgressByExam("matura_podstawowa").complete}/28).`,
    log,
  );

  await runPhase("2/7 Testy formatowania teorii", () =>
    runCommand("npm", [
      "test",
      "--",
      "tests/format-theory.test.ts",
      "tests/theory-content.test.ts",
      "tests/theory-sections.test.ts",
      "tests/gemini-retry.test.ts",
      "tests/seed-materials.test.ts",
    ]),
  );

  await runPhase("3/7 Wgranie teorii do Supabase", () =>
    runNpm("seed:theory-cache"),
  );

  await runPhase("4/7 Audit pokrycia teorii", () => runNpm("audit:theory"));

  await gitCheckpoint(
    `Faza 3a: teoria w Supabase + SQL (${countTheoryCacheProgress().complete}/55).`,
    log,
  );

  await runPhase("5/7 CKE m25-maj (8 brakujących)", () =>
    runNpm("seed:cke-matura", [
      "--fill-solutions",
      "--only=m25-maj",
      "--delay=2000",
    ]),
  );

  await runPhase("6/7 CKE wszystkie rozwiązania", () =>
    runNpm("seed:cke-matura", ["--fill-solutions", "--delay=2500"]),
  );

  await gitCheckpoint("Faza 3a/3c: postęp CKE Gemini (rozwiązania maturalne).", log);

  await runPhase("7/7 Audyty jakości", async () => {
    await runNpm("audit:cke");
    await runNpm("audit:trening");
    return runNpm("audit:questions");
  });

  logTheorySnapshot("Stan końcowy");
  await gitCheckpoint("Nocna sesja Gemini: podsumowanie audytów.", log);
  log("✅ Nocna sesja zakończona — szczegóły w data/overnight-gemini.log");
  log("   Teoria SQL: supabase/theory-lessons-update.sql");
  log("   Teoria log: data/theory-cache/overnight.log");
  log("   CKE log:    data/cke-matura-cache/overnight.log");
}

main().catch((err) => {
  log(`✗ Błąd krytyczny: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
