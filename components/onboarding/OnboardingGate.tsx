"use client";

import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  ensureUserProfile,
  profileNeedsOnboarding,
  type Profile,
} from "@/lib/supabase/profiles";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type OnboardingGateProps = {
  children: ReactNode;
};

const emptySubscribe = () => () => {};

export function OnboardingGate({ children }: OnboardingGateProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

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

  const shouldPromptOnboarding =
    pathname === "/" ||
    pathname === "/trening" ||
    (pathname.startsWith("/trening/") &&
      !pathname.startsWith("/trening/arkusze")) ||
    pathname === "/minigry" ||
    pathname.startsWith("/minigry/") ||
    pathname === "/pojedynki" ||
    pathname.startsWith("/pojedynki/") ||
    pathname === "/powtorki" ||
    pathname.startsWith("/powtorki/") ||
    pathname === "/wyzwania" ||
    pathname === "/profil";

  const userBlocked =
    shouldPromptOnboarding &&
    ready &&
    user !== null &&
    profileNeedsOnboarding(profile);

  return (
    <>
      <div
        className="flex min-h-0 flex-1 flex-col"
        aria-hidden={userBlocked ? true : undefined}
        inert={userBlocked ? true : undefined}
      >
        {children}
      </div>
      {userBlocked && user && (
        <OnboardingModal user={user} onComplete={(p) => setProfile(p)} />
      )}
    </>
  );
}
