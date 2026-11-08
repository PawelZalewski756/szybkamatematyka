import {
  isPhase3aTheoryLesson,
  isTheoryLessonValid,
  normalizeTheoryLesson,
  THEORY_MIN_PHASE3A_CHARS,
  validateTheorySections,
  type ParsedTheoryLesson,
} from "@/lib/gemini/format-theory";
import {
  buildTheoryUserPrompt,
  THEORY_LESSON_SYSTEM_PROMPT,
  THEORY_FORMAT_REMINDER,
} from "@/lib/gemini/prompts-theory";
import {
  isDailyQuotaExhausted,
  isRetryableGeminiError,
  sleep,
  waitForGeminiRetry,
} from "@/lib/gemini/gemini-retry";
import { getTheoryModelChain, parseQuotaModelFromError } from "@/lib/gemini/gemini-model-chain";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type GenerateTheoryInput = {
  examLabel: string;
  categoryName: string;
  topicName: string;
  categorySlug: string;
  topicSlug: string;
};

export type GenerateTheoryResult = ParsedTheoryLesson & { model: string };

function getModelId(modelOverride?: string): string {
  return (
    modelOverride ??
    (process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite")
  );
}

export async function generateTheoryLesson(
  input: GenerateTheoryInput,
  modelId?: string,
): Promise<GenerateTheoryResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak GEMINI_API_KEY w zmiennych środowiskowych.");
  }

  const resolvedModel = getModelId(modelId);
  const userPrompt = buildTheoryUserPrompt(input);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: resolvedModel,
    systemInstruction: THEORY_LESSON_SYSTEM_PROMPT,
  });

  const result = await model.generateContent(
    `${userPrompt}\n\n${THEORY_FORMAT_REMINDER}`,
  );
  const text = result.response.text()?.trim();
  if (!text) {
    throw new Error("Model nie zwrócił treści lekcji.");
  }

  const lesson = normalizeTheoryLesson(text);
  if (!lesson.content) {
    throw new Error("Lekcja nie ma treści po normalizacji.");
  }
  if (!isTheoryLessonValid(lesson.content)) {
    const missing = validateTheorySections(lesson.content);
    throw new Error(
      `Lekcja nie ma wymaganych sekcji (${missing.join(", ")}): ${lesson.content.slice(0, 120)}…`,
    );
  }
  if (!isPhase3aTheoryLesson(lesson.content)) {
    throw new Error(
      `Lekcja Phase 3a za krótka (< ${THEORY_MIN_PHASE3A_CHARS} znaków) lub brak pełnej struktury: ${lesson.content.length} znaków`,
    );
  }
  if (!lesson.title || lesson.title === "Lekcja") {
    lesson.title = input.topicName;
  }
  return { ...lesson, model: resolvedModel };
}

export async function generateTheoryLessonWithRetry(
  input: GenerateTheoryInput,
  maxValidationAttempts = 6,
): Promise<GenerateTheoryResult> {
  const modelChain = getTheoryModelChain();
  const exhaustedModels = new Set<string>();
  let modelIndex = 0;
  let lastError: Error | null = null;
  let validationAttempts = 0;
  let apiAttempts = 0;

  while (true) {
    const modelId = modelChain[modelIndex] ?? modelChain[modelChain.length - 1]!;

    try {
      return await generateTheoryLesson(input, modelId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);

      const validationRetry =
        /wymaganych sekcji|Phase 3a za krótka/i.test(message) &&
        validationAttempts < maxValidationAttempts;

      if (validationRetry) {
        validationAttempts += 1;
        console.warn(
          `  ⏳ Walidacja lekcji - ponawiam (${validationAttempts}/${maxValidationAttempts})…`,
        );
        await sleep(2000);
        continue;
      }

      if (isDailyQuotaExhausted(message)) {
        const quotaModel = parseQuotaModelFromError(message) ?? modelId;
        exhaustedModels.add(quotaModel);

        const nextIndex = modelChain.findIndex(
          (m, i) => i > modelIndex && !exhaustedModels.has(m),
        );
        if (nextIndex !== -1) {
          console.warn(
            `  ↪ Limit dzienny ${quotaModel} - przełączam na ${modelChain[nextIndex]} (osobny limit RPD)`,
          );
          modelIndex = nextIndex;
          apiAttempts = 0;
          continue;
        }
      }

      if (isRetryableGeminiError(message)) {
        apiAttempts += 1;
        await waitForGeminiRetry(message, apiAttempts);
        continue;
      }

      throw lastError;
    }
  }
}
