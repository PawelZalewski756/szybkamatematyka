"use client";

import {
  formatHomeRankingScore,
  HOME_RANKING_LIMIT,
  HOME_RANKING_TABS,
  homeRankingEmptyCopy,
  homeRankingPodium,
  homeRankingSortLabel,
} from "@/lib/home/ranking-preview";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { setRuntimePublicConfig } from "@/lib/supabase/config";
import {
  fetchMyLeaderboardRank,
  fetchTopLeaderboard,
  type LeaderboardEntry,
  type LeaderboardTab,
  type MyLeaderboardRank,
} from "@/lib/supabase/leaderboard";
import { Crown, Loader2, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

async function ensureSupabaseConfig(): Promise<boolean> {
  if (isSupabaseConfigured()) return true;

  try {
    const response = await fetch("/api/runtime-config", { cache: "no-store" });
    if (!response.ok) return false;
    const config = (await response.json()) as {
      configured?: boolean;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      siteUrl?: string;
    };
    if (!config.configured || !config.supabaseUrl || !config.supabaseAnonKey) {
      return false;
    }
    setRuntimePublicConfig({
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      siteUrl: config.siteUrl,
    });
    return isSupabaseConfigured();
  } catch {
    return false;
  }
}

function initials(nick: string): string {
  const letter = nick.trim().charAt(0).toUpperCase();
  return letter || "?";
}

function PodiumCard({
  entry,
  tab,
}: {
  entry: LeaderboardEntry;
  tab: LeaderboardTab;
}) {
  const first = entry.rank === 1;
  return (
    <div className={`flex flex-col items-center ${first ? "-mt-3" : ""}`}>
      {first ? (
        <Crown className="mb-1 h-4 w-4 text-accent" aria-hidden />
      ) : (
        <Medal className="mb-1 h-3.5 w-3.5 text-muted" aria-hidden />
      )}
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 ${
          first
            ? "h-16 w-16 border-accent bg-accent text-on-accent"
            : "h-12 w-12 border-surface-border bg-surface text-foreground"
        }`}
      >
        {entry.avatarUrl ? (
          <Image
            src={entry.avatarUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        ) : (
          <span className={first ? "text-xl font-black" : "text-base font-black"}>
            {initials(entry.nick)}
          </span>
        )}
      </div>
      <p className="mt-2 max-w-full truncate text-xs font-bold text-foreground">
        {entry.nick}
      </p>
      <p className="text-[10px] text-muted">poz. {entry.level}</p>
      <p className="text-[10px] font-bold text-accent">
        {formatHomeRankingScore(tab, entry.xp)}
      </p>
    </div>
  );
}

export function HomeRankingPreview() {
  const [tab, setTab] = useState<LeaderboardTab>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyLeaderboardRank | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const current = ++requestId.current;

    void (async () => {
      await Promise.resolve();
      if (current !== requestId.current) return;

      const configured = await ensureSupabaseConfig();
      if (current !== requestId.current) return;
      if (!configured) {
        setUnavailable(true);
        setLoading(false);
        setEntries([]);
        setMyRank(null);
        setSignedIn(false);
        return;
      }

      setUnavailable(false);
      setError(null);

      try {
        const top = await fetchTopLeaderboard(HOME_RANKING_LIMIT, tab);
        if (current !== requestId.current) return;

        const supabase = getSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (current !== requestId.current) return;

        const userId = session?.user?.id ?? null;
        setSignedIn(Boolean(userId));
        setEntries(top);
        if (userId) {
          const mine = await fetchMyLeaderboardRank(userId, 20, tab);
          if (current !== requestId.current) return;
          setMyRank(mine);
        } else {
          setMyRank(null);
        }
      } catch {
        if (current !== requestId.current) return;
        setError("Nie udało się wczytać rankingu.");
        setEntries([]);
        setMyRank(null);
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    })();
  }, [tab]);

  const podium = homeRankingPodium(entries);
  const rest = entries.slice(3);
  const empty = homeRankingEmptyCopy(tab);

  return (
    <div className="card-raised p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" aria-hidden />
          <span className="text-sm font-extrabold text-foreground">
            Top {HOME_RANKING_LIMIT}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
          {homeRankingSortLabel(tab)}
        </span>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-1 rounded-full border border-surface-border bg-surface p-1"
        role="tablist"
        aria-label="Kategoria rankingu"
      >
        {HOME_RANKING_TABS.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                if (item.id === tab) return;
                setLoading(true);
                setError(null);
                setEntries([]);
                setMyRank(null);
                setTab(item.id);
              }}
              className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-bold transition ${
                selected
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 py-10 text-sm text-muted" aria-busy="true">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          Wczytywanie rankingu…
        </div>
      ) : unavailable ? (
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Ranking pojawi się, gdy połączenie z bazą będzie dostępne. Pełna lista
          jest na stronie rankingów.
        </p>
      ) : error ? (
        <p className="mt-6 text-sm font-semibold text-red-400" role="alert">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-6">
          <p className="text-sm leading-relaxed text-muted">{empty.title}</p>
          <Link
            href={empty.actionHref}
            className="mt-3 inline-flex text-sm font-bold text-accent hover:underline"
          >
            {empty.actionLabel}
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 items-end gap-2">
            {podium.map((entry, index) =>
              entry ? (
                <PodiumCard key={entry.id} entry={entry} tab={tab} />
              ) : (
                <div key={`empty-${index}`} />
              ),
            )}
          </div>

          {rest.length > 0 ? (
            <ul className="mt-5 divide-y divide-surface-border border-t border-surface-border">
              {rest.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 py-2.5 text-sm sm:gap-3"
                >
                  <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-muted">
                    {entry.rank}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-[10px] font-black text-foreground">
                    {entry.avatarUrl ? (
                      <Image
                        src={entry.avatarUrl}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 object-cover"
                        unoptimized
                      />
                    ) : (
                      initials(entry.nick)
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                    {entry.nick}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted sm:block">
                    poz. {entry.level}
                  </span>
                  <span className="w-20 shrink-0 text-right text-xs font-bold tabular-nums text-foreground">
                    {formatHomeRankingScore(tab, entry.xp)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      {!loading && !unavailable && !error ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-surface-border bg-background/60 px-3 py-2.5">
          {signedIn && myRank ? (
            <>
              <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                Twoje miejsce: #{myRank.rank} · {myRank.entry.nick}
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-accent">
                {formatHomeRankingScore(tab, myRank.entry.xp)}
              </span>
            </>
          ) : signedIn ? (
            <span className="text-xs font-semibold text-muted">
              Nie masz jeszcze punktów w tej kategorii.
            </span>
          ) : (
            <>
              <span className="text-xs font-semibold text-muted">
                Twoja pozycja
              </span>
              <Link
                href="/login"
                className="text-xs font-bold text-accent hover:underline"
              >
                Zaloguj się
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
