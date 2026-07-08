"use client";

import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import { isSchemaMissingError } from "@/lib/supabase/errors";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type StatusState = {
  minigry: number;
  zadania: number;
  arkusze: number;
  cmsExtra: number | null;
  loading: boolean;
};

type PlatformStatusProps = {
  /** Kompaktowy pasek pod hero zamiast trzech kart. */
  variant?: "cards" | "inline";
};

export function PlatformStatus({ variant = "cards" }: PlatformStatusProps) {
  const [status, setStatus] = useState<StatusState>({
    minigry: MINIGAME_REGISTRY.length,
    zadania: getAllTasks().length,
    arkusze: EXAM_SHEETS.length,
    cmsExtra: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const base = {
        minigry: MINIGAME_REGISTRY.length,
        zadania: getAllTasks().length,
        arkusze: EXAM_SHEETS.length,
        cmsExtra: null as number | null,
        loading: false,
      };

      if (!isSupabaseConfigured()) {
        if (!cancelled) setStatus(base);
        return;
      }

      const { data, error } = await fetchZadaniaSafe();
      if (cancelled) return;

      setStatus({
        ...base,
        cmsExtra: error && !isSchemaMissingError(error) ? null : data.length,
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const zadaniaLabel = status.loading
    ? "…"
    : status.cmsExtra != null && status.cmsExtra > 0
      ? `${status.zadania}+`
      : String(status.zadania);

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm xl:justify-start">
        {[
          { label: "Minigry", value: String(status.minigry) },
          { label: "Zadania", value: zadaniaLabel },
          { label: "Arkusze", value: String(status.arkusze) },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.06 }}
            className="flex items-baseline gap-2"
          >
            <span className="font-bold tabular-nums text-foreground">{item.value}</span>
            <span className="text-muted">{item.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[
        { label: "Minigry", value: String(status.minigry), sub: "gier treningowych" },
        { label: "Zadania", value: zadaniaLabel, sub: "w bazie" },
        { label: "Arkusze", value: String(status.arkusze), sub: "CKE w katalogu" },
      ].map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="home-tile-muted p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{item.value}</p>
          <p className="mt-0.5 text-xs text-muted">{item.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
