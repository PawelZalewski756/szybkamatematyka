"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  ensureUserProfile,
  updateProfileSchoolClass,
  type Profile,
} from "@/lib/supabase/profiles";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  hasStoredSchoolClass,
  isSchoolClassPath,
  normalizeSchoolClass,
  saveSchoolClass,
} from "@/lib/learning-path";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import { useEffect, useRef } from "react";

/**
 * Synchronizuje klasę ucznia między profilem Supabase a localStorage.
 * Profil ma pierwszeństwo po zalogowaniu; brak w profilu → zapis z localStorage.
 */
export function SchoolClassSync() {
  const { schoolClass, setSchoolClass, ready } = useLearningPath();
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

        const profileClass = profile.schoolClass;
        if (profileClass && profileClass !== schoolClass) {
          saveSchoolClass(profileClass);
          return;
        }

        if (
          !profileClass &&
          hasStoredSchoolClass() &&
          isSchoolClassPath(schoolClass)
        ) {
          const updated = await updateProfileSchoolClass(user.id, schoolClass);
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
  }, [ready, schoolClass, setSchoolClass]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      const raw = detail?.profile?.schoolClass;
      if (!raw) return;
      const normalized = normalizeSchoolClass(raw);
      if (normalized) saveSchoolClass(normalized);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, []);

  return null;
}
