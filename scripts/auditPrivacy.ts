import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { scanFile } from "@/lib/security/privacy-scan";

/**
 * Guard CI: nie pozwala dodać do repo adresów e-mail użytkowników w SQL/docs
 * ani sekretów (Stripe, Supabase, Google, Telegram, klucze prywatne).
 *
 * Skanujemy tylko pliki śledzone przez git - `.env.local` nigdy nie wchodzi.
 * Adresy e-mail sprawdzamy w `supabase/` i `docs/`; sekrety we wszystkich
 * plikach tekstowych. Wyniki są maskowane, żeby log CI nie wyciekł danych.
 */
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const PII_SCOPE = /^(supabase|docs)\//;

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

const allFindings: Array<{
  file: string;
  line: number;
  kind: string;
  label: string;
  masked: string;
}> = [];

for (const file of files) {
  try {
    if (statSync(file).size > MAX_FILE_BYTES) continue;
    const content = readFileSync(file, "utf8");
    if (content.includes("\u0000")) continue;

    for (const finding of scanFile(file, content, {
      scanEmails: PII_SCOPE.test(file),
    }).findings) {
      allFindings.push({ file, ...finding });
    }
  } catch {
    // Plik usunięty w trakcie skanu lub nieczytelny - pomijamy.
  }
}

if (allFindings.length > 0) {
  console.error("Znaleziono dane wrażliwe w repo:");
  for (const finding of allFindings) {
    console.error(
      `  ${finding.file}:${finding.line} [${finding.kind}] ${finding.label}: ${finding.masked}`,
    );
  }
  console.error(
    "\nUsuń adresy e-mail użytkowników (użyj ID) i nie commituj sekretów. " +
      "Placeholdery example.* / *.invalid są dozwolone.",
  );
  process.exitCode = 1;
} else {
  console.log(
    `Privacy audit OK - ${files.length} plików, brak PII w SQL/docs i brak sekretów.`,
  );
}
