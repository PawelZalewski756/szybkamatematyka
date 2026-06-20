/**
 * Nocny import: sync arkuszy + rozwiązania Gemini (wznawialne).
 * Log: data/cke-matura-cache/overnight.log
 *
 *   npm run seed:cke-overnight
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const LOG = path.resolve(process.cwd(), "data/cke-matura-cache/overnight.log");

function log(line: string): void {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, row, "utf8");
  console.log(line);
}

function runNpm(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    log(`▶ npm run seed:cke-matura -- ${args.join(" ")}`);
    const child = spawn("npm", ["run", "seed:cke-matura", "--", ...args], {
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
  log("=== Start nocnego importu CKE ===");

  const syncCode = await runNpm(["--no-gemini"]);
  if (syncCode !== 0) {
    log(`⚠ Sync treści zakończył się kodem ${syncCode} — kontynuuję Gemini`);
  } else {
    log("✓ Sync treści OK");
  }

  const geminiCode = await runNpm(["--fill-solutions", "--delay=7000"]);
  if (geminiCode === 0) {
    log("✅ Wszystkie rozwiązania uzupełnione");
  } else {
    log(
      `⚠ Gemini zakończone kodem ${geminiCode} — uruchom ponownie: npm run seed:cke-matura -- --fill-solutions`,
    );
  }

  log("=== Koniec ===");
}

main().catch((err) => {
  log(`✗ Błąd: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
