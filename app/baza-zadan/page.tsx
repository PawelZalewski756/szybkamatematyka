"use client";

import { BazaZadanCatalog } from "@/components/baza-zadan/BazaZadanCatalog";
import { DatabaseSetupCard } from "@/components/baza-zadan/DatabaseSetupCard";
import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import {
  formatSupabaseErrorForUser,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BazaZadanPage() {
  const [cmsTasks, setCmsTasks] = useState<ZadanieWithArkusz[]>([]);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [cmsNote, setCmsNote] = useState<string | null>(null);

  const builtInCount = getAllTasks().length;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    void (async () => {
      const { data, error } = await fetchZadaniaSafe();
      if (error) {
        if (isSchemaMissingError(error)) {
          setSchemaMissing(true);
        } else {
          setCmsNote(formatSupabaseErrorForUser(error));
        }
        return;
      }
      setCmsTasks(data);
    })();
  }, []);

  return (
    <div className="relative bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-[110px]" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Baza{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Zadań
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            <strong className="text-white">{builtInCount}</strong> zadań treningowych
            oraz arkusze maturalne CKE w Supabase — Matura i Egzamin 8-klasisty.
            Filtruj, rozwiązuj i śledź postęp.
          </p>
        </motion.div>

        {schemaMissing && (
          <details className="mt-6 group">
            <summary className="cursor-pointer list-none rounded-2xl border border-zinc-700/50 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="font-semibold text-zinc-300">
                Opcjonalnie: własne arkusze w Supabase
              </span>{" "}
              (panel /admin — wymaga migracji SQL)
            </summary>
            <div className="mt-3">
              <DatabaseSetupCard />
            </div>
          </details>
        )}

        {cmsNote && (
          <p className="mt-4 text-sm text-amber-200/90">{cmsNote}</p>
        )}

        <div className="mt-10 w-full">
          <BazaZadanCatalog cmsTasks={cmsTasks} />
        </div>
      </div>
    </div>
  );
}
