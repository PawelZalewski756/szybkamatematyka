"use client";

import { streakReminderMessage } from "@/lib/reminders/streak-reminder";
import { Flame, X } from "lucide-react";
import Link from "next/link";

type StreakReminderBannerProps = {
  streak: number;
  onDismiss: () => void;
};

export function StreakReminderBanner({
  streak,
  onDismiss,
}: StreakReminderBannerProps) {
  const { body } = streakReminderMessage(streak);

  return (
    <div
      role="alert"
      className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[95] mx-auto max-w-lg rounded-2xl border border-accent/40 bg-surface/95 p-4 shadow-xl shadow-accent/10 backdrop-blur-xl sm:left-auto sm:right-6"
    >
      <div className="flex items-start gap-3">
        <div className="icon-chip flex h-9 w-9 shrink-0 rounded-xl">
          <Flame className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-accent">
            Nie strać serii {streak} {streak === 1 ? "dnia" : "dni"}!
          </p>
          <p className="mt-0.5 text-xs text-muted">{body}</p>
          <Link
            href="/minigry"
            className="mt-2 inline-flex text-xs font-bold text-accent transition hover:text-accent-strong"
          >
            Ćwicz teraz →
          </Link>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-muted transition hover:bg-surface-hover hover:text-foreground"
          aria-label="Zamknij przypomnienie"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
