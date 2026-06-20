"use client";

import { CmsTaskCard } from "@/components/baza-zadan/CmsTaskCard";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import { arkuszMaturaBadge } from "@/lib/baza-zadan/cke/group-cms-tasks";
import { TYP_EGZAMINU_LABELS } from "@/lib/baza-zadan/dzialy";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type ArkuszCkeDetailProps = {
  tasks: ZadanieWithArkusz[];
};

export function ArkuszCkeDetail({ tasks }: ArkuszCkeDetailProps) {
  const sample = tasks[0];
  const arkusz = sample?.arkusz;

  if (!sample || !arkusz) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-20 text-center">
        <p className="text-xl font-black text-white">Nie znaleziono arkusza</p>
        <Link
          href="/arkusze"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-400"         >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do arkuszy CKE
        </Link>
      </div>
    );
  }

  const label = formatArkuszLabel(arkusz);
  const badge = arkuszMaturaBadge(sample);

  return (
    <div className="relative z-10 w-full py-6 sm:py-8">
      <Link
        href="/arkusze"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-orange-400"       >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Wszystkie arkusze
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        <h1 className="text-2xl font-black text-white sm:text-3xl">{label}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {badge || TYP_EGZAMINU_LABELS[arkusz.typ]} · {tasks.length} zadań
        </p>
      </motion.header>

      <div className="mt-8 space-y-5">
        {tasks.map((zadanie, index) => (
          <motion.div
            key={zadanie.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.35) }}
          >
            <CmsTaskCard zadanie={zadanie} context="arkusz" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
