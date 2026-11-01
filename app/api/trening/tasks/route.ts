import { taskContentForDb } from "@/lib/gemini/format-tasks";
import { listAllCachedTasks } from "@/lib/trening/seed/tasks-cache-utils";
import { explainParametricTask } from "@/lib/trening/seed/parametric-explanations";
import type { ExamType } from "@/types/database";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EXAM_TYPES = new Set<ExamType>([
  "matura_podstawowa",
  "matura_rozszerzona",
  "8_klasa",
]);

type CachedTaskResponse = {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  content: string;
  correct_answer: string;
  options: string[];
  xp_reward: number;
  explanation?: string;
};

let cachedTasks: CachedTaskResponse[] | null = null;

function loadCachedTasks(): CachedTaskResponse[] {
  if (cachedTasks) return cachedTasks;

  cachedTasks = listAllCachedTasks().map((task) => {
    const explanation = String(task.model || "").startsWith("parametric")
      ? explainParametricTask(task.topic, task.content, task.correct_answer)
      : task.explanation;
    return {
      id: task.id,
      exam_type: task.exam_type,
      category: task.category,
      topic: task.topic,
      difficulty: task.difficulty,
      content: taskContentForDb(task),
      correct_answer: task.correct_answer,
      options: task.options,
      xp_reward: task.xp_reward,
      explanation: explanation ?? undefined,
    };
  });

  return cachedTasks;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawExamType = searchParams.get("examType");
  const category = searchParams.get("category");
  const topic = searchParams.get("topic");
  const summary = searchParams.get("summary") === "1";

  if (!rawExamType || !EXAM_TYPES.has(rawExamType as ExamType)) {
    return NextResponse.json({ error: "Nieprawidłowy egzamin" }, { status: 400 });
  }

  const examType = rawExamType as ExamType;
  const tasks = loadCachedTasks().filter((task) => {
    if (task.exam_type !== examType) return false;
    if (category && task.category !== category) return false;
    if (topic && task.topic !== topic) return false;
    return true;
  });

  const response = summary
    ? tasks.map(({ id, category: taskCategory, topic: taskTopic }) => ({
        id,
        category: taskCategory,
        topic: taskTopic,
      }))
    : tasks;

  return NextResponse.json(
    { tasks: response },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    },
  );
}
