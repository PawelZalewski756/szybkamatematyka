/**
 * Nocny generator zadań Gemini - pętla aż każdy temat ma --per-topic zadań.
 *
 *   npm run seed:tasks-overnight
 *   npm run seed:tasks-overnight -- --per-topic=40
 *
 * Log: data/tasks-cache/overnight.log
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { countTaskCacheProgress } from "../lib/trening/seed/tasks-cache-utils";

const LOG = path.resolve(process.cwd(), "data/tasks-cache/overnight.log");
const STALL_WAIT_MS = 60_000;

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

function runNpm(script: string, extraArgs: string[] = []): Promise<number> {
  return new Promise((resolve) => {
    log(`▶ npm run ${script} ${extraArgs.join(" ")}`.trim());
    const child = spawn("npm", ["run", script, ...(extraArgs.length ? ["--", ...extraArgs] : [])], {
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

async function main() {
  const extra = process.argv.slice(2);
  const perTopicArg = extra.find((a) => a.startsWith("--per-topic="));
  const perTopic = perTopicArg ? Number(perTopicArg.split("=")[1]) : 30;

  log(`Start overnight tasks (cel ${perTopic}/temat)`);

  for (let round = 1; round <= 500; round++) {
    const before = countTaskCacheProgress();
    log(
      `Runda ${round}: ${before.totalTasks} zadań, ${before.slotsWithTasks}/${before.totalSlots} tematów`,
    );

    const code = await runNpm("seed:tasks-gemini", [
      `--per-topic=${perTopic}`,
      "--batch-size=5",
      "--delay=400",
      ...extra.filter((a) => !a.startsWith("--per-topic=")),
    ]);

    const after = countTaskCacheProgress();
    log(
      `Po rundzie: ${after.totalTasks} zadań (+${after.totalTasks - before.totalTasks})`,
    );

    const maturaDone =
      after.byExam.matura_podstawowa.filled === after.byExam.matura_podstawowa.slots &&
      after.byExam.matura_podstawowa.tasks >=
        after.byExam.matura_podstawowa.slots * perTopic;
    const eightDone =
      after.byExam["8_klasa"].filled === after.byExam["8_klasa"].slots &&
      after.byExam["8_klasa"].tasks >= after.byExam["8_klasa"].slots * perTopic;

    if (maturaDone && eightDone) {
      log("✓ Wszystkie tematy osiągnęły cel.");
      break;
    }

    if (code !== 0 && after.totalTasks === before.totalTasks) {
      log(`Generator zatrzymany (exit ${code}) - czekam ${STALL_WAIT_MS / 1000}s…`);
      await sleep(STALL_WAIT_MS);
    }
  }

  await runNpm("seed:tasks-sql", []);
  log("Koniec - SQL wyeksportowany.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
