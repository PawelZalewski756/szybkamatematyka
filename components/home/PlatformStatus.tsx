"use client";

import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import { isSchemaMissingError } from "@/lib/supabase/errors";
import { motion } from "framer-motion";
import { Database, Gamepad2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type StatusState = {
  minigry: number;
  zadania: number;
  arkusze: number;
  cmsExtra: number | null;
  dbMessage: string | null;
  loading: boolean;
};

export function PlatformStatus() {
  const [status, setStatus] = useState<StatusState>({
    minigry: MINIGAME_REGISTRY.length,
    zadania: getAllTasks().length,
    arkusze: EXAM_SHEETS.length,
    cmsExtra: null,
    dbMessage: null,
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
        dbMessage: null as string | null,
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
        cmsExtra: error ? null : data.length,
        dbMessage:
          error && !isSchemaMissingError(error) ? error : null,
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    {
      icon: Sparkles,
      label: "Status",
      value: "Wersja beta",
      sub: "Rozwijamy platformę na żywo",
    },
    {
      icon: Gamepad2,
      label: "Minigry",
      value: String(status.minigry),
      sub: "gier treningowych",
    },
    {
      icon: Database,
      label: "Zadania",
      value: status.loading ? "…" : String(status.zadania),
      sub:
        status.cmsExtra != null && status.cmsExtra > 0
          ? `w aplikacji + ${status.cmsExtra} w Supabase`
          : `${status.arkusze} arkuszy treningowych`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <Icon size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{item.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
