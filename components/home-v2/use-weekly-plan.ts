"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadDiagnosticResult, subscribeDiagnostic } from "@/lib/diagnostyka";
import { loadExamDate, subscribeExamDate } from "@/lib/exam-date";
import {
  loadSchoolClass,
  subscribeLearningPath,
} from "@/lib/learning-path";
import {
  buildWeeklyPlan,
  getWeekStartKey,
  type WeeklyPlan,
} from "@/lib/plan-tygodnia/plan";
import {
  loadWeeklyPlanProgress,
  toggleWeeklyPlanTask,
  WEEKLY_PLAN_EVENT,
} from "@/lib/plan-tygodnia/storage";
import { isDue } from "@/lib/powtorki/scheduler";
import {
  loadSchedule,
  REVIEW_SCHEDULE_UPDATED_EVENT,
} from "@/lib/powtorki/storage";
import { loadRecentTrainingTopic } from "@/lib/trening/recent-topic";
import { buildTopicHref, topicDisplayName } from "@/lib/trening/slugs";
import { getSupabaseOrNull } from "@/lib/supabase";

export type WeeklyPlanState = {
  plan: WeeklyPlan | null;
  loading: boolean;
  toggleTask: (taskId: string) => void;
};

function weakestCategoryLabel(): string | null {
  const result = loadDiagnosticResult();
  if (!result || result.categories.length === 0) return null;

  const sorted = [...result.categories].sort((a, b) => {
    const aRatio = a.total > 0 ? a.correct / a.total : 1;
    const bRatio = b.total > 0 ? b.correct / b.total : 1;
    return aRatio - bRatio;
  });

  return sorted[0]?.label ?? null;
}

function buildPlanForUser(userId: string | null): WeeklyPlan {
  const now = new Date();
  const schoolClass = loadSchoolClass();
  const examDate = loadExamDate();
  const schedule = loadSchedule(userId);
  const scheduleItems = Object.values(schedule);
  const dueReviewCount = scheduleItems.filter((item) =>
    isDue(item, now.getTime()),
  ).length;

  const recent = loadRecentTrainingTopic(userId);
  const recentTopic = recent
    ? {
        id: `${recent.examKey}:${recent.category}:${recent.topic}`,
        title: topicDisplayName(recent.examKey, recent.category, recent.topic),
        href: buildTopicHref(recent.examKey, recent.category, recent.topic),
      }
    : null;

  const weekStart = getWeekStartKey(now);
  const progress = loadWeeklyPlanProgress(weekStart);

  return buildWeeklyPlan({
    schoolClass,
    examDate,
    now,
    dueReviewCount,
    reviewTotalCount: scheduleItems.length,
    weakestCategory: weakestCategoryLabel(),
    recentTopic,
    completedTaskIds: progress.completed,
  });
}

export function useWeeklyPlan(): WeeklyPlanState {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const userIdRef = useRef<string | null>(null);

  const recompute = useCallback(() => {
    setPlan(buildPlanForUser(userIdRef.current));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseOrNull();

    const init = async () => {
      let userId: string | null = null;
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          userId = data.session?.user?.id ?? null;
        } catch {
          userId = null;
        }
      }
      if (cancelled) return;
      userIdRef.current = userId;
      recompute();
    };

    void init();

    const unsubscribers = [
      subscribeLearningPath(recompute),
      subscribeExamDate(recompute),
      subscribeDiagnostic(recompute),
    ];

    const onStorage = () => recompute();
    window.addEventListener(REVIEW_SCHEDULE_UPDATED_EVENT, onStorage);
    window.addEventListener(WEEKLY_PLAN_EVENT, onStorage);
    window.addEventListener("storage", onStorage);

    const authSubscription = supabase?.auth.onAuthStateChange(
      (_event, session) => {
        userIdRef.current = session?.user?.id ?? null;
        recompute();
      },
    ).data.subscription;

    return () => {
      cancelled = true;
      for (const unsubscribe of unsubscribers) unsubscribe();
      window.removeEventListener(REVIEW_SCHEDULE_UPDATED_EVENT, onStorage);
      window.removeEventListener(WEEKLY_PLAN_EVENT, onStorage);
      window.removeEventListener("storage", onStorage);
      authSubscription?.unsubscribe();
    };
  }, [recompute]);

  const toggleTask = useCallback(
    (taskId: string) => {
      if (!plan) return;
      toggleWeeklyPlanTask(plan.weekStart, taskId);
      recompute();
    },
    [plan, recompute],
  );

  return { plan, loading: plan === null, toggleTask };
}
