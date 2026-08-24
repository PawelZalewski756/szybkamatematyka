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
const DISMISS_KEY = "szybka-matma-onboarding-dismissed";

function wasDismissed(scope: string): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(`${DISMISS_KEY}:${scope}`) === "1";
}

function dismiss(scope: string): void {
  try {
    localStorage.setItem(`${DISMISS_KEY}:${scope}`, "1");
  } catch {
    /* private mode */
  }
}

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
  const [dismissedScope, setDismissedScope] = useState<string | null>(null);

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

  const userScope = user?.id ?? "guest";
  const dismissed =
    dismissedScope === userScope || (hydrated && wasDismissed(userScope));
  const userBlocked =
    ready && user !== null && profileNeedsOnboarding(profile) && !dismissed;
  const guestBlocked =
    hydrated &&
    ready &&
    !user &&
    !guestClassDone &&
    !dismissed &&
    !hasStoredSchoolClass();
  const handleSkip = () => {
    dismiss(userScope);
    setDismissedScope(userScope);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {userBlocked && user && (
        <OnboardingModal
          user={user}
          onComplete={(p) => setProfile(p)}
          onSkip={handleSkip}
        />
      )}
      {guestBlocked && (
        <GuestClassModal
          onComplete={() => setGuestClassDone(true)}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}
