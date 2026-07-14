"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { NavbarClassBadge } from "@/components/NavbarClassBadge";
import { NavbarProBadge } from "@/components/NavbarProBadge";
import { NavbarProfileChip } from "@/components/NavbarProfileChip";
import { NavbarSheet } from "@/components/NavbarSheet";
import { useDesktopNav } from "@/components/useDesktopNav";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { getSupabase } from "@/lib/supabase";
import {
  ensureUserProfile,
  fetchProfile,
  profileFromUserFallback,
  type Profile,
} from "@/lib/supabase/profiles";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import { NAV_PRIMARY_LINKS } from "@/lib/layout/nav-links";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function PrimaryNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex h-full items-stretch gap-1">
      {NAV_PRIMARY_LINKS.map(({ href, label }) => {
        const active = isNavActive(pathname, href);
        return (
          <li key={href} className="flex">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center px-3 text-sm font-medium transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
              {active && (
                <span
                  className="absolute inset-x-2 bottom-0 h-px bg-foreground"
                  aria-hidden
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktopNav = useDesktopNav();
  const { isPro: subscriptionIsPro, loading: subscriptionLoading } =
    useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfile = useCallback(async (sessionUser: User | null) => {
    setUser(sessionUser);

    if (!sessionUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    try {
      const data = await ensureUserProfile(sessionUser);
      setProfile(data);
    } catch {
      try {
        const row = await fetchProfile(sessionUser.id, sessionUser);
        setProfile(row ?? profileFromUserFallback(sessionUser));
      } catch {
        setProfile(profileFromUserFallback(sessionUser));
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabase>;

    try {
      supabase = getSupabase();
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      void loadProfile(session?.user ?? null).finally(() => setAuthReady(true));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (!detail?.profile) return;

      setProfile((current) => {
        if (current && current.id !== detail.profile.id) return current;
        return detail.profile;
      });
      setProfileLoading(false);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () =>
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, []);

  useEffect(() => {
    if (!user || !authReady) return;

    let cancelled = false;

    const refreshQuietly = async () => {
      try {
        const row = await fetchProfile(user.id, user);
        if (!cancelled && row) setProfile(row);
      } catch {
        /* ignore */
      }
    };

    void refreshQuietly();
    return () => {
      cancelled = true;
    };
  }, [pathname, user, authReady]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push("/");
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setLoggingOut(false);
    }
  };

  const showProfile = authReady && user && profile;
  const showClassBadge = authReady && Boolean(user);
  const showProBadge =
    authReady && !subscriptionLoading && Boolean(user && subscriptionIsPro);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-surface-border bg-surface pt-[max(env(safe-area-inset-top,0px),0px)]">
      <nav
        className="mx-auto flex h-14 w-full max-w-[1920px] items-center gap-3 px-4 sm:px-6 md:px-8 lg:gap-4 lg:px-10 xl:px-12 2xl:px-16"
        aria-label="Główna nawigacja"
      >
        <BrandLogo className="min-w-0 shrink-0" />

        {isDesktopNav ? (
          showClassBadge ? (
            <>
              <div className="hidden h-6 w-px shrink-0 bg-surface-border sm:block" aria-hidden />
              <NavbarClassBadge
                linkToProfile
                className="hidden shrink-0 sm:inline-flex lg:max-w-[10.5rem]"
              />
              {showProBadge ? (
                <NavbarProBadge linkToProfile className="hidden shrink-0 sm:inline-flex" />
              ) : null}
            </>
          ) : null
        ) : (
          <>
            <div className="min-w-0 flex-1" aria-hidden />
            {showClassBadge ? (
              <NavbarClassBadge
                linkToProfile
                className="max-w-[min(100%,9.5rem)] shrink-0 sm:max-w-[10.5rem]"
              />
            ) : null}
            {showProBadge ? (
              <NavbarProBadge linkToProfile className="shrink-0" />
            ) : null}
          </>
        )}

        {isDesktopNav && (
          <div className="flex min-w-0 flex-1 justify-center">
            <PrimaryNavLinks />
          </div>
        )}

        {isDesktopNav && (
          <div className="flex shrink-0 items-center gap-2">
          {!authReady && (
            <span className="h-8 w-8 animate-pulse rounded-full bg-surface-hover" aria-hidden />
          )}

          {user && profileLoading && (
            <span className="h-8 w-8 animate-pulse rounded-lg bg-white/5" aria-hidden />
          )}

          {showProfile && <NavbarProfileChip profile={profile} />}

          {authReady && !user && (
            <Link
              href="/login"
              className="btn-primary px-3.5 py-2 text-xs sm:text-sm"
            >
              Zaloguj
            </Link>
          )}

          {authReady && user && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              aria-label="Wyloguj"
              title="Wyloguj"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-muted transition hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          )}

          <NavbarSheet showPrimaryLinks={false} />
          </div>
        )}
      </nav>
    </header>
  );
}
