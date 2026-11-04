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
    <section className="mt-8 rounded-3xl border border-surface-border bg-surface/80 p-6 sm:p-7">
      <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
        <Icon size={18} className="text-accent" />
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
        className="text-sm font-semibold text-muted hover:text-accent"       >
        ← Panel administratora
      </Link>

      <h1 className="mt-4 text-3xl font-black text-foreground sm:text-4xl">
        Analityka{" "}
        <span className="text-gradient-brand">
          platformy
        </span>
      </h1>
      <p className="mt-2 text-muted">
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
              accent="text-accent"             />
            <MetricCard
              icon={Activity}
              label="Aktywni 7 dni"
              value={PL_NUMBER.format(players.active7d)}
              sub="po ostatniej grze"
              accent="text-success"
            />
            <MetricCard
              icon={Activity}
              label="Aktywni 30 dni"
              value={PL_NUMBER.format(players.active30d)}
              sub="po ostatniej grze"
              accent="text-success"
            />
            <MetricCard
              icon={UserPlus}
              label="Nowi 30 dni"
              value={PL_NUMBER.format(players.new30d)}
              sub={`w tym ${PL_NUMBER.format(players.new7d)} w 7 dni`}
              accent="text-accent"
            />
            <MetricCard
              icon={TrendingUp}
              label="Suma XP"
              value={formatCompactXp(players.totalXp)}
              sub={`średnio ${PL_NUMBER.format(players.avgXp)} / gracza`}
              accent="text-accent"
            />
            <MetricCard
              icon={TrendingUp}
              label="Rekord XP"
              value={formatCompactXp(players.maxXp)}
              sub="najlepszy gracz"
              accent="text-accent"
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
              accent="text-accent"
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
            gradient="from-accent to-accent"
            emptyLabel="Brak danych o poziomach"
          />
          <p className="mt-3 text-xs text-muted">
            Poziom z krzywej XP (100 XP → poz. 2, potem ×1,32 za każdy awans).
            Średnia seria aktywności: {PL_NUMBER.format(players.avgStreak)}{" "}
            dni.
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
            accent="text-accent"           />
          <MetricCard
            icon={Layers}
            label="Zadania (arkusze)"
            value={content.zadania != null ? PL_NUMBER.format(content.zadania) : "—"}
            sub="zadań z rozwiązaniami"
            accent="text-accent"
          />
          <MetricCard
            icon={Gamepad2}
            label="Zadania treningowe"
            value={content.tasks != null ? PL_NUMBER.format(content.tasks) : "—"}
            sub="w arenie treningowej"
            accent="text-accent"
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
            accent="text-success"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
              Zadania wg działu
            </h3>
            <div className="mt-3">
              <BarList
                items={content.zadaniaByDzial}
                gradient="from-accent to-accent-soft"
                emptyLabel="Brak zadań w bazie arkuszy"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
                Zadania treningowe wg egzaminu
              </h3>
              <div className="mt-3">
                <BarList
                  items={content.tasksByExam}
                  gradient="from-accent to-accent-strong"
                  emptyLabel="Brak zadań treningowych"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
                Materiały wg egzaminu
              </h3>
              <div className="mt-3">
                <BarList
                  items={content.materialsByExam}
                  gradient="from-success to-accent"
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
          className="mt-8 rounded-2xl border border-surface-border bg-foreground/5 p-5"
        >
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Info size={16} className="text-muted" />
            Czego nie liczymy i dlaczego
          </h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
            {notes.map((note, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Wygenerowano:{" "}
        {new Date(generatedAt).toLocaleString("pl-PL")}
      </p>
    </div>
  );
}
