/**
 * Oficjalne arkusze E8: PDF zadań + zasady oceniania CKE → zweryfikowany cache.
 *
 * npm run seed:cke-e8 -- --only=e8-2025-maj
 * npm run seed:cke-e8 -- --all
 *
 * Wymaga GEMINI_API_KEY. Skrypt nie zapisuje do DB; publikacja następuje przez
 * wspólny, audytowalny eksport `npm run seed:exam-archive`.
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  EGZAMIN_8_SESSIONS,
  type Egzamin8Session,
} from "../lib/baza-zadan/cke/egzamin-8-sessions";
import { isSolutionPlaceholder } from "../lib/baza-zadan/solution-content";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const outputDir = path.resolve(process.cwd(), "data/cke-e8-cache");
const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";

type ParsedTask = {
  numer: number;
  dzial: string;
  tresc: string;
  rozwiazanie: string;
};

type ParsedSheet = {
  sessionId: string;
  nazwa: string;
  typ: "egzamin-8";
  rok: number;
  miesiac: number;
  source: {
    taskPdfUrl: string;
    scoringPdfUrl: string;
  };
  fetchedAt: string;
  tasks: ParsedTask[];
};

function selectedSessions(): readonly Egzamin8Session[] {
  const only = process.argv
    .find((arg) => arg.startsWith("--only="))
    ?.split("=")[1];
  if (only) {
    const session = EGZAMIN_8_SESSIONS.find((item) => item.id === only);
    if (!session) throw new Error(`Nieznana sesja E8: ${only}`);
    return [session];
  }
  if (process.argv.includes("--all")) return EGZAMIN_8_SESSIONS;
  throw new Error("Podaj --only=<id> albo --all.");
}

async function downloadPdf(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { "user-agent": "SzybkaMatematyka-CKE-Importer/1.0" },
  });
  if (!response.ok) {
    throw new Error(`CKE ${response.status}: ${url}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("pdf")) {
    throw new Error(`Źródło nie jest PDF (${contentType}): ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function parseJson(text: string): ParsedTask[] {
  const raw = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Model nie zwrócił tablicy zadań.");

  return parsed.map((value, index) => {
    const task = value as Partial<ParsedTask>;
    if (
      !Number.isInteger(task.numer) ||
      typeof task.tresc !== "string" ||
      typeof task.rozwiazanie !== "string" ||
      typeof task.dzial !== "string"
    ) {
      throw new Error(`Nieprawidłowe zadanie E8 na pozycji ${index + 1}.`);
    }
    return {
      numer: Number(task.numer),
      dzial: task.dzial.trim() || "Inne",
      tresc: task.tresc.trim(),
      rozwiazanie: task.rozwiazanie.trim(),
    };
  });
}

function validateTasks(tasks: ParsedTask[]): void {
  if (tasks.length < 15 || tasks.length > 30) {
    throw new Error(`Podejrzana liczba zadań E8: ${tasks.length}.`);
  }
  const numbers = new Set<number>();
  for (const task of tasks) {
    if (numbers.has(task.numer)) {
      throw new Error(`Duplikat numeru zadania E8: ${task.numer}.`);
    }
    numbers.add(task.numer);
    if (task.tresc.length < 20) {
      throw new Error(`Zbyt krótka treść zadania ${task.numer}.`);
    }
    if (isSolutionPlaceholder(task.rozwiazanie)) {
      throw new Error(`Placeholder rozwiązania w zadaniu ${task.numer}.`);
    }
  }
}

async function parseSession(
  session: Egzamin8Session,
  apiKey: string,
): Promise<ParsedSheet> {
  const [taskPdf, scoringPdf] = await Promise.all([
    downloadPdf(session.taskPdfUrl),
    downloadPdf(session.scoringPdfUrl),
  ]);

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: modelName,
  });
  const prompt = `
Przepisz WYŁĄCZNIE zadania z matematyki ze standardowego arkusza E8 (wersja X).
Drugi PDF zawiera oficjalny klucz i zasady oceniania — to jedyne źródło prawdy.

Zwróć czysty JSON: tablicę obiektów:
{"numer":1,"dzial":"Liczby","tresc":"pełna treść wraz z A) ... D) ...","rozwiazanie":"Krok 1...\\nOdpowiedź: B, czyli ..."}

Wymagania:
- zachowaj wszystkie zadania oraz opcje A–D;
- dla zamkniętych zacznij końcową linię od dokładnej litery z oficjalnego klucza;
- dla otwartych podaj pełny poprawny tok zgodny z zasadami;
- nie zgaduj brakujących treści i nie używaj sformułowań „zazwyczaj”;
- dzial wybierz spośród: Liczby, Algebra, Procenty, Geometria, Statystyka,
  Prawdopodobieństwo, Układ współrzędnych, Inne.
`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: taskPdf.toString("base64"),
      },
    },
    {
      inlineData: {
        mimeType: "application/pdf",
        data: scoringPdf.toString("base64"),
      },
    },
    { text: prompt },
  ]);

  const tasks = parseJson(result.response.text());
  validateTasks(tasks);
  return {
    sessionId: session.id,
    nazwa: session.title,
    typ: "egzamin-8",
    rok: session.year,
    miesiac: session.month,
    source: {
      taskPdfUrl: session.taskPdfUrl,
      scoringPdfUrl: session.scoringPdfUrl,
    },
    fetchedAt: new Date().toISOString(),
    tasks,
  };
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Brak GEMINI_API_KEY w .env.local.");
  fs.mkdirSync(outputDir, { recursive: true });

  for (const session of selectedSessions()) {
    console.log(`E8: ${session.title}`);
    const sheet = await parseSession(session, apiKey);
    const output = path.join(outputDir, `${session.id}.json`);
    fs.writeFileSync(output, `${JSON.stringify(sheet, null, 2)}\n`, "utf8");
    console.log(`✓ ${sheet.tasks.length} zadań → ${output}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

