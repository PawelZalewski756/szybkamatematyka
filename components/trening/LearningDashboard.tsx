"use client";

import { useReview } from "@/components/powtorki/ReviewProvider";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  averageMasteryScore,
  masteryBand,
  masteryScore,
  type TopicMasteryRecord,
} from "@/lib/learning/mastery";
import {
  fetchRemoteMastery,
  loadLocalMastery,
  MASTERY_UPDATED_EVENT,
  mergeMastery,
} from "@/lib/learning/mastery-store";
import { recommendNextAction } from "@/lib/learning/recommend";
import { getSupabaseOrNull } from "@/lib/supabase";
import type { ExamWithProgress } from "@/lib/trening/progress";
import type { TreningExamKey } from "@/lib/trening/curriculum";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function LearningDashboard({
  examKey,
  exam,
  loading,
}: {
  examKey: TreningExamKey;
  exam: ExamWithProgress;
  loading: boolean;
}) {
  const { dueCount, ready } = useReview();
  const { schoolClass } = useLearningPath();
  const [mastery, setMastery] = useState<TopicMasteryRecord[]>([]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const local = loadLocalMastery(null);
      const supabase = getSupabaseOrNull();
      let uid: string | null = null;
      if (supabase) {
        try {
          const { data } = await supabase.auth.getUser();
          uid = data.user?.id ?? null;
        } catch {
          uid = null;
        }
      }
      const localForUser = loadLocalMastery(uid);
      let remote: TopicMasteryRecord[] = [];
      if (uid) {
        remote = await fetchRemoteMastery(uid);
      }
      if (!cancelled) {
        setMastery(mergeMastery([...local, ...localForUser], remote));
      }
    };

    const onUpdate = () => {
      void refresh();
    };
    void refresh();
    window.addEventListener(MASTERY_UPDATED_EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(MASTERY_UPDATED_EVENT, onUpdate);
    };
  }, []);

  const examMastery = useMemo(
    () => mastery.filter((row) => row.examType === exam.examType),
    [mastery, exam.examType],
  );

  const next = useMemo(
    () =>
      recommendNextAction({
        examKey,
        exam,
        mastery: examMastery,
        dueCount,
        schoolClass,
      }),
    [examKey, exam, examMastery, dueCount, schoolClass],
  );

  const overall = averageMasteryScore(examMastery);
  const weakCount = examMastery.filter(
    (row) => masteryBand(masteryScore(row), row.attempts) === "weak",
  ).length;

  if (loading || !ready) {
    return (
      <div className="mt-6 h-28 animate-pulse rounded-2xl border border-surface-border bg-surface" />
    );
  }

  return (
    <section
      aria-labelledby="learning-next-heading"
      className="mt-6 rounded-2xl border border-surface-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Co dalej
          </p>
          <h2
            id="learning-next-heading"
            className="mt-1 text-xl font-black text-foreground"
          >
            {next.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">{next.reason}</p>
          <Link
            href={next.href}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-foreground"
          >
            Przejdź
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-center sm:min-w-[240px]">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Opanowanie
            </dt>
            <dd className="mt-1 text-lg font-black tabular-nums text-foreground">
              {overall}%
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Powtórki
            </dt>
            <dd className="mt-1 text-lg font-black tabular-nums text-foreground">
              {dueCount}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Słabe tematy
            </dt>
            <dd className="mt-1 text-lg font-black tabular-nums text-foreground">
              {weakCount}
            </dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-xs text-muted">
        Opanowanie to skuteczność w tematach, nie punkty XP.
      </p>
    </section>
  );
}
