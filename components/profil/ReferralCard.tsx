"use client";

import {
  referralProgress,
  type ReferralStats,
} from "@/lib/referral/progress";
import { getSupabase } from "@/lib/supabase";
import { Check, Copy, Gift, Users } from "lucide-react";
import { useEffect, useState } from "react";

type ReferralStatsRow = {
  referral_code: string;
  pending_count: number;
  qualified_count: number;
  rewarded_count: number;
  referral_rewarded_at: string | null;
  pro_until: string | null;
  pro_source: string | null;
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Karta programu poleceń w profilu. Pokazuje tylko liczniki - bez adresów
 * e-mail zaproszonych osób (RODO).
 */
export function ReferralCard() {
  const [row, setRow] = useState<ReferralStatsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.rpc("get_my_referral_stats");
        if (cancelled) return;
        if (error) {
          setHidden(true);
          return;
        }
        const first = (Array.isArray(data) ? data[0] : data) as
          | ReferralStatsRow
          | undefined;
        setRow(first ?? null);
      } catch {
        if (!cancelled) setHidden(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="mt-8 h-28 animate-pulse rounded-2xl bg-surface" />;
  }
  if (hidden || !row?.referral_code) return null;

  const stats: ReferralStats = {
    pending: Number(row.pending_count) || 0,
    qualified: Number(row.qualified_count) || 0,
    rewarded: Number(row.rewarded_count) || 0,
    rewardedAt: row.referral_rewarded_at,
  };
  const progress = referralProgress(stats);
  const origin =
    typeof window === "undefined" ? "" : window.location.origin;
  const link = `${origin}/login?ref=${row.referral_code}`;
  const proUntil = formatDate(row.pro_until);

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Skopiuj link polecający:", link);
    }
  };

  return (
    <section
      aria-labelledby="referral-heading"
      className="mt-8 rounded-2xl border border-accent/30 bg-surface p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-overline text-accent">Program poleceń</p>
          <h2
            id="referral-heading"
            className="mt-1 text-lg font-extrabold text-foreground"
          >
            Zaproś 2 znajomych
          </h2>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Users className="h-5 w-5" aria-hidden />
        </span>
      </div>

      {progress.rewardGranted ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
            <Check className="h-3.5 w-3.5" aria-hidden />
            Nagroda odebrana
          </span>
          <p className="text-sm text-muted">
            {proUntil
              ? `Pro z poleceń aktywne do ${proUntil}.`
              : "Pro z poleceń zostało wykorzystane."}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            Dostaniesz 30 dni Pro, gdy 2 zaproszone osoby potwierdzą e-mail,
            rozwiążą po 3 zadania i minie 7 dni od rejestracji.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="referral-link">
              Twój link polecający
            </label>
            <input
              id="referral-link"
              readOnly
              value={link}
              onFocus={(event) => event.currentTarget.select()}
              className="input-field min-w-0 flex-1 px-3 py-2 text-xs text-foreground"
            />
            <button
              type="button"
              onClick={() => void copyLink()}
              className="btn-chunky shrink-0 px-4 py-2 text-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  Skopiowano
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  Kopiuj link
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover"
              role="progressbar"
              aria-label={`Zakwalifikowani znajomi: ${progress.counted} z ${progress.target}`}
              aria-valuemin={0}
              aria-valuemax={progress.target}
              aria-valuenow={progress.counted}
            >
              <div
                className="progress-accent"
                style={{
                  width: `${(progress.counted / progress.target) * 100}%`,
                }}
              />
            </div>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {progress.counted}/{progress.target}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              Zakwalifikowani:{" "}
              <strong className="text-foreground">{progress.counted}</strong>
            </span>
            {stats.pending > 0 ? (
              <span>
                Oczekuje na aktywność:{" "}
                <strong className="text-foreground">{stats.pending}</strong>
              </span>
            ) : null}
            {progress.remaining === 0 ? (
              <span>Nagroda czeka na zakończenie obecnego Pro.</span>
            ) : null}
          </div>
        </>
      )}

      {!progress.rewardGranted ? (
        <ul className="mt-4 grid gap-1.5 text-xs text-muted sm:grid-cols-3">
          <li className="flex gap-1.5">
            <span className="font-bold text-accent">1.</span> Znajomy klika link
            i zakłada konto.
          </li>
          <li className="flex gap-1.5">
            <span className="font-bold text-accent">2.</span> Potwierdza e-mail i
            rozwiązuje 3 zadania.
          </li>
          <li className="flex gap-1.5">
            <span className="font-bold text-accent">3.</span> Po 7 dniach liczy
            się do nagrody.
          </li>
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <Gift className="h-3.5 w-3.5" aria-hidden />
          Nagroda przyznawana jest raz na konto.
        </p>
      )}
    </section>
  );
}
