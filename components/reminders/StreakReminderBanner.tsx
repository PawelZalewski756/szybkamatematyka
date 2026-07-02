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
      className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[95] mx-auto max-w-lg rounded-2xl border border-orange-500/50 bg-gradient-to-r from-orange-950/95 to-zinc-900/95 p-4 shadow-xl shadow-orange-900/40 backdrop-blur-xl sm:left-auto sm:right-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/25">
          <Flame className="h-4 w-4 text-orange-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-orange-200">
            Nie strać serii {streak} {streak === 1 ? "dnia" : "dni"}!
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">{body}</p>
          <Link
            href="/minigry"
            className="mt-2 inline-flex text-xs font-bold text-orange-400 transition hover:text-orange-200"
          >
            Ćwicz teraz →
          </Link>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-300"
          aria-label="Zamknij przypomnienie"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
