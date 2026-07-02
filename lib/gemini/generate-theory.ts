import {
  isTheoryLessonValid,
  normalizeTheoryLesson,
  type ParsedTheoryLesson,
} from "@/lib/gemini/format-theory";
import {
  buildTheoryUserPrompt,
  THEORY_LESSON_SYSTEM_PROMPT,
  THEORY_FORMAT_REMINDER,
} from "@/lib/gemini/prompts-theory";
import {
  isRetryableGeminiError,
  sleep,
} from "@/lib/gemini/generate-solution";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type GenerateTheoryInput = {
  examLabel: string;
  categoryName: string;
  topicName: string;
  categorySlug: string;
  topicSlug: string;
};

function getModelId(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
}

export async function generateTheoryLesson(
  input: GenerateTheoryInput,
): Promise<ParsedTheoryLesson> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak GEMINI_API_KEY w zmiennych środowiskowych.");
  }

  const userPrompt = buildTheoryUserPrompt(input);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: getModelId(),
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
    throw new Error(
      `Lekcja nie ma wymaganych sekcji: ${lesson.content.slice(0, 120)}…`,
    );
  }
  if (!lesson.title || lesson.title === "Lekcja") {
    lesson.title = input.topicName;
  }
  return lesson;
}

export async function generateTheoryLessonWithRetry(
  input: GenerateTheoryInput,
  maxAttempts = 6,
): Promise<ParsedTheoryLesson> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generateTheoryLesson(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);

      if (isRetryableGeminiError(message) && attempt < maxAttempts) {
        const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
        const waitMs = retryMatch
          ? Math.ceil(parseFloat(retryMatch[1]) * 1000) + 3000
          : 15 * attempt * 1000;
        console.warn(
          `  ⏳ Gemini — czekam ${Math.round(waitMs / 1000)} s (próba ${attempt}/${maxAttempts})…`,
        );
        await sleep(waitMs);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Nie udało się wygenerować lekcji.");
}
