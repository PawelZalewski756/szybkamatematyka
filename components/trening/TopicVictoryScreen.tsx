"use client";

import type { NextTopic } from "@/lib/trening/next-topic";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type TopicVictoryScreenProps = {
  backHref?: string;
  backLabel?: string;
  nextTopic?: NextTopic | null;
  isGuest?: boolean;
};

export function TopicVictoryScreen({
  backHref = "/trening",
  backLabel = "Wróć do listy tematów",
  nextTopic = null,
  isGuest = false,
}: TopicVictoryScreenProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-success" aria-hidden />
      <h2 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">
        Temat ukończony
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted sm:text-base">
        Wszystkie zadania z tego tematu są rozwiązane.
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3">
        {nextTopic && (
          <Link
            href={nextTopic.href}
            data-testid="victory-next-topic"
            className="btn-primary flex flex-col items-center gap-0.5 px-7 py-3.5"
          >
            <span className="inline-flex items-center gap-2 text-sm font-black">
              Następny temat
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-xs font-semibold">{nextTopic.name}</span>
          </Link>
        )}
        <Link
          href={backHref}
          className={
            nextTopic
              ? "inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-border px-7 py-3 text-sm font-bold text-foreground transition hover:bg-foreground/5"
              : "btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm"
          }
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      </div>

      {isGuest && (
        <p className="mt-8 max-w-sm text-sm text-muted">
          Chcesz zapisać postęp?{" "}
          <Link href="/login" className="font-semibold text-accent underline">
            Załóż darmowe konto
          </Link>
          , a wrócisz dokładnie tam, gdzie skończyłeś.
        </p>
      )}
    </div>
  );
}
