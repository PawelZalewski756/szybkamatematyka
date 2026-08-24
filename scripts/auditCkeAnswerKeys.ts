/**
 * Sprawdza, czy statyczne archiwum punktuje wyłącznie zadania z
 * jednoznacznym kluczem wynikającym z rozwiązania.
 */
import fs from "fs";
import path from "path";
import {
  parseAbcd,
  resolveCkeAnswer,
} from "../lib/baza-zadan/cke/parse-abcd";
import { EXAM_ARCHIVE_TASKS } from "../lib/baza-zadan/exams/cke-archive.generated";

type CachedTask = {
  numer: number;
  tresc: string;
  rozwiazanie: string;
};

type CachedSheet = {
  sessionId: string;
  tasks: CachedTask[];
};

const cacheDir = path.resolve(process.cwd(), "data/cke-matura-cache");
const expected = new Map<string, number | null>();
const statuses = { resolved: 0, ambiguous: 0, ungraded: 0 };

for (const file of fs.readdirSync(cacheDir).filter((name) => name.endsWith(".json"))) {
  const sheet = JSON.parse(
    fs.readFileSync(path.join(cacheDir, file), "utf8"),
  ) as CachedSheet;

  for (const task of sheet.tasks) {
    const parsed = parseAbcd(task.tresc);
    const answer = resolveCkeAnswer(task.rozwiazanie, parsed);
    statuses[answer.status] += 1;
    const id = `cke-${sheet.sessionId}-z${String(task.numer).padStart(2, "0")}`;
    expected.set(
      id,
      answer.status === "resolved" ? answer.correctIndex : null,
    );
  }
}

const issues: string[] = [];
for (const task of EXAM_ARCHIVE_TASKS) {
  const expectedIndex = expected.get(task.id);
  if (expectedIndex === undefined) {
    issues.push(`${task.id}: brak zadania źródłowego w cache`);
    continue;
  }
  if (task.correctIndex !== expectedIndex) {
    issues.push(
      `${task.id}: correctIndex=${String(task.correctIndex)}, oczekiwano ${String(expectedIndex)}`,
    );
  }
}

console.log("\n=== Audyt kluczy CKE ===");
console.log(`Jednoznaczne: ${statuses.resolved}`);
console.log(`Niejednoznaczne: ${statuses.ambiguous}`);
console.log(`Otwarte/wieloczęściowe: ${statuses.ungraded}`);
console.log(`Rozbieżności eksportu: ${issues.length}`);

if (statuses.resolved === 0) {
  issues.push("Nie rozpoznano żadnego jednoznacznego klucza");
}

if (issues.length > 0) {
  for (const issue of issues.slice(0, 50)) console.error(`✗ ${issue}`);
  process.exit(1);
}

console.log("✓ Archiwum nie zgaduje kluczy odpowiedzi.");

