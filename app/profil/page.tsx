"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { LevelBadge } from "@/components/gaming/LevelBadge";
import { ProfileAchievements } from "@/components/achievements/ProfileAchievements";
import { StreakReminderPrompt } from "@/components/reminders/StreakReminderPrompt";
import { ProfileStatsSection } from "@/components/profil/ProfileStatsSection";
import { calculateLevel } from "@/lib/levelSystem";
import { PlayerAvatarUpload } from "@/components/profil/PlayerAvatarUpload";
import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  clearLearningPath,
  learningPathLabel,
  saveLearningPath,
  type LearningPath,
} from "@/lib/learning-path";
import {
  ensureUserProfile,
  fetchProfile,
  isNickTaken,
  NickCooldownError,
  NickTakenError,
  nickChangeCooldownMessage,
  normalizeNick,
  profileFromUserFallback,
  updateProfileNick,
  updateProfileSchoolLevel,
  type Profile,
} from "@/lib/supabase/profiles";
import { useSubscription } from "@/lib/subscription/use-subscription";
import {
  isPro as snapshotIsPro,
  subscriptionStatusLabel,
  type SubscriptionSnapshot,
} from "@/lib/subscription/status";
import { getPlanById } from "@/lib/subscription/plans";
import {
  notifyProfileUpdated,
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
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
  Swords,
  Target,
  Trophy,
  Zap,
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
  accent: "amber" | "cyan" | "orange" | "emerald";
}) {
  const ring = "shadow-[0_0_20px_rgba(244,183,64,0.12)]";

  const iconColor =
    accent === "emerald" ? "text-success" : "text-accent";

  return (
    <div
      className={`rounded-2xl border border-surface-border bg-white/10 p-4 backdrop-blur-md sm:p-5 ${ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
          {label}
        </p>
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} aria-hidden />
      </div>
      <p className="mt-2 text-xl font-black text-white sm:text-2xl">{value}</p>
      {sub && (
        <p className="mt-0.5 text-xs font-semibold text-muted">{sub}</p>
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
    <section id="plan" className="mt-8">
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl sm:p-6 ${
          pro
            ? "border-accent/40 bg-accent-soft"
            : "border-surface-border bg-white/5"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              <Crown
                className={`h-4 w-4 ${pro ? "text-accent" : "text-muted"}`}
                aria-hidden
              />
              Twój plan
            </div>
            <p className="mt-2 text-xl font-black text-white">
              {pro ? (plan?.name ?? "Pro") : "Start (darmowy)"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Status: {subscriptionStatusLabel(snapshot.status)}
            </p>
            {pro && periodEnd && (
              <p className="mt-0.5 text-xs font-semibold text-muted">
                {snapshot.cancelAtPeriodEnd
                  ? `Dostęp do ${periodEnd} (subskrypcja anulowana)`
                  : `Odnowienie: ${periodEnd}`}
              </p>
            )}
          </div>
          {pro ? (
            <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-black text-on-accent">
              PRO
            </span>
          ) : (
            <Link
              href="/cennik"
              className="btn-chunky shrink-0 px-4 py-2 text-sm"
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
  const { setPath: setLocalPath } = useLearningPath();
  const { snapshot: subscriptionSnapshot } = useSubscription();
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
  const [schoolLevelDraft, setSchoolLevelDraft] = useState<LearningPath | "">("");
  const [classSaving, setClassSaving] = useState(false);
  const [classMessage, setClassMessage] = useState<{
    text: string;
    ok: boolean;
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
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      const authUser = session?.user ?? null;
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
      setSchoolLevelDraft(playerProfile.schoolLevel ?? "");

      const examKeys: TreningExamKey[] = [
        "matura_podstawowa",
        "8_klasa",
      ];
      const [solvedIds, examTaskSets] = await Promise.all([
        fetchSolvedTaskIds(authUser.id),
        Promise.all(
          examKeys.map(async (examKey) => ({
            examKey,
            tasks: await fetchTasksForTree(examTypeForKey(examKey)),
          })),
        ),
      ]);
      setArenaSolvedCount(solvedIds.size);

      let playableTopics = 0;
      let completedTopics = 0;

      for (const { examKey, tasks } of examTaskSets) {
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

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      const nextUrl = detail?.profile?.avatarUrl;
      if (!nextUrl || !detail.profile) return;
      setProfile((current) =>
        current?.id === detail.profile.id
          ? { ...current, avatarUrl: nextUrl }
          : current,
      );
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, []);

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

  const handleSaveSchoolLevel = async () => {
    if (!user || !profile) return;
    if (schoolLevelDraft === (profile.schoolLevel ?? "")) {
      setClassMessage({ text: "Bez zmian.", ok: true });
      return;
    }

    setClassSaving(true);
    setClassMessage(null);
    try {
      const updated = await updateProfileSchoolLevel(
        user.id,
        schoolLevelDraft || null,
      );
      setProfile(updated);
      if (schoolLevelDraft) {
        saveLearningPath(schoolLevelDraft);
        setLocalPath(schoolLevelDraft);
      } else {
        clearLearningPath();
      }
      notifyProfileUpdated(updated);
      setClassMessage({ text: "Poziom nauki zapisany!", ok: true });
    } catch {
      setClassMessage({
        text: "Nie udało się zapisać poziomu nauki.",
        ok: false,
      });
    } finally {
      setClassSaving(false);
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
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />

      <div className="relative z-10 page-container flex w-full flex-1 flex-col py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
            <p className="text-sm font-semibold text-muted">
              Ładowanie profilu…
            </p>
          </div>
        ) : configError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg font-bold text-foreground">
              Brak połączenia z Supabase
            </p>
            <p className="max-w-sm text-sm text-muted">
              Uzupełnij zmienne w pliku .env.local, aby wyświetlić profil.
            </p>
            <Link
              href="/"
              className="text-sm font-semibold text-accent hover:text-accent"
            >
              ← Strona główna
            </Link>
          </div>
        ) : user && profile ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-12"
          >
            <div className="min-w-0">
            <header className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                Twój profil
              </h1>
              <PlayerAvatarUpload
                userId={user.id}
                avatarUrl={profile.avatarUrl}
                fallbackInitial={avatarInitial(user, profile)}
                onUploaded={(url) => {
                  setProfile((p) => (p ? { ...p, avatarUrl: url } : p));
                  if (profile) notifyProfileUpdated({ ...profile, avatarUrl: url });
                }}
              />
              <p className="mt-3 break-all text-xs text-muted">{user.email}</p>
            </header>

            <section className="mt-8">
              <label
                htmlFor="profile-nick"
                className="text-xs font-bold uppercase tracking-wider text-muted"
              >
                Nick
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="profile-nick"
                  type="text"
                  value={nickDraft}
                  onChange={(e) => setNickDraft(e.target.value)}
                  maxLength={24}
                  disabled={nickChangeBlocked}
                  className="min-w-0 flex-1 rounded-2xl border border-surface-border bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-md placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="np. KasiaM"
                />
                <button
                  type="button"
                  disabled={nickSaving || nickChangeBlocked}
                  onClick={() => void handleSaveNick()}
                  className="btn-chunky inline-flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm disabled:opacity-60"
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
                <p className="mt-2 text-xs font-semibold text-accent/90">
                  {nickCooldownText}
                </p>
              )}
              {nickMessage && (
                <p
                  className={`mt-2 text-xs font-semibold ${
                    nickMessage.ok
                      ? "text-success"
                      : nickMessage.variant === "taken"
                        ? "text-red-400"
                        : "text-muted"
                  }`}
                >
                  {nickMessage.text}
                </p>
              )}
            </section>

            <section id="klasa" className="mt-8 scroll-mt-24">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Poziom nauki
              </p>
              <p className="mt-1 text-sm text-muted">
                Aktualnie:{" "}
                <span className="font-semibold text-white">
                  {schoolLevelDraft
                    ? learningPathLabel(schoolLevelDraft)
                    : "Nie wybrano"}
                </span>
              </p>
              <div className="mt-2 flex gap-2">
                <SchoolClassPicker
                  id="profile-class"
                  value={schoolLevelDraft}
                  onChange={setSchoolLevelDraft}
                  className="min-w-0 flex-1"
                  optional
                />
                <button
                  type="button"
                  disabled={classSaving}
                  onClick={() => void handleSaveSchoolLevel()}
                  className="btn-chunky inline-flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm disabled:opacity-60"
                >
                  {classSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Zapisz</span>
                </button>
              </div>
              {classMessage && (
                <p
                  className={`mt-2 text-xs font-semibold ${
                    classMessage.ok ? "text-success" : "text-muted"
                  }`}
                >
                  {classMessage.text}
                </p>
              )}
            </section>
            </div>

            <div className="mt-10 min-w-0 lg:mt-0">
            <section className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                label="Poziom"
                value={`Poziom ${calculateLevel(profile.xp)}`}
                icon={Trophy}
                accent="amber"
              />
              <div className="rounded-2xl border border-surface-border bg-white/10 p-4 backdrop-blur-md sm:p-5 shadow-[0_0_24px_rgba(232,112,42,0.18)]">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
                    Punkty XP
                  </p>
                  <Zap className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xl font-black text-white sm:text-2xl">
                    {profile.xp.toLocaleString("pl-PL")}
                  </p>
                  <LevelBadge level={calculateLevel(profile.xp)} />
                </div>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  doświadczenie
                </p>
              </div>
              <StatCard
                label="Seria dni"
                value={streakLabel(profile.streak)}
                sub={
                  profile.streak >= 2
                    ? "🔥 Utrzymujesz passę"
                    : "Ćwicz dziś, aby podtrzymać serię"
                }
                icon={Flame}
                accent="orange"
              />
              <StatCard
                label="Zadania rozwiązane"
                value={String(arenaSolvedCount)}
                sub="w treningu"
                icon={Swords}
                accent="emerald"
              />
              <StatCard
                label="Tematy ukończone"
                value={`${topicsCompletedPercent}%`}
                sub="ścieżka treningowa"
                icon={Target}
                accent="cyan"
              />
            </section>

            <PlanSection snapshot={subscriptionSnapshot} />

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
                className="inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:text-accent"
              >
                <Swords className="h-4 w-4" />
                Kontynuuj trening →
              </Link>
              <Link
                href="/rankingi"
                className="inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:text-accent"
              >
                <Trophy className="h-4 w-4" />
                Rankingi →
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
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
