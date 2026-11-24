"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { loadDiagnosticResult } from "@/lib/diagnostyka";
import { daysUntilExam, loadExamDate } from "@/lib/exam-date";
import {
  signedInHeadline,
  signedInPrimaryAction,
  signedInSummary,
  type SignedInHomeInput,
} from "@/lib/home/signed-in-home";
import { isDue } from "@/lib/powtorki/scheduler";
import { loadSchedule } from "@/lib/powtorki/storage";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { getSupabaseOrNull } from "@/lib/supabase";
import {
  fetchProfile,
  profileFromUserFallback,
} from "@/lib/supabase/profiles";
import { buildTopicHref, topicDisplayName } from "@/lib/trening/slugs";
import { loadRecentTrainingTopic } from "@/lib/trening/recent-topic";

type HomeHeroProps = {
  taskCount: number;
  sheetCount: number;
};

function GuestHero({ taskCount, sheetCount }: HomeHeroProps) {
  return (
    <div>
      <h1 className="max-w-2xl text-[clamp(2.65rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.055em]">
        <span className="text-foreground">Przygotuj się do</span>
        <br />
        <span className="text-accent">egzaminu z matematyki.</span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        Teoria, zadania i arkusze CKE w jednym miejscu. Zacznij od jednego
        zadania - konto założysz w 30 sekund.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href="/login?mode=signup"
          className="btn-chunky px-7 py-4 text-base sm:px-8"
        >
          Załóż darmowe konto
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          href="#szybka-proba"
          className="rounded-xl border border-surface-border bg-surface px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
        >
          Wypróbuj bez konta
        </Link>
        <Link
          href="/login"
          className="text-sm font-bold text-muted underline decoration-surface-border underline-offset-4 transition hover:text-foreground"
        >
          Mam już konto
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-accent" aria-hidden />0 zł na start
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-accent" aria-hidden />
          {taskCount}+ zadań
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-accent" aria-hidden />
          {sheetCount} arkuszy CKE
        </span>
      </div>
    </div>
  );
}

function MemberHero({
  input,
  isPro,
}: {
  input: SignedInHomeInput;
  isPro: boolean;
}) {
  const headline = signedInHeadline(input);
  const primary = signedInPrimaryAction(input);

  return (
    <div>
      <p className="text-overline">TWOJE DZIŚ</p>
      <h1 className="mt-3 max-w-2xl text-[clamp(2.4rem,5.6vw,4.6rem)] font-extrabold leading-[0.96] tracking-[-0.05em]">
        <span className="text-foreground">{headline.greeting}</span>
        <br />
        <span className="text-accent">{headline.accent}</span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        {signedInSummary(input)}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href={primary.href} className="btn-chunky px-7 py-4 text-base sm:px-8">
          {primary.label}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          href="/powtorki"
          className="rounded-xl border border-surface-border bg-surface px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
        >
          Powtórki
          {input.dueReviews > 0 ? ` · ${input.dueReviews}` : ""}
        </Link>
        <Link
          href="/wyzwania"
          className="text-sm font-bold text-foreground underline decoration-surface-border underline-offset-4 transition hover:text-accent hover:decoration-accent"
        >
          Wyzwanie dnia
        </Link>
        <Link
          href="/trening/arkusze"
          className="text-sm font-bold text-muted underline decoration-surface-border underline-offset-4 transition hover:text-foreground"
        >
          Arkusze CKE
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-accent" aria-hidden />
          Poziom {input.level}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-accent" aria-hidden />
          Seria {input.streak} {input.streak === 1 ? "dzień" : "dni"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-accent" aria-hidden />
          {isPro ? "Masz Pro" : "Konto darmowe"}
        </span>
      </div>
    </div>
  );
}

async function loadSignedInHome(userId: string): Promise<SignedInHomeInput | null> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user || user.id !== userId) return null;

  const profile =
    (await fetchProfile(user.id, user).catch(() => null)) ??
    profileFromUserFallback(user);
  const dueReviews = Object.values(loadSchedule(user.id)).filter((item) =>
    isDue(item),
  ).length;
  const examDate = loadExamDate();
  const recent = loadRecentTrainingTopic(user.id);

  return {
    nick: profile.nick,
    level: profile.level,
    streak: profile.streak,
    dueReviews,
    daysUntilExam: examDate ? daysUntilExam(examDate) : null,
    continueHref: recent
      ? buildTopicHref(recent.examKey, recent.category, recent.topic)
      : null,
    continueTitle: recent
      ? topicDisplayName(recent.examKey, recent.category, recent.topic)
      : null,
    hasDiagnostic: loadDiagnosticResult() !== null,
  };
}

export function HomeHero({ taskCount, sheetCount }: HomeHeroProps) {
  const { isLoggedIn, isPro, loading } = useSubscription();
  const [today, setToday] = useState<SignedInHomeInput | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!isLoggedIn) {
        setToday(null);
        return;
      }

      const supabase = getSupabaseOrNull();
      const userId = supabase
        ? (await supabase.auth.getSession()).data.session?.user?.id
        : null;
      if (!userId || cancelled) return;

      const next = await loadSignedInHome(userId);
      if (!cancelled) setToday(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!loading && isLoggedIn && today) {
    return <MemberHero input={today} isPro={isPro} />;
  }

  return <GuestHero taskCount={taskCount} sheetCount={sheetCount} />;
}
