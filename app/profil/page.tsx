"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { LevelBadge } from "@/components/gaming/LevelBadge";
import { ProfileAchievements } from "@/components/achievements/ProfileAchievements";
import { StreakReminderPrompt } from "@/components/reminders/StreakReminderPrompt";
import { ProfileStatsSection } from "@/components/profil/ProfileStatsSection";
import { calculateLevel } from "@/lib/levelSystem";
import { PlayerAvatarUpload } from "@/components/profil/PlayerAvatarUpload";
import {
  ensureUserProfile,
  fetchProfile,
  isNickTaken,
  NickCooldownError,
  NickTakenError,
  nickChangeCooldownMessage,
  normalizeNick,
  profileFromUserFallback,
  subscriptionSnapshotFromProfile,
  updateProfileNick,
  type Profile,
} from "@/lib/supabase/profiles";
import {
  isPro as snapshotIsPro,
  subscriptionStatusLabel,
  type SubscriptionSnapshot,
} from "@/lib/subscription/status";
import { getPlanById } from "@/lib/subscription/plans";
import { notifyProfileUpdated } from "@/lib/profile-sync";
import {
  examTypeForKey,
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import { buildTreningTreeFromTasks } from "@/lib/trening/dynamic-tree";
import { fetchSolvedTaskIds } from "@/lib/supabase/solved-tasks";
import { fetchTasksForTree } from "@/lib/supabase/tasks";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Crown,
  Flame,
  Loader2,
  LogOut,
  Save,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ComponentType } from "react";

function avatarInitial(user: User, profile: Profile | null): string {
  const nick = profile?.nick?.trim();
  if (nick) return nick.charAt(0).toUpperCase();
  const email = user.email?.trim();
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

function streakLabel(days: number): string {
  if (days <= 0) return "0 dni";
  if (days === 1) return "1 dzień";
  return `${days} dni`;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  accent: "violet" | "cyan" | "orange" | "emerald";
}) {
  const ring =
    accent === "violet"
      ? "shadow-[0_0_24px_rgba(139,92,246,0.2)]"
      : accent === "cyan"
        ? "shadow-[0_0_24px_rgba(34,211,238,0.18)]"
        : accent === "orange"
          ? "shadow-[0_0_24px_rgba(251,146,60,0.15)]"
          : "shadow-[0_0_24px_rgba(52,211,153,0.12)]";

  const iconColor =
    accent === "violet"
      ? "text-violet-400"
      : accent === "cyan"
        ? "text-cyan-400"
        : accent === "orange"
          ? "text-orange-400"
          : "text-emerald-400";

  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5 ${ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:text-xs">
          {label}
        </p>
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} aria-hidden />
      </div>
      <p className="mt-2 text-xl font-black text-white sm:text-2xl">{value}</p>
      {sub && (
        <p className="mt-0.5 text-xs font-semibold text-zinc-500">{sub}</p>
      )}
    </div>
  );
}

function PlanSection({ snapshot }: { snapshot: SubscriptionSnapshot }) {
  const pro = snapshotIsPro(snapshot);
  const plan = snapshot.planId ? getPlanById(snapshot.planId) : null;
  const periodEnd = snapshot.currentPeriodEnd
    ? new Date(snapshot.currentPeriodEnd).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="mt-8">
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl sm:p-6 ${
          pro
            ? "border-fuchsia-400/40 bg-gradient-to-b from-fuchsia-500/10 to-zinc-900/80"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Crown
                className={`h-4 w-4 ${pro ? "text-fuchsia-300" : "text-zinc-500"}`}
                aria-hidden
              />
              Twój plan
            </div>
            <p className="mt-2 text-xl font-black text-white">
              {pro ? (plan?.name ?? "Pro") : "Start (darmowy)"}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Status: {subscriptionStatusLabel(snapshot.status)}
            </p>
            {pro && periodEnd && (
              <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                {snapshot.cancelAtPeriodEnd
                  ? `Dostęp do ${periodEnd} (subskrypcja anulowana)`
                  : `Odnowienie: ${periodEnd}`}
              </p>
            )}
          </div>
          {pro ? (
            <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-black text-white">
              PRO
            </span>
          ) : (
            <Link
              href="/cennik"
              className="shrink-0 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110"
            >
              Przejdź na Pro
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [arenaSolvedCount, setArenaSolvedCount] = useState(0);
  const [topicsCompletedPercent, setTopicsCompletedPercent] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [nickSaving, setNickSaving] = useState(false);
  const [nickMessage, setNickMessage] = useState<{
    text: string;
    ok: boolean;
    variant?: "taken";
  } | null>(null);

  const nickCooldownText = profile
    ? nickChangeCooldownMessage(profile.lastNickUpdate)
    : null;
  const nickChangeBlocked = Boolean(nickCooldownText);

  const loadPlayerData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    setConfigError(false);
    setLoading(true);

    try {
      const supabase = getSupabase();
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (!authUser) {
        setUser(null);
        setProfile(null);
        setArenaSolvedCount(0);
        setTopicsCompletedPercent(0);
        router.replace("/login");
        return;
      }

      setUser(authUser);

      let playerProfile: Profile;
      try {
        playerProfile = await ensureUserProfile(authUser);
      } catch {
        const row = await fetchProfile(authUser.id, authUser);
        playerProfile = row ?? profileFromUserFallback(authUser);
      }

      setProfile(playerProfile);
      setNickDraft(playerProfile.nick);

      const solvedIds = await fetchSolvedTaskIds(authUser.id);
      setArenaSolvedCount(solvedIds.size);

      const examKeys: TreningExamKey[] = [
        "matura_podstawowa",
        "8_klasa",
      ];
      let playableTopics = 0;
      let completedTopics = 0;

      for (const examKey of examKeys) {
        const tasks = await fetchTasksForTree(examTypeForKey(examKey));
        const tree = buildTreningTreeFromTasks(
          tasks,
          solvedIds,
          TRAINING_CURRICULUM[examKey],
        );
        for (const category of tree.categories) {
          for (const topic of category.topics) {
            if (topic.total > 0) {
              playableTopics += 1;
              if (topic.status === "completed") completedTopics += 1;
            }
          }
        }
      }

      setTopicsCompletedPercent(
        playableTopics > 0
          ? Math.round((completedTopics / playableTopics) * 100)
          : 0,
      );
    } catch {
      setUser(null);
      setProfile(null);
      setArenaSolvedCount(0);
      setTopicsCompletedPercent(0);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlayerData();
  }, [loadPlayerData]);

  const handleSaveNick = async () => {
    if (!user || !profile || nickChangeBlocked) return;
    const next = normalizeNick(nickDraft);
    if (!next || next.length < 2) {
      setNickMessage({
        text: "Nick musi mieć co najmniej 2 znaki.",
        ok: false,
      });
      return;
    }
    if (next === profile.nick) {
      setNickMessage({ text: "Bez zmian.", ok: true });
      return;
    }

    setNickSaving(true);
    setNickMessage(null);
    try {
      const taken = await isNickTaken(next, user.id);
      if (taken) {
        setNickMessage({
          text: "Ten nick jest już zajęty!",
          ok: false,
          variant: "taken",
        });
        return;
      }
      const updated = await updateProfileNick(user.id, next, {
        lastNickUpdate: profile.lastNickUpdate,
      });
      setProfile(updated);
      setNickDraft(updated.nick);
      notifyProfileUpdated(updated);
      setNickMessage({ text: "Nick zapisany!", ok: true });
    } catch (err) {
      if (err instanceof NickTakenError) {
        setNickMessage({
          text: "Ten nick jest już zajęty!",
          ok: false,
          variant: "taken",
        });
        return;
      }
      if (err instanceof NickCooldownError) {
        setNickMessage({ text: err.messagePl, ok: false });
        return;
      }
      setNickMessage({ text: "Nie udało się zapisać nicku.", ok: false });
    } finally {
      setNickSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1920px] flex-1 flex-col py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-fuchsia-500/30 border-t-cyan-400" />
            <p className="text-sm font-semibold text-zinc-400">
              Ładowanie dashboardu gracza…
            </p>
          </div>
        ) : configError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg font-bold text-zinc-300">
              Brak połączenia z Supabase
            </p>
            <p className="max-w-sm text-sm text-zinc-500">
              Uzupełnij zmienne w pliku .env.local, aby wyświetlić profil.
            </p>
            <Link
              href="/"
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              ← Strona główna
            </Link>
          </div>
        ) : user && profile ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col"
          >
            <header className="flex flex-col items-center text-center">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400/90">
                <Swords className="h-3.5 w-3.5" aria-hidden />
                Dashboard gracza
              </div>
              <PlayerAvatarUpload
                userId={user.id}
                avatarUrl={profile.avatarUrl}
                fallbackInitial={avatarInitial(user, profile)}
                onUploaded={(url) => {
                  setProfile((p) => (p ? { ...p, avatarUrl: url } : p));
                  if (profile) notifyProfileUpdated({ ...profile, avatarUrl: url });
                }}
              />
              <p className="mt-3 break-all text-xs text-zinc-500">{user.email}</p>
            </header>

            <section className="mt-8">
              <label
                htmlFor="gaming-nick"
                className="text-xs font-bold uppercase tracking-wider text-zinc-400"
              >
                Gamingowy nick
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="gaming-nick"
                  type="text"
                  value={nickDraft}
                  onChange={(e) => setNickDraft(e.target.value)}
                  maxLength={24}
                  disabled={nickChangeBlocked}
                  className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-md placeholder:text-zinc-600 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Twój nick na tablicy wyników"
                />
                <button
                  type="button"
                  disabled={nickSaving || nickChangeBlocked}
                  onClick={() => void handleSaveNick()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  {nickSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Zapisz</span>
                </button>
              </div>
              {nickCooldownText && (
                <p className="mt-2 text-xs font-semibold text-amber-400/90">
                  {nickCooldownText}
                </p>
              )}
              {nickMessage && (
                <p
                  className={`mt-2 text-xs font-semibold ${
                    nickMessage.ok
                      ? "text-emerald-400"
                      : nickMessage.variant === "taken"
                        ? "text-red-400"
                        : "text-zinc-400"
                  }`}
                >
                  {nickMessage.text}
                </p>
              )}
            </section>

            <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                label="Poziom"
                value={`Lvl ${calculateLevel(profile.xp)}`}
                icon={Trophy}
                accent="violet"
              />
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:text-xs">
                    Punkty XP
                  </p>
                  <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xl font-black text-white sm:text-2xl">
                    {profile.xp.toLocaleString("pl-PL")}
                  </p>
                  <LevelBadge level={calculateLevel(profile.xp)} />
                </div>
                <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                  doświadczenie
                </p>
              </div>
              <StatCard
                label="Streak"
                value={streakLabel(profile.streak)}
                sub={
                  profile.streak >= 2
                    ? "🔥 Seria nauki"
                    : "Zagraj dziś, aby podbić"
                }
                icon={Flame}
                accent="orange"
              />
              <StatCard
                label="Arena — zadania"
                value={String(arenaSolvedCount)}
                sub="rozwiązane w treningu"
                icon={Swords}
                accent="emerald"
              />
              <StatCard
                label="Tematy ukończone"
                value={`${topicsCompletedPercent}%`}
                sub="ścieżka treningowa"
                icon={Sparkles}
                accent="cyan"
              />
            </section>

            <PlanSection snapshot={subscriptionSnapshotFromProfile(profile)} />

            <StreakReminderPrompt variant="card" className="mt-8" />

            <ProfileAchievements />

            <ProfileStatsSection
              profile={profile}
              userId={user.id}
              solvedCount={arenaSolvedCount}
            />

            <div className="mt-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
              <Link
                href="/trening"
                className="inline-flex items-center gap-2 text-sm font-bold text-fuchsia-400 transition hover:text-fuchsia-300"
              >
                <Swords className="h-4 w-4" />
                Kontynuuj trening →
              </Link>
              <Link
                href="/rankingi"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
              >
                <Trophy className="h-4 w-4" />
                Tablica wyników →
              </Link>
            </div>

            <div className="mt-auto pt-10 pb-4">
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-red-600 py-4 text-base font-black text-white shadow-lg shadow-red-900/50 transition-all hover:bg-red-500 hover:shadow-[0_0_28px_rgba(239,68,68,0.45)] active:scale-[0.98] disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                {loggingOut ? "Wylogowywanie…" : "Wyloguj się"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
