"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { LeaderboardList } from "@/components/rankingi/LeaderboardList";
import { LeaderboardPodium } from "@/components/rankingi/LeaderboardPodium";
import { MyRankBar } from "@/components/rankingi/MyRankBar";
import {
  fetchMyLeaderboardRank,
  fetchTopLeaderboard,
  type LeaderboardEntry,
  type LeaderboardTab,
  type MyLeaderboardRank,
} from "@/lib/supabase/leaderboard";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { EmptyState } from "@/components/feedback/EmptyState";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const TOP_LIMIT = 20;

export default function RankingiPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("all");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyLeaderboardRank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(
    async (tab: LeaderboardTab, options?: { quiet?: boolean }) => {
      if (!isSupabaseConfigured()) {
        setConfigError(true);
        setLoading(false);
        return;
      }

      setConfigError(false);
      if (!options?.quiet) setLoading(true);
      setError(null);

      try {
        const top = await fetchTopLeaderboard(TOP_LIMIT, tab);
        setEntries(top);

        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const mine = await fetchMyLeaderboardRank(user.id, TOP_LIMIT, tab);
          setMyRank(mine);
        } else {
          setMyRank(null);
        }
      } catch {
        setError("Nie udało się załadować rankingu.");
        setEntries([]);
        setMyRank(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLeaderboard(activeTab);
  }, [activeTab, loadLeaderboard]);

  const topThree = useMemo(() => entries.slice(0, 3), [entries]);
  const rest = useMemo(() => entries.slice(3), [entries]);

  const showStickyBar =
    myRank !== null && !myRank.inTop20 && entries.length > 0;

  const sortLabel =
    activeTab === "minigry"
      ? "XP z minigier"
      : activeTab === "pojedynki"
        ? "ratingu pojedynków"
        : "łączne XP";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />

      <div
        className={`relative z-10 mx-auto flex w-full max-w-[1920px] flex-1 flex-col py-8 sm:py-10 ${showStickyBar ? "pb-28" : "pb-8"}`}
      >
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-fuchsia-500/20 ring-1 ring-amber-400/30">
            <Trophy className="h-6 w-6 text-amber-300" aria-hidden />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Tablica wyników
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Top {TOP_LIMIT} graczy · sortowanie po {sortLabel}
          </p>

          <div
            role="tablist"
            aria-label="Filtr rankingu"
            className="mx-auto mt-5 flex w-full max-w-xs rounded-2xl border border-white/15 bg-white/[0.06] p-1 backdrop-blur-xl"
          >
            {(
              [
                { id: "all" as const, label: "Wszyscy" },
                { id: "minigry" as const, label: "Minigry" },
                { id: "pojedynki" as const, label: "Pojedynki" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/25 to-fuchsia-500/20 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          {!configError && (
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                void loadLeaderboard(activeTab, { quiet: true }).finally(() =>
                  setRefreshing(false),
                );
              }}
              disabled={loading || refreshing}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                aria-hidden
              />
              Odśwież ranking
            </button>
          )}
        </motion.header>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            <p className="text-sm font-semibold text-zinc-400">
              Ładowanie rankingu…
            </p>
          </div>
        ) : configError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-bold text-zinc-300">
              Brak połączenia z Supabase
            </p>
            <Link href="/" className="text-sm font-semibold text-cyan-400">
              ← Strona główna
            </Link>
          </div>
        ) : error ? (
          <p className="py-16 text-center text-sm font-semibold text-red-400">
            {error}
          </p>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title={
              activeTab === "minigry"
                ? "Ranking minigier jest pusty"
                : activeTab === "pojedynki"
                  ? "Ranking pojedynków jest pusty"
                  : "Ranking jest pusty"
            }
            description={
              activeTab === "minigry"
                ? "Zagraj w minigry, aby zdobyć XP i jako pierwszy wskoczyć na listę!"
                : activeTab === "pojedynki"
                  ? "Rozegraj pojedynek 1v1, aby zdobyć rating i wejść na listę!"
                  : "Zagraj w minigrach lub arenie treningowej, aby zdobyć XP i wejść do rankingu!"
            }
            action={
              activeTab === "pojedynki"
                ? { href: "/pojedynki", label: "Zagraj w pojedynki" }
                : { href: "/minigry", label: "Zagraj w minigry" }
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex flex-1 flex-col"
          >
            <section aria-label="Podium top 3">
              <LeaderboardPodium topThree={topThree} />
            </section>

            <section className="mt-8 flex min-h-0 flex-1 flex-col" aria-label="Miejsca 4–20">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Miejsca 4–{TOP_LIMIT}
              </h2>
              <div className="max-h-[min(50vh,28rem)] overflow-y-auto overscroll-contain pr-1 scrollbar-thin">
                <LeaderboardList entries={rest} />
              </div>
            </section>
          </motion.div>
        )}

        {!loading && !myRank && !configError && (
          <p className="mt-6 text-center text-xs text-zinc-500">
            <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Zaloguj się
            </Link>
            , aby zobaczyć swoją pozycję na dole ekranu.
          </p>
        )}
      </div>

      {showStickyBar && myRank && <MyRankBar myRank={myRank} />}
    </div>
  );
}
