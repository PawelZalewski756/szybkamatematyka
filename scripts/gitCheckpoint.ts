import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const STAGE_PATHS = [
  "data/theory-cache",
  "data/cke-matura-cache",
  "lib/gemini",
  "lib/trening/seed",
  "scripts",
  "tests/gemini-retry.test.ts",
  "supabase/theory-lessons-update.sql",
  "package.json",
  "components/baza-zadan/CmsTaskCard.tsx",
];

const UNSTAGE_LOGS = [
  "data/theory-cache/overnight.log",
  "data/overnight-gemini.log",
  "data/cke-matura-cache/overnight.log",
];

function runGit(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn("git", args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function globTheoryGeminiLogs(): string[] {
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) return [];
  return fs
    .readdirSync(dataDir)
    .filter((f) => f.startsWith("theory-gemini") && f.endsWith(".log"))
    .map((f) => path.join("data", f));
}

/** Zapisuje postęp generatorów — commit + push (pomija pliki *.log). */
export async function gitCheckpoint(
  message: string,
  log?: (line: string) => void,
): Promise<void> {
  const say = (line: string) => (log ? log(line) : console.log(line));
  say(`📦 Git checkpoint: ${message}`);

  for (const p of STAGE_PATHS) {
    if (fs.existsSync(path.resolve(process.cwd(), p))) {
      await runGit(["add", "--", p]);
    }
  }

  for (const p of [...UNSTAGE_LOGS, ...globTheoryGeminiLogs()]) {
    await runGit(["reset", "--", p]);
  }

  const hasChanges = await new Promise<boolean>((resolve) => {
    const child = spawn("git", ["diff", "--cached", "--quiet"], {
      cwd: process.cwd(),
      stdio: "ignore",
      shell: true,
    });
    child.on("close", (code) => resolve(code === 1));
  });

  if (!hasChanges) {
    say("  (brak zmian do commita)");
    return;
  }

  const msgFile = path.join(
    os.tmpdir(),
    `szybka-matma-commit-${process.pid}.txt`,
  );
  fs.writeFileSync(msgFile, message, "utf8");
  const commitCode = await runGit(["commit", "-F", msgFile]);
  try {
    fs.unlinkSync(msgFile);
  } catch {
    /* ignore */
  }
  if (commitCode !== 0) {
    say(`  ⚠ commit kod ${commitCode}`);
    return;
  }

  const pushCode = await runGit(["push"]);
  if (pushCode !== 0) {
    say(`  ⚠ push kod ${pushCode}`);
  } else {
    say("  ✓ push OK");
  }
}
