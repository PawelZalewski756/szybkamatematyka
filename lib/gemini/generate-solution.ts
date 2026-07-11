import { normalizeSolution } from "@/lib/gemini/format-solution";
import {
  GEN_Z_MATH_TUTOR_PROMPT,
  SOLUTION_FORMAT_REMINDER,
} from "@/lib/gemini/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type GenerateSolutionInput = {
  trescZadania: string;
  /** Np. „Matura”, „Egzamin 8-klasisty” */
  kontekstEgzaminu?: string;
  /** Tytuł z katalogu */
  tytul?: string;
  /** Tekst poprawnej opcji ABCD, np. "x = 6" */
  poprawnaOdpowiedz?: string | null;
  /** Litera opcji: A, B, C, D */
  literaOpcji?: string | null;
};

function getModelId(): string {
  // gemini-flash-latest → najnowszy Flash (np. 3.5) z niskim limitem free tier (~20 RPD).
  // Do generowania rozwiązań używamy Flash-Lite — wyższy limit zapytań na darmowym planie.
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
}

export async function generateMathSolution(
  input: GenerateSolutionInput,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak GEMINI_API_KEY w zmiennych środowiskowych.");
  }

  const parts: string[] = [];
  if (input.kontekstEgzaminu) {
    parts.push(`Kontekst: ${input.kontekstEgzaminu}`);
  }
  if (input.tytul) {
    parts.push(`Tytuł: ${input.tytul}`);
  }
  if (input.poprawnaOdpowiedz) {
    parts.push(
      `POPRAWNA ODPOWIEDŹ (Twoje obliczenia muszą do niej doprowadzić): ${input.poprawnaOdpowiedz}`,
    );
  }
  if (input.literaOpcji) {
    parts.push(`Poprawna litera w teście (ABCD): ${input.literaOpcji}`);
  }
  parts.push(`Treść zadania:\n\n${input.trescZadania.trim()}`);
  parts.push(SOLUTION_FORMAT_REMINDER);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: getModelId(),
    systemInstruction: GEN_Z_MATH_TUTOR_PROMPT,
  });

  const result = await model.generateContent(parts.join("\n\n"));
  const text = result.response.text()?.trim();

  if (!text) {
    throw new Error("Model nie zwrócił treści rozwiązania.");
  }

  return normalizeSolution(text);
}

/** Błędy API, po których warto ponowić żądanie (429, 503, przeciążenie). */
export function isRetryableGeminiError(message: string): boolean {
  return (
    /429|503|quota|rate limit|too many requests|high demand|unavailable|overloaded/i.test(
      message,
    )
  );
}

/** @deprecated Użyj isRetryableGeminiError */
export function isRateLimitError(message: string): boolean {
  return isRetryableGeminiError(message);
}

export function isDailyQuotaError(message: string): boolean {
  return (
    /PerDay|per day|FreeTier|GenerateRequestsPerDay|ResourceExhausted|429|quota/i.test(
      message,
    ) || /retry in \d+/i.test(message)
  );
}

/** Czytelny komunikat zamiast surowego logu GoogleGenerativeAI. */
export function formatGeminiErrorForUser(message: string): {
  status: number;
  error: string;
} {
  if (isRateLimitError(message)) {
    if (/PerDay|per day|FreeTier|GenerateRequestsPerDay/i.test(message)) {
      const modelHint = getModelId();
      const liteHint =
        modelHint.includes("lite")
          ? ""
          : " Ustaw GEMINI_MODEL=gemini-2.5-flash-lite w .env.local (Flash-Lite ma wyższy limit).";
      return {
        status: 429,
        error: `Wyczerpany dzienny limit API Gemini dla modelu „${modelHint}”. Spróbuj jutro lub zmień model.${liteHint}`,
      };
    }
    const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
    if (retryMatch) {
      const sec = Math.ceil(parseFloat(retryMatch[1]));
      return {
        status: 429,
        error: `Model AI jest chwilowo przeciążony. Spróbuj ponownie za ok. ${sec} s.`,
      };
    }
    return {
      status: 429,
      error: "Model AI jest chwilowo przeciążony. Spróbuj ponownie za chwilę.",
    };
  }

  if (/GEMINI_API_KEY|Brak GEMINI/i.test(message)) {
    return {
      status: 503,
      error: "Generowanie AI jest tymczasowo niedostępne.",
    };
  }

  if (/GoogleGenerativeAI|generativelanguage\.googleapis\.com/i.test(message)) {
    return {
      status: 503,
      error: "Nie udało się połączyć z modelem AI. Spróbuj ponownie później.",
    };
  }

  return {
    status: 500,
    error:
      message.length <= 120 && !message.includes("[GoogleGenerativeAI")
        ? message
        : "Nie udało się wygenerować rozwiązania.",
  };
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateMathSolutionWithRetry(
  input: GenerateSolutionInput,
  maxAttempts = 8,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generateMathSolution(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);

      if (isRetryableGeminiError(message) && attempt < maxAttempts) {
        const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
        const isDailyQuota = /PerDay|per day|FreeTier/i.test(message);
        const isOverload = /503|high demand|unavailable|overloaded/i.test(message);
        const waitMs = retryMatch
          ? Math.ceil(parseFloat(retryMatch[1]) * 1000) + 3000
          : isDailyQuota
            ? 70 * 60 * 1000
            : isOverload
              ? Math.min(120_000, 20 * attempt * 1000)
              : 15 * attempt * 1000;
        const label =
          waitMs >= 60_000
            ? `${Math.round(waitMs / 60_000)} min`
            : `${Math.round(waitMs / 1000)} s`;
        console.warn(
          `  ⏳ Limit API — czekam ${label} (próba ${attempt}/${maxAttempts})…`,
        );
        await sleep(waitMs);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Nie udało się wygenerować rozwiązania.");
}
