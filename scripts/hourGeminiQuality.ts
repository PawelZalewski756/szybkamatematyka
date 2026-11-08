/**
 * Godzinna sesja Gemini - jakość rozwiązań CKE (krótkie / broken) + push teorii.
 *
 *   npx tsx scripts/hourGeminiQuality.ts
 *   npx tsx scripts/hourGeminiQuality.ts --minutes=60
 *
 * Nie tworzy nowych arkuszy / nie dubluje source_id.
 * Log: data/logs/hour-gemini-quality.log
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { isSolutionPlaceholder } from "../lib/gemini/format-solution";
import { generateMathSolutionWithRetry } from "../lib/gemini/generate-solution";
import { cleanMaturaTaskText } from "../lib/baza-zadan/cke/parse-matura-page";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-matura-cache");
const LOG = path.resolve(process.cwd(), "data/logs/hour-gemini-quality.log");

type CachedTask = {
  numer: number;
  dzial: string;
  tresc: string;
  rozwiazanie: string;
};

type CachedSheet = {
  sessionId: string;
  nazwa: string;
  rok: number;
  miesiac: number;
  tasks: CachedTask[];
  fetchedAt: string;
};

function log(line: string): void {
  const row = `[${new Date().toISOString()}] ${line}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, row, "utf8");
  console.log(line);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function needsQualityRewrite(
  rozwiazanie: string,
  mode: "strict" | "polish" = "strict",
): string | null {
  const r = rozwiazanie.trim();
  if (!r || isSolutionPlaceholder(r)) return "placeholder";
  if (r.length < 140) return "za krótkie";
  if (/błąd w zadaniu|błąd w opcjach|poprawiam poprawn|Jest problem z opcjami/i.test(r)) {
    return "broken explanation";
  }
  if ((r.match(/Krok/gi) || []).length < 2 && r.length < 280) return "słabe kroki";
  if (mode === "polish") {
    const steps = (r.match(/Krok/gi) || []).length;
    if (r.length < 420) return "dopracowanie (krótkie)";
    if (steps < 3 && r.length < 700) return "dopracowanie (mało kroków)";
    if (!/\$|\\frac|\\sqrt|\\cdot|\\times/i.test(r) && r.length < 900) {
      return "dopracowanie (brak LaTeX)";
    }
  }
  return null;
}

function sourceId(sessionId: string, numer: number): string {
  const slug = sessionId === "m24-maj" ? "m24-maj-p" : sessionId;
  return `cke-${slug}-z${String(numer).padStart(2, "0")}`;
}

function runNpm(script: string, args: string[] = []): Promise<number> {
  return new Promise((resolve) => {
    log(`▶ npm run ${script} ${args.join(" ")}`.trim());
    const child = spawn(
      "npm",
      ["run", script, ...(args.length ? ["--", ...args] : [])],
      { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], env: process.env, shell: true },
    );
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

async function improveCkeSolutions(
  deadline: number,
  mode: "strict" | "polish" = "strict",
): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    log("⚠ Brak Supabase - tylko cache");
  }
  const supabase =
    url && key
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;

  let improved = 0;
  const files = fs
    .readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  for (const file of files) {
    if (Date.now() >= deadline) break;
    const full = path.join(CACHE_DIR, file);
    const sheet = JSON.parse(fs.readFileSync(full, "utf8")) as CachedSheet;
    let changed = false;

    for (const task of sheet.tasks) {
      if (Date.now() >= deadline) break;
      const reason = needsQualityRewrite(task.rozwiazanie, mode);
      if (!reason) continue;

      log(
        `  ↻ ${sheet.sessionId} zad.${task.numer} (${reason}) - Gemini…`,
      );
      try {
        const next = await generateMathSolutionWithRetry({
          trescZadania: task.tresc,
          kontekstEgzaminu: "Matura - poziom podstawowy (CKE)",
          tytul: `${sheet.nazwa}, zadanie ${task.numer}`,
        });
        if (!next.trim() || isSolutionPlaceholder(next)) {
          log("    ⚠ puste - pomijam");
          continue;
        }
        // W trybie polish nie degraduj już dobrego tekstu
        if (
          mode === "polish" &&
          next.trim().length < task.rozwiazanie.trim().length * 0.85
        ) {
          log("    ⚠ krótsze niż poprzednie - pomijam");
          continue;
        }
        task.rozwiazanie = next.trim();
        changed = true;
        improved += 1;

        if (supabase) {
          const sid = sourceId(sheet.sessionId, task.numer);
          const { error } = await supabase
            .from("zadania")
            .update({
              rozwiazanie: task.rozwiazanie,
              tresc: cleanMaturaTaskText(task.tresc),
            })
            .eq("source_id", sid);
          if (error) {
            log(`    ⚠ update source_id: ${error.message}`);
          } else {
            log(`    ✓ DB zaktualizowane (${sid})`);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`    ✗ ${msg.slice(0, 200)}`);
        if (/429|quota|rate/i.test(msg)) {
          log("    ⏳ limit API - czekam 90s");
          await sleep(90_000);
        }
      }
      await sleep(2500);
    }

    if (changed) {
      sheet.fetchedAt = new Date().toISOString();
      fs.writeFileSync(full, JSON.stringify(sheet, null, 2));
      log(`  💾 zapisano ${file}`);
    }
  }

  return improved;
}

async function main() {
  const minutesArg = process.argv.find((a) => a.startsWith("--minutes="));
  const minutes = minutesArg ? Number(minutesArg.split("=")[1]) : 60;
  const deadline = Date.now() + Math.max(5, minutes) * 60_000;

  log(`═══ Godzinna sesja jakości Gemini (${minutes} min) ═══`);

  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Brak GEMINI_API_KEY");
  }

  // 1) Wgraj teorię do Supabase (bez Gemini, szybkie)
  await runNpm("seed:theory-cache");
  await runNpm("audit:theory");

  // 2) Popraw słabe rozwiązania CKE (Gemini, bez nowych arkuszy)
  log("\n═══ Poprawa jakości rozwiązań CKE (strict) ═══");
  const improvedStrict = await improveCkeSolutions(deadline, "strict");
  log(`Poprawiono (strict): ${improvedStrict}`);

  // 3) Dopracuj średnie rozwiązania - pełne wykorzystanie godziny
  if (Date.now() < deadline) {
    log("\n═══ Dopracowanie rozwiązań CKE (polish) ═══");
    const improvedPolish = await improveCkeSolutions(deadline, "polish");
    log(`Poprawiono (polish): ${improvedPolish}`);
    log(`Razem poprawionych: ${improvedStrict + improvedPolish}`);
  }

  // 4) Audyt końcowy
  await runNpm("audit:cke");
  await runNpm("audit:questions");

  log(`═══ Koniec sesji (pozostało ${Math.max(0, Math.round((deadline - Date.now()) / 60000))} min bufora) ═══`);
}

main().catch((err) => {
  log(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
