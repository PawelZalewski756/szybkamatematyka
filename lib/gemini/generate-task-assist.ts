import {
  normalizeHintText,
  parseTaskGradeResponse,
  type TaskGradeResult,
} from "@/lib/gemini/format-task-assist";
import {
  buildAskUserPrompt,
  buildGradeUserPrompt,
  buildHintUserPrompt,
  TASK_ASSIST_ASK_SYSTEM,
  TASK_ASSIST_GRADE_SYSTEM,
  TASK_ASSIST_HINT_SYSTEM,
  type TaskAssistAskInput,
  type TaskAssistGradeInput,
  type TaskAssistHintInput,
} from "@/lib/gemini/prompts-task-assist";
import { getTheoryModelChain } from "@/lib/gemini/gemini-model-chain";
import {
  isDailyQuotaExhausted,
  isRetryableGeminiError,
  waitForGeminiRetry,
} from "@/lib/gemini/gemini-retry";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Brak GEMINI_API_KEY w zmiennych środowiskowych.");
  }
  return new GoogleGenerativeAI(apiKey);
}

type AssistGenerationConfig = {
  responseMimeType?: string;
};

async function generateAssistText(
  systemInstruction: string,
  prompt: string,
  generationConfig?: AssistGenerationConfig,
): Promise<string> {
  const genAI = getClient();
  let lastError: Error | null = null;

  for (const modelId of getTheoryModelChain()) {
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction,
      ...(generationConfig ? { generationConfig } : {}),
    });

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text()?.trim();
        if (!text) {
          throw new Error("Model nie zwrócił odpowiedzi.");
        }
        return text;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const message = lastError.message;
        if (isDailyQuotaExhausted(message)) {
          break;
        }
        if (
          !isRetryableGeminiError(message) ||
          attempt >= 2
        ) {
          throw lastError;
        }
        await waitForGeminiRetry(message, attempt);
      }
    }
  }

  throw lastError ?? new Error("Nie udało się uzyskać odpowiedzi modelu.");
}

export async function generateTaskHint(
  input: TaskAssistHintInput,
): Promise<string> {
  const text = await generateAssistText(
    TASK_ASSIST_HINT_SYSTEM,
    buildHintUserPrompt(input),
  );
  return normalizeHintText(text);
}

export async function gradeOpenTaskAnswer(
  input: TaskAssistGradeInput,
): Promise<TaskGradeResult> {
  const text = await generateAssistText(
    TASK_ASSIST_GRADE_SYSTEM,
    buildGradeUserPrompt(input),
    { responseMimeType: "application/json" },
  );

  const parsed = parseTaskGradeResponse(text, input.maxPoints);
  if (!parsed) {
    throw new Error("Nie udało się odczytać oceny odpowiedzi.");
  }
  return parsed;
}

export async function generateTaskAskReply(
  input: TaskAssistAskInput,
): Promise<string> {
  const text = await generateAssistText(
    TASK_ASSIST_ASK_SYSTEM,
    buildAskUserPrompt(input),
  );
  return normalizeHintText(text);
}
