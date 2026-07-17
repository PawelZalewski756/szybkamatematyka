import {
  contentFingerprint,
  normalizeGeminiTask,
  parseGeminiTasksJson,
  type ParsedGeminiTask,
} from "@/lib/gemini/format-tasks";
import { getTheoryModelChain, parseQuotaModelFromError } from "@/lib/gemini/gemini-model-chain";
import {
  isDailyQuotaExhausted,
  isRetryableGeminiError,
  sleep,
  waitForGeminiRetry,
} from "@/lib/gemini/gemini-retry";
import {
  buildOpenTasksBatchUserPrompt,
  buildTasksBatchUserPrompt,
  TASKS_BATCH_SYSTEM_PROMPT,
  TASKS_FIGURES_REMINDER,
  TASKS_FORMAT_REMINDER,
  TASKS_OPEN_FORMAT_REMINDER,
  TASKS_OPEN_SYSTEM_PROMPT,
  type GenerateTasksInput,
} from "@/lib/gemini/prompts-tasks";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type GenerateTasksBatchResult = {
  tasks: ParsedGeminiTask[];
  model: string;
};

function getModelId(modelOverride?: string): string {
  return (
    modelOverride ??
    (process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite")
  );
}

export async function generateTasksBatch(
  input: GenerateTasksInput,
  modelId?: string,
): Promise<GenerateTasksBatchResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak GEMINI_API_KEY w zmiennych środowiskowych.");
  }

  const resolvedModel = getModelId(modelId);
  const genAI = new GoogleGenerativeAI(apiKey);
  const isOpen = input.taskKind === "open";
  const model = genAI.getGenerativeModel({
    model: resolvedModel,
    systemInstruction: isOpen ? TASKS_OPEN_SYSTEM_PROMPT : TASKS_BATCH_SYSTEM_PROMPT,
  });

  const userPrompt = isOpen
    ? buildOpenTasksBatchUserPrompt(input)
    : buildTasksBatchUserPrompt(input);
  const reminder = isOpen
    ? TASKS_OPEN_FORMAT_REMINDER
    : input.requireFigures
      ? TASKS_FIGURES_REMINDER
      : TASKS_FORMAT_REMINDER;
  const result = await model.generateContent(`${userPrompt}\n\n${reminder}`);
  const text = result.response.text()?.trim();
  if (!text) {
    throw new Error("Model nie zwrócił treści zadań.");
  }

  const rawItems = parseGeminiTasksJson(text);
  const tasks: ParsedGeminiTask[] = [];
  for (const item of rawItems) {
    const normalized = normalizeGeminiTask(item);
    if (!normalized) continue;
    if (input.requireFigures && !normalized.figure_svg) continue;
    tasks.push(normalized);
  }

  if (tasks.length === 0) {
    throw new Error(
      input.requireFigures
        ? `Żadne zadanie z SVG nie przeszło walidacji (surowo: ${rawItems.length}).`
        : `Żadne zadanie nie przeszło walidacji (surowo: ${rawItems.length}).`,
    );
  }

  return { tasks, model: resolvedModel };
}

export async function generateTasksBatchWithRetry(
  input: GenerateTasksInput,
  maxValidationAttempts = 5,
): Promise<GenerateTasksBatchResult> {
  const modelChain = getTheoryModelChain();
  const exhaustedModels = new Set<string>();
  let modelIndex = 0;
  let validationAttempts = 0;
  let apiAttempts = 0;
  let lastError: Error | null = null;

  while (true) {
    const modelId = modelChain[modelIndex] ?? modelChain[modelChain.length - 1]!;

    try {
      return await generateTasksBatch(input, modelId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);

      const validationRetry =
        (/walidacji|tablicą JSON|Nie zwrócił|JSON at position|Expected ',' or '\}'/i.test(
          message,
        ) &&
          validationAttempts < maxValidationAttempts);

      if (validationRetry) {
        validationAttempts += 1;
        console.warn(
          `  ⏳ Walidacja partii — ponawiam (${validationAttempts}/${maxValidationAttempts})…`,
        );
        await sleep(1500);
        continue;
      }

      if (isDailyQuotaExhausted(message)) {
        const quotaModel = parseQuotaModelFromError(message) ?? modelId;
        exhaustedModels.add(quotaModel);
        const nextIndex = modelChain.findIndex(
          (m, i) => i > modelIndex && !exhaustedModels.has(m),
        );
        if (nextIndex >= 0) {
          modelIndex = nextIndex;
          apiAttempts = 0;
          console.warn(`  ↪ Limit dzienny ${quotaModel} — model ${modelChain[nextIndex]}`);
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

export function dedupeTasks(
  tasks: ParsedGeminiTask[],
  existingFingerprints: Set<string>,
): ParsedGeminiTask[] {
  const out: ParsedGeminiTask[] = [];
  for (const task of tasks) {
    const fp = contentFingerprint(task.content);
    if (existingFingerprints.has(fp)) continue;
    existingFingerprints.add(fp);
    out.push(task);
  }
  return out;
}
