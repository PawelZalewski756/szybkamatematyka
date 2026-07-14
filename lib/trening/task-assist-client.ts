import type { TaskGradeResult } from "@/lib/gemini/format-task-assist";
import { getSupabaseAccessToken } from "@/lib/supabase";

export type TaskAssistHintRequest = {
  mode: "hint";
  taskContent: string;
  correctAnswer: string;
  hintLevel: number;
  examLabel?: string;
  topicLabel?: string;
  isOpenTask?: boolean;
  options?: string[];
};

export type TaskAssistGradeRequest = {
  mode: "grade";
  taskContent: string;
  correctAnswer: string;
  studentAnswer: string;
  examLabel?: string;
  topicLabel?: string;
};

export type TaskAssistRequest = TaskAssistHintRequest | TaskAssistGradeRequest;

async function postTaskAssist<T>(body: TaskAssistRequest): Promise<T> {
  const token = await getSupabaseAccessToken();
  if (!token) {
    throw new Error("Zaloguj się, aby skorzystać z asystenta AI.");
  }

  const res = await fetch("/api/trening/task-assist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { error?: string; hint?: string; grade?: TaskGradeResult };
  if (!res.ok) {
    throw new Error(data.error ?? "Asystent AI jest chwilowo niedostępny.");
  }
  return data as T;
}

export async function fetchTaskHint(
  body: Omit<TaskAssistHintRequest, "mode">,
): Promise<{ hint: string; hintLevel: number }> {
  return postTaskAssist({ mode: "hint", ...body });
}

export async function fetchTaskGrade(
  body: Omit<TaskAssistGradeRequest, "mode">,
): Promise<{ grade: TaskGradeResult }> {
  return postTaskAssist({ mode: "grade", ...body });
}
