"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { motion } from "framer-motion";
import type { NextTopic } from "@/lib/trening/next-topic";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

type TopicVictoryScreenProps = {
  backHref?: string;
  backLabel?: string;
  nextTopic?: NextTopic | null;
};

export function TopicVictoryScreen({
  backHref = "/trening",
  backLabel = "Wróć do Drzewka Treningu",
  nextTopic = null,
}: TopicVictoryScreenProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <GamingBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 text-center"
      >
        <motion.div
          initial={{ rotate: -8, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-500/25 via-yellow-500/10 to-amber-600/5 p-6 shadow-[0_0_48px_rgba(251,191,36,0.35)] backdrop-blur-xl"
        >
          <Star
            className="h-20 w-20 fill-amber-300 text-amber-400 drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]"
            aria-hidden
          />
        </motion.div>

        <h2 className="mt-8 text-2xl font-black text-amber-200 sm:text-4xl">
          Temat ukończony
        </h2>
        <p className="mt-3 max-w-md text-sm font-semibold text-foreground sm:text-base">
          Wszystkie zadania z tego tematu są rozwiązane.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3">
          {nextTopic && (
            <Link
              href={nextTopic.href}
              data-testid="victory-next-topic"
              className="inline-flex flex-col items-center gap-0.5 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/90 via-yellow-500/80 to-amber-500/90 px-7 py-3.5 text-zinc-950 shadow-[0_0_32px_rgba(251,191,36,0.25)] transition hover:scale-[1.02]"
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
                : "inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/90 via-yellow-500/80 to-amber-500/90 px-7 py-3.5 text-sm font-black text-zinc-950"
            }
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
