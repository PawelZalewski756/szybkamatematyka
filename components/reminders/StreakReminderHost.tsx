"use client";

import { StreakReminderBanner } from "@/components/reminders/StreakReminderBanner";
import { StreakReminderPrompt } from "@/components/reminders/StreakReminderPrompt";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import {
  getNotificationPermission,
  showStreakBrowserNotification,
} from "@/lib/reminders/notifications";
import {
  loadStreakReminderPrefs,
  markDailyReminderShown,
} from "@/lib/reminders/storage";
import {
  canShowDailyReminder,
  msUntilEveningWindow,
  needsStreakReminder,
  shouldTriggerStreakReminder,
} from "@/lib/reminders/streak-reminder";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  ensureUserProfile,
  todayDateString,
  type Profile,
} from "@/lib/supabase/profiles";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function StreakReminderHost() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeReminder, setActiveReminder] = useState<number | null>(null);
  const eveningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const tryFireReminder = useCallback(
    (currentProfile: Profile | null, onPageVisit: boolean) => {
      if (!currentProfile || !user) return;

      const today = todayDateString();
      if (!needsStreakReminder(currentProfile, today)) {
        setActiveReminder(null);
        return;
      }

      const prefs = loadStreakReminderPrefs();
      if (!canShowDailyReminder(prefs.lastReminderDate, today)) return;
      if (!shouldTriggerStreakReminder(onPageVisit)) return;

      markDailyReminderShown(today);

      const useBrowser =
        prefs.notificationsEnabled &&
        getNotificationPermission() === "granted" &&
        showStreakBrowserNotification(currentProfile.streak);

      if (!useBrowser) {
        setActiveReminder(currentProfile.streak);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      return;
    }

    const load = async (sessionUser: User | null) => {
      setUser(sessionUser);
      if (!sessionUser) {
        setProfile(null);
        setActiveReminder(null);
        return;
      }
      try {
        const row = await ensureUserProfile(sessionUser);
        setProfile(row);
      } catch {
        setProfile(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void load(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (!detail?.profile || !user || detail.profile.id !== user.id) return;
      setProfile(detail.profile);
      if (detail.profile.lastPlayedDate === todayDateString()) {
        setActiveReminder(null);
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, [user]);

  useEffect(() => {
    if (!profile || !user) return;
    firedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- przypomnienie po nawigacji / zmianie profilu
    tryFireReminder(profile, true);
  }, [pathname, profile, user, tryFireReminder]);

  useEffect(() => {
    if (eveningTimerRef.current) {
      clearTimeout(eveningTimerRef.current);
      eveningTimerRef.current = null;
    }

    if (!profile || !user) return;

    const scheduleEvening = () => {
      const delay = msUntilEveningWindow();
      if (delay === null) return;
      eveningTimerRef.current = setTimeout(() => {
        if (firedRef.current) return;
        const today = todayDateString();
        const prefs = loadStreakReminderPrefs();
        if (
          needsStreakReminder(profile, today) &&
          canShowDailyReminder(prefs.lastReminderDate, today)
        ) {
          firedRef.current = true;
          tryFireReminder(profile, false);
        }
      }, delay);
    };

    scheduleEvening();
    return () => {
      if (eveningTimerRef.current) clearTimeout(eveningTimerRef.current);
    };
  }, [profile, user, tryFireReminder]);

  const handleDismissBanner = useCallback(() => {
    setActiveReminder(null);
  }, []);

  if (!user || !profile) return null;

  return (
    <>
      <StreakReminderPrompt />
      {activeReminder !== null && (
        <StreakReminderBanner
          streak={activeReminder}
          onDismiss={handleDismissBanner}
        />
      )}
    </>
  );
}
