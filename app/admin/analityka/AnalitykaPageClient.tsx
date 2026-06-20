"use client";

import { BarList } from "@/components/admin/BarList";
import { MetricCard } from "@/components/admin/MetricCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorView } from "@/components/feedback/ErrorView";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatCompactXp } from "@/lib/format/compact-number";
import {
  fetchAdminAnalytics,
  type AdminAnalytics,
} from "@/lib/supabase/admin-analytics";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  FileStack,
  Flame,
  Gamepad2,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const PL_NUMBER = new Intl.NumberFormat("pl-PL");

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: AdminAnalytics };

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-7">
      <h2 className="flex items-center gap-2 text-lg font-black text-white">
        <Icon size={18} className="text-fuchsia-300" />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AnalitykaPageClient() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchAdminAnalytics();
      setState({ status: "ready", data });
    } catch (e) {
      console.error("[szybka-matma] fetchAdminAnalytics:", e);
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (state.status === "loading") {
    return <PageLoader label="Liczenie statystyk platformy…" />;
  }

  if (state.status === "error") {
    return (
      <ErrorView
        title="Nie udało się wczytać analityki"
        description="Sprawdź połączenie z Supabase i czy uruchomiono migracje profili. Spróbuj ponownie."
        reset={() => void load()}
      />
    );
  }

  const { players, content, notes, generatedAt } = state.data;
  const hasPlayers = players.totalPlayers > 0;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/admin"
        className="text-sm font-semibold text-zinc-500 hover:text-cyan-400"
      >
        ← Panel administratora
      </Link>

      <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
        Analityka{" "}
        <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
          platformy
        </span>
      </h1>
      <p className="mt-2 text-zinc-400">
        Zagregowane statystyki graczy i zawartości bazy. Dane liczone na żywo z
        Supabase w granicach uprawnień odczytu (RLS).
      </p>

      {/* Gracze */}
      <Section icon={Users} title="Gracze">
        {hasPlayers ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <MetricCard
              icon={Users}
              label="Gracze"
              value={PL_NUMBER.format(players.totalPlayers)}
              sub="profili łącznie"
              accent="text-cyan-400"
            />
            <MetricCard
              icon={Activity}
              label="Aktywni 7 dni"
              value={PL_NUMBER.format(players.active7d)}
              sub="po ostatniej grze"
              accent="text-emerald-400"
            />
            <MetricCard
              icon={Activity}
              label="Aktywni 30 dni"
              value={PL_NUMBER.format(players.active30d)}
              sub="po ostatniej grze"
              accent="text-emerald-400"
            />
            <MetricCard
              icon={UserPlus}
              label="Nowi 30 dni"
              value={PL_NUMBER.format(players.new30d)}
              sub={`w tym ${PL_NUMBER.format(players.new7d)} w 7 dni`}
              accent="text-fuchsia-400"
            />
            <MetricCard
              icon={TrendingUp}
              label="Suma XP"
              value={formatCompactXp(players.totalXp)}
              sub={`średnio ${PL_NUMBER.format(players.avgXp)} / gracza`}
              accent="text-violet-400"
            />
            <MetricCard
              icon={Sparkles}
              label="Rekord XP"
              value={formatCompactXp(players.maxXp)}
              sub="najlepszy gracz"
              accent="text-amber-400"
            />
            <MetricCard
              icon={Gamepad2}
              label="XP z minigier"
              value={formatCompactXp(players.totalMinigryXp)}
              sub="suma z minigier"
              accent="text-pink-400"
            />
            <MetricCard
              icon={Flame}
              label="Najdłuższa seria"
              value={`${PL_NUMBER.format(players.maxStreak)} dni`}
              sub={`${PL_NUMBER.format(players.streak7Plus)} graczy ≥ 7 dni`}
              accent="text-orange-400"
            />
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Brak graczy do analizy"
            description="Gdy pojawią się pierwsze profile, zobaczysz tu statystyki aktywności i XP."
          />
        )}
      </Section>

      {/* Rozkład poziomów */}
      {hasPlayers && (
        <Section icon={BarChart3} title="Rozkład poziomów">
          <BarList
            items={players.levelDistribution.map((bucket) => ({
              label: `Poziom ${bucket.level}`,
              count: bucket.count,
            }))}
            gradient="from-violet-500 to-fuchsia-500"
            emptyLabel="Brak danych o poziomach"
          />
          <p className="mt-3 text-xs text-zinc-500">
            Poziom liczony z całkowitego XP (500 XP = 1 poziom). Średnia seria
            aktywności: {PL_NUMBER.format(players.avgStreak)} dni.
          </p>
        </Section>
      )}

      {/* Zawartość bazy */}
      <Section icon={Database} title="Zawartość bazy">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            icon={FileStack}
            label="Arkusze"
            value={content.arkusze != null ? PL_NUMBER.format(content.arkusze) : "—"}
            sub="arkuszy egzaminacyjnych"
            accent="text-cyan-400"
          />
          <MetricCard
            icon={Layers}
            label="Zadania (arkusze)"
            value={content.zadania != null ? PL_NUMBER.format(content.zadania) : "—"}
            sub="zadań z rozwiązaniami"
            accent="text-fuchsia-400"
          />
          <MetricCard
            icon={Gamepad2}
            label="Zadania treningowe"
            value={content.tasks != null ? PL_NUMBER.format(content.tasks) : "—"}
            sub="w arenie treningowej"
            accent="text-violet-400"
          />
          <MetricCard
            icon={BookOpen}
            label="Materiały"
            value={
              content.materials != null
                ? PL_NUMBER.format(content.materials)
                : "—"
            }
            sub="materiałów teoretycznych"
            accent="text-emerald-400"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
              Zadania wg działu
            </h3>
            <div className="mt-3">
              <BarList
                items={content.zadaniaByDzial}
                gradient="from-fuchsia-500 to-pink-500"
                emptyLabel="Brak zadań w bazie arkuszy"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Zadania treningowe wg egzaminu
              </h3>
              <div className="mt-3">
                <BarList
                  items={content.tasksByExam}
                  gradient="from-violet-500 to-cyan-500"
                  emptyLabel="Brak zadań treningowych"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Materiały wg egzaminu
              </h3>
              <div className="mt-3">
                <BarList
                  items={content.materialsByExam}
                  gradient="from-emerald-500 to-cyan-500"
                  emptyLabel="Brak materiałów"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Uwagi metodologiczne */}
      {notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-300">
            <Info size={16} className="text-zinc-400" />
            Czego nie liczymy i dlaczego
          </h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-500">
            {notes.map((note, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-zinc-600">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <p className="mt-6 text-center text-xs text-zinc-600">
        Wygenerowano:{" "}
        {new Date(generatedAt).toLocaleString("pl-PL")}
      </p>
    </div>
  );
}
