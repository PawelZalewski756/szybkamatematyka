"use client";

import { ReviewDashboard } from "@/components/powtorki/ReviewDashboard";
import { useReview } from "@/components/powtorki/ReviewProvider";
import { ReviewSession } from "@/components/powtorki/ReviewSession";
import { ReviewSummary } from "@/components/powtorki/ReviewSummary";
import type { ReviewSessionSummary } from "@/lib/powtorki/types";
import { trackProductEvent } from "@/lib/metrics/product-events";
import { useCallback, useState } from "react";

type Phase = "dashboard" | "session" | "summary";

export function PowtorkiView() {
  const { dueItems } = useReview();
  const [phase, setPhase] = useState<Phase>("dashboard");
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [summary, setSummary] = useState<ReviewSessionSummary | null>(null);

  const startSession = useCallback(() => {
    const ids = dueItems.map((item) => item.taskId);
    if (ids.length === 0) return;
    setSessionIds(ids);
    setSummary(null);
    setPhase("session");
    trackProductEvent("review_start");
  }, [dueItems]);

  const handleComplete = useCallback((result: ReviewSessionSummary) => {
    setSummary(result);
    setPhase("summary");
  }, []);

  const backToDashboard = useCallback(() => {
    setPhase("dashboard");
    setSessionIds([]);
    setSummary(null);
  }, []);

  if (phase === "session") {
    return (
      <ReviewSession
        taskIds={sessionIds}
        onComplete={handleComplete}
        onExit={backToDashboard}
      />
    );
  }

  if (phase === "summary" && summary) {
    return (
      <ReviewSummary
        summary={summary}
        remainingDue={dueItems.length}
        onRestart={startSession}
        onClose={backToDashboard}
      />
    );
  }

  return <ReviewDashboard onStart={startSession} />;
}
