"use client";

import { GuestClassModal } from "@/components/onboarding/GuestClassModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  ensureUserProfile,
  profileNeedsOnboarding,
  type Profile,
} from "@/lib/supabase/profiles";
import { hasStoredSchoolClass } from "@/lib/learning-path";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import type { User } from "@supabase/supabase-js";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type OnboardingGateProps = {
  children: ReactNode;
};

const emptySubscribe = () => () => {};

export function OnboardingGate({ children }: OnboardingGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [guestClassDone, setGuestClassDone] = useState(false);

  const load = useCallback(async (sessionUser: User | null) => {
    setUser(sessionUser);

    if (!sessionUser || !isSupabaseConfigured()) {
      setProfile(null);
      setReady(true);
      return;
    }

    try {
      const row = await ensureUserProfile(sessionUser);
      setProfile(row);
    } catch {
      setProfile(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      void load(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [load]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (!detail?.profile || !user || detail.profile.id !== user.id) return;
      setProfile(detail.profile);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, [user]);

  const userBlocked = ready && user !== null && profileNeedsOnboarding(profile);
  const guestBlocked =
    hydrated &&
    ready &&
    !user &&
    !guestClassDone &&
    !hasStoredSchoolClass();
  const blocked = userBlocked || guestBlocked;

  return (
    <>
      <div
        className={
          blocked
            ? "pointer-events-none flex min-h-0 flex-1 flex-col select-none"
            : "flex min-h-0 flex-1 flex-col"
        }
        aria-hidden={blocked ? true : undefined}
        inert={blocked ? true : undefined}
      >
        {children}
      </div>
      {userBlocked && user && (
        <OnboardingModal user={user} onComplete={(p) => setProfile(p)} />
      )}
      {guestBlocked && (
        <GuestClassModal onComplete={() => setGuestClassDone(true)} />
      )}
    </>
  );
}
