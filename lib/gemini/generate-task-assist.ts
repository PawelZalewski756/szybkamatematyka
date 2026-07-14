import {
  normalizeHintText,
  parseTaskGradeResponse,
  type TaskGradeResult,
} from "@/lib/gemini/format-task-assist";
import {
  buildGradeUserPrompt,
  buildHintUserPrompt,
  TASK_ASSIST_GRADE_SYSTEM,
  TASK_ASSIST_HINT_SYSTEM,
  type TaskAssistGradeInput,
  type TaskAssistHintInput,
} from "@/lib/gemini/prompts-task-assist";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getModelId(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Brak GEMINI_API_KEY w zmiennych środowiskowych.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateTaskHint(
  input: TaskAssistHintInput,
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: getModelId(),
    systemInstruction: TASK_ASSIST_HINT_SYSTEM,
  });

  const result = await model.generateContent(buildHintUserPrompt(input));
  const text = result.response.text()?.trim();
  if (!text) {
    throw new Error("Model nie zwrócił podpowiedzi.");
  }
  return normalizeHintText(text);
}

export async function gradeOpenTaskAnswer(
  input: TaskAssistGradeInput,
): Promise<TaskGradeResult> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: getModelId(),
    systemInstruction: TASK_ASSIST_GRADE_SYSTEM,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(buildGradeUserPrompt(input));
  const text = result.response.text()?.trim();
  if (!text) {
    throw new Error("Model nie zwrócił oceny.");
  }

  const parsed = parseTaskGradeResponse(text);
  if (!parsed) {
    throw new Error("Nie udało się odczytać oceny AI.");
  }
  return parsed;
}
