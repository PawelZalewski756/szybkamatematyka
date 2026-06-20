"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseOrNull } from "@/lib/supabase";
import { ensureUserProfile, type Profile } from "@/lib/supabase/profiles";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import { SOLVED_TASKS_UPDATED_EVENT } from "@/lib/baza-zadan/solved-tasks";
import {
  ACHIEVEMENTS_TOTAL,
  evaluateAll,
  findAchievement,
} from "@/lib/achievements/catalog";
import {
  emptyPlayerStats,
  gatherClientStats,
  hasSeenAchievementRecord,
  loadSeenAchievementIds,
  mergeSeenIds,
  saveSeenAchievementIds,
} from "@/lib/achievements/stats";
import {
  fetchUnlockedAchievements,
  markAchievementsSeen,
  recordUnlockedAchievements,
} from "@/lib/supabase/achievements";
import type {
  Achievement,
  AchievementStatus,
  PlayerStats,
} from "@/lib/achievements/types";

export type UseAchievementsResult = {
  /** Czy zakończono pierwsze ładowanie (sesja + profil). */
  ready: boolean;
  stats: PlayerStats;
  statuses: AchievementStatus[];
  unlockedCount: number;
  total: number;
  /** Odznaki odblokowane, których gracz jeszcze nie „widział". */
  newlyUnlocked: Achievement[];
  /** Oznacza wszystkie świeżo odblokowane jako zobaczone (zapis w localStorage). */
  markSeen: () => void;
};

/**
 * Hook agregujący osiągnięcia gracza. Zbiera PlayerStats z istniejących źródeł
 * (profil Supabase + localStorage), wylicza status każdej odznaki i wykrywa
 * „świeżo odblokowane" przez porównanie z zapisanym zbiorem „widzianych".
 */
export function useAchievements(): UseAchievementsResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<PlayerStats>(emptyPlayerStats);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const seenRef = useRef<Set<string>>(new Set());
  const seenLoadedForRef = useRef<string | null | undefined>(undefined);
  const userIdRef = useRef<string | null>(null);
  /** Aktualny zbiór odblokowanych odznak (dla asynchronicznej synchronizacji). */
  const unlockedRef = useRef<Set<string>>(new Set());
  /** Dla którego konta wykonano już początkową synchronizację z Supabase. */
  const remoteSyncedForRef = useRef<string | null | undefined>(undefined);
  /** ID osiągnięć już zapisanych w Supabase w tej sesji (anty-duplikat zapisów). */
  const recordedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const recompute = useCallback((prof: Profile | null, uid: string | null) => {
    const nextStats = gatherClientStats(prof, uid);
    const unlocked = evaluateAll(nextStats)
      .filter((s) => s.unlocked)
      .map((s) => s.id);

    // Inicjalizacja zbioru „widzianych" dla danego konta. Przy pierwszej w życiu
    // wizycie zapisujemy aktualnie odblokowane bez świętowania, by nie pokazać
    // od razu confetti dla wszystkich historycznych odznak.
    if (seenLoadedForRef.current !== uid) {
      seenLoadedForRef.current = uid;
      // Zmiana konta → resetuj liczniki synchronizacji z Supabase.
      remoteSyncedForRef.current = undefined;
      recordedRef.current = new Set();
      if (hasSeenAchievementRecord(uid)) {
        seenRef.current = loadSeenAchievementIds(uid);
      } else {
        seenRef.current = new Set(unlocked);
        saveSeenAchievementIds(uid, seenRef.current);
      }
    }

    unlockedRef.current = new Set(unlocked);
    setStats(nextStats);

    // Gdy zalogowany i Supabase dostępne, wstrzymaj confetti do czasu scalenia
    // stanu „widziane" z chmurą — inaczej świętowalibyśmy odznaki widziane już
    // na innym urządzeniu. Brak Supabase / gość → liczymy od razu z localStorage.
    const supabase = getSupabaseOrNull();
    if (supabase && uid && remoteSyncedForRef.current !== uid) {
      setNewlyUnlocked([]);
      return;
    }

    const fresh = unlocked
      .filter((id) => !seenRef.current.has(id))
      .map((id) => findAchievement(id))
      .filter((a): a is Achievement => Boolean(a));

    setNewlyUnlocked(fresh);
  }, []);

  // Sesja + profil (mirror istniejących hooków: getSupabaseOrNull + ensureUserProfile).
  useEffect(() => {
    const supabase = getSupabaseOrNull();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id ?? null;
        if (cancelled) return;
        setUserId(uid);
        if (session?.user) {
          try {
            const prof = await ensureUserProfile(session.user);
            if (!cancelled) setProfile(prof);
          } catch {
            /* brak profilu — liczymy z samego localStorage */
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (session?.user) {
        void ensureUserProfile(session.user)
          .then((prof) => setProfile(prof))
          .catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Nasłuch zdarzeń aktualizacji profilu / rozwiązanych zadań → przelicz.
  useEffect(() => {
    const onSolved = () => setRefreshKey((k) => k + 1);
    const onProfile = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (!detail?.profile) return;
      setProfile((current) =>
        current && current.id !== detail.profile.id ? current : detail.profile,
      );
    };

    window.addEventListener(SOLVED_TASKS_UPDATED_EVENT, onSolved);
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    return () => {
      window.removeEventListener(SOLVED_TASKS_UPDATED_EVENT, onSolved);
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
    };
  }, []);

  // Przelicz przy każdej zmianie wejść.
  useEffect(() => {
    if (!ready) return;
    // Przeliczenie statystyk to celowa synchronizacja z localStorage/profilem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recompute(profile, userId);
  }, [ready, profile, userId, refreshKey, recompute]);

  // Początkowa synchronizacja z Supabase (raz na konto): scal stan „widziane"
  // (unia local ∪ chmura), zapisz nowo odblokowane i pogodź flagę „seen".
  useEffect(() => {
    if (!ready || !userId) return;
    const supabase = getSupabaseOrNull();
    if (!supabase) return;
    if (remoteSyncedForRef.current === userId) return;

    let cancelled = false;
    const uid = userId;

    const sync = async () => {
      const remote = await fetchUnlockedAchievements(uid);
      if (cancelled) return;

      const remoteSeen = new Set(
        remote.filter((r) => r.seen).map((r) => r.id),
      );
      const remoteAll = new Set(remote.map((r) => r.id));

      // Chmura jest źródłem prawdy między urządzeniami — scal jej „widziane"
      // z lokalnymi (unia), by nie świętować ponownie odznak z innego urządzenia.
      seenRef.current = mergeSeenIds(seenRef.current, remoteSeen);
      saveSeenAchievementIds(uid, seenRef.current);

      const unlocked = [...unlockedRef.current];

      // Zapisz w chmurze odblokowane odznaki, których jeszcze tam nie ma.
      const toRecord = unlocked.filter((id) => !remoteAll.has(id));
      if (toRecord.length > 0) {
        await recordUnlockedAchievements(uid, toRecord);
      }
      for (const id of unlocked) recordedRef.current.add(id);

      // Pogódź flagę „seen": lokalnie widziane odblokowane odznaki, które w
      // chmurze są jeszcze nieoznaczone, oznacz jako widziane (cross-device).
      const toMarkSeen = unlocked.filter(
        (id) => seenRef.current.has(id) && !remoteSeen.has(id),
      );
      if (toMarkSeen.length > 0) {
        await markAchievementsSeen(uid, toMarkSeen);
      }

      if (cancelled) return;
      remoteSyncedForRef.current = uid;
      // Wznów wyliczenie confetti teraz, gdy stan „widziane" jest scalony.
      setRefreshKey((k) => k + 1);
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [ready, userId, refreshKey]);

  // Bieżące zapisywanie nowo odblokowanych odznak (po początkowej synchronizacji).
  useEffect(() => {
    if (!ready || !userId) return;
    const supabase = getSupabaseOrNull();
    if (!supabase) return;
    if (remoteSyncedForRef.current !== userId) return;

    const fresh = [...unlockedRef.current].filter(
      (id) => !recordedRef.current.has(id),
    );
    if (fresh.length === 0) return;
    for (const id of fresh) recordedRef.current.add(id);
    void recordUnlockedAchievements(userId, fresh);
  }, [ready, userId, stats]);

  const markSeen = useCallback(() => {
    setNewlyUnlocked((current) => {
      if (current.length > 0) {
        const ids = current.map((a) => a.id);
        for (const id of ids) seenRef.current.add(id);
        saveSeenAchievementIds(userIdRef.current, seenRef.current);
        // Utrwal „widziane" w Supabase (źródło prawdy między urządzeniami).
        const uid = userIdRef.current;
        if (uid) void markAchievementsSeen(uid, ids);
      }
      return [];
    });
  }, []);

  const statuses = useMemo(() => evaluateAll(stats), [stats]);
  const unlockedCount = useMemo(
    () => statuses.filter((s) => s.unlocked).length,
    [statuses],
  );

  return {
    ready,
    stats,
    statuses,
    unlockedCount,
    total: ACHIEVEMENTS_TOTAL,
    newlyUnlocked,
    markSeen,
  };
}
