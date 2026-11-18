/**
 * Weryfikacja zadań zgłoszonych przez użytkowników 18.11.2026.
 *
 *   npm run audit:reported-tasks
 *
 * Wymaga NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY w .env.local.
 * Bez konfiguracji kończy się kodem 0 i wyraźnym komunikatem (nie blokuje CI).
 */
import dotenv from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const EXPECTED = new Map([
  ["b11b2734-f3e1-46c0-9d9c-67257754ae85", "81"],
  ["34c8fcc8-8218-40b8-a6dd-b4b848f228e0", "33"],
  ["ba4f578a-5919-4891-aa1f-94027f96f18f", "19"],
  ["9424496e-e443-4a89-8504-ff7d5df26436", "18"],
]);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.log(
    "POMINIĘTO: brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY w .env.local.",
  );
  console.log(
    "Po uzupełnieniu env uruchom ponownie: npm run audit:reported-tasks",
  );
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ids = [...EXPECTED.keys()];
const { data, error } = await supabase
  .from("tasks")
  .select("id, content, correct_answer, options")
  .in("id", ids);

if (error) {
  console.error("BŁĄD ODCZYTU:", error.message);
  process.exit(1);
}

const found = new Map((data ?? []).map((row) => [String(row.id), row]));
let wrong = 0;

for (const [id, expected] of EXPECTED) {
  const row = found.get(id);
  if (!row) {
    console.log(`✗ ${id}: nie ma takiego zadania w tabeli tasks`);
    wrong += 1;
    continue;
  }
  const answer = String(row.correct_answer ?? "");
  const options = Array.isArray(row.options) ? row.options.map(String) : [];
  const answerInOptions = options.length === 0 || options.includes(answer);
  const ok = answer === expected && answerInOptions;
  console.log(
    `${ok ? "✓" : "✗"} ${id}: correct_answer=${answer} (oczekiwane ${expected})` +
      (options.length ? `, opcje=${JSON.stringify(options)}` : ", zadanie otwarte") +
      ` — ${String(row.content ?? "").slice(0, 80)}`,
  );
  if (!ok) wrong += 1;
}

if (wrong > 0) {
  console.error(`\n${wrong} z ${EXPECTED.size} zgłoszonych zadań nadal wymaga poprawki.`);
  process.exit(1);
}

console.log(`\nWszystkie ${EXPECTED.size} zgłoszone zadania są poprawne.`);
