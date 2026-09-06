import type { TaskGradeResult } from "@/lib/gemini/format-task-assist";
import type { TaskAssistAskTurn } from "@/lib/gemini/prompts-task-assist";
import type { AssistQuotaSnapshot } from "@/lib/subscription/task-assist-quota";
import { getSupabaseAccessToken } from "@/lib/supabase";

export type TaskAssistHintRequest = {
  mode: "hint";
  taskId: string;
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
  taskId: string;
  taskContent: string;
  correctAnswer: string;
  studentAnswer: string;
  examLabel?: string;
  topicLabel?: string;
  maxPoints?: number;
  markingNotes?: string;
};

export type TaskAssistAskRequest = {
  mode: "ask";
  taskId: string;
  taskContent: string;
  correctAnswer: string;
  userMessage: string;
  examLabel?: string;
  topicLabel?: string;
  hintContext?: string;
  gradeContext?: string;
  conversationHistory?: TaskAssistAskTurn[];
};

export type TaskAssistRequest =
  | TaskAssistHintRequest
  | TaskAssistGradeRequest
  | TaskAssistAskRequest;

type TaskAssistResponse<T> = T & { quota?: AssistQuotaSnapshot; error?: string };

async function postTaskAssist<T>(
  body: TaskAssistRequest,
): Promise<TaskAssistResponse<T>> {
  const token = await getSupabaseAccessToken();
  if (!token) {
    throw new Error("Zaloguj się, aby skorzystać z asystenta.");
  }

  const res = await fetch("/api/trening/task-assist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as TaskAssistResponse<T>;
  if (!res.ok) {
    const err = new Error(data.error ?? "Asystent jest chwilowo niedostępny.") as Error & {
      quota?: AssistQuotaSnapshot;
    };
    err.quota = data.quota;
    throw err;
  }
  return data;
}

export async function fetchTaskAssistQuota(): Promise<AssistQuotaSnapshot> {
  const token = await getSupabaseAccessToken();
  if (!token) {
    throw new Error("Zaloguj się, aby skorzystać z asystenta.");
  }

  const res = await fetch("/api/trening/task-assist/quota", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as {
    quota?: AssistQuotaSnapshot;
    error?: string;
  };
  if (!res.ok || !data.quota) {
    throw new Error(data.error ?? "Nie udało się sprawdzić limitu zapytań.");
  }
  return data.quota;
}

export async function fetchTaskHint(
  body: Omit<TaskAssistHintRequest, "mode">,
): Promise<{ hint: string; hintLevel: number; quota?: AssistQuotaSnapshot }> {
  return postTaskAssist({ mode: "hint", ...body });
}

export async function fetchTaskGrade(
  body: Omit<TaskAssistGradeRequest, "mode">,
): Promise<{ grade: TaskGradeResult; quota?: AssistQuotaSnapshot }> {
  return postTaskAssist({ mode: "grade", ...body });
}

export async function fetchTaskAsk(
  body: Omit<TaskAssistAskRequest, "mode">,
): Promise<{ reply: string; quota?: AssistQuotaSnapshot }> {
  return postTaskAssist({ mode: "ask", ...body });
}

export type { AssistQuotaSnapshot };
