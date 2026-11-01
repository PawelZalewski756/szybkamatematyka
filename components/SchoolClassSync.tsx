"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  ensureUserProfile,
  updateProfileSchoolLevel,
  type Profile,
} from "@/lib/supabase/profiles";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  hasStoredLearningPath,
  saveLearningPath,
} from "@/lib/learning-path";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import { useEffect, useRef } from "react";

/**
 * Synchronizuje wybrany poziom nauki między profilem Supabase a localStorage.
 * Profil ma pierwszeństwo po zalogowaniu; brak w profilu → zapis z localStorage.
 */
export function SchoolClassSync() {
  const { path, ready } = useLearningPath();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!ready || !isSupabaseConfigured()) return;

    const sync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;

      try {
        const supabase = getSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        let profile: Profile | null = null;
        try {
          profile = await ensureUserProfile(user);
        } catch {
          return;
        }

        const profileLevel = profile.schoolLevel;
        if (profileLevel && profileLevel !== path) {
          saveLearningPath(profileLevel);
          return;
        }

        if (!profileLevel && hasStoredLearningPath()) {
          const updated = await updateProfileSchoolLevel(user.id, path);
          window.dispatchEvent(
            new CustomEvent<ProfileUpdatedDetail>(PROFILE_UPDATED_EVENT, {
              detail: { profile: updated },
            }),
          );
        }
      } catch {
        /* ignore — kolumna school_class może nie istnieć jeszcze w DB */
      } finally {
        syncingRef.current = false;
      }
    };

    void sync();
  }, [ready, path]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      const raw = detail?.profile?.schoolLevel;
      if (!raw) return;
      saveLearningPath(raw);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, []);

  return null;
}
