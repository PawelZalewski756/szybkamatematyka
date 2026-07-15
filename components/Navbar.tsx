"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { NavbarMetaStrip } from "@/components/NavbarMetaStrip";
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
    <ul className="flex items-center gap-0.5">
      {NAV_PRIMARY_LINKS.map(({ href, label }) => {
        const active = isNavActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NavbarActions({
  authReady,
  user,
  profile,
  profileLoading,
  loggingOut,
  onLogout,
}: {
  authReady: boolean;
  user: User | null;
  profile: Profile | null;
  profileLoading: boolean;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  const showProfile = authReady && user && profile;

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-surface-border bg-white/[0.02] p-1">
      {!authReady && (
        <span className="mx-2 h-7 w-16 animate-pulse rounded-full bg-surface-hover" aria-hidden />
      )}

      {user && profileLoading && (
        <span className="mx-1 h-8 w-20 animate-pulse rounded-full bg-white/5" aria-hidden />
      )}

      {showProfile && <NavbarProfileChip profile={profile} />}

      {authReady && !user && (
        <Link
          href="/login"
          className="btn-primary mx-0.5 rounded-full px-4 py-2 text-xs sm:text-sm"
        >
          Zaloguj
        </Link>
      )}

      {authReady && user && (
        <>
          {showProfile ? (
            <span className="mx-0.5 hidden h-5 w-px bg-surface-border sm:block" aria-hidden />
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            aria-label="Wyloguj"
            title="Wyloguj"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </>
      )}

      <NavbarSheet showPrimaryLinks={false} />
    </div>
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

  const showMeta = authReady && Boolean(user);
  const showPro =
    authReady && !subscriptionLoading && Boolean(user && subscriptionIsPro);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-surface-border/80 bg-surface/95 pt-[max(env(safe-area-inset-top,0px),0px)] backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 w-full max-w-[1920px] items-center gap-2 overflow-hidden px-3 sm:gap-3 sm:px-4 lg:h-[3.75rem] lg:gap-5 lg:px-10 xl:px-12 2xl:px-16"
        aria-label="Główna nawigacja"
      >
        <div className="flex min-w-0 flex-1 items-center overflow-hidden lg:flex-none lg:gap-3">
          <BrandLogo markSize={isDesktopNav ? 30 : 28} className="min-w-0" />
          {isDesktopNav && showMeta ? (
            <NavbarMetaStrip showClass showPro={showPro} />
          ) : null}
        </div>

        {isDesktopNav ? (
          <>
            <div className="flex min-w-0 flex-1 justify-center">
              <PrimaryNavLinks />
            </div>

            <NavbarActions
              authReady={authReady}
              user={user}
              profile={profile}
              profileLoading={profileLoading}
              loggingOut={loggingOut}
              onLogout={() => void handleLogout()}
            />
          </>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            {authReady && !user ? (
              <Link
                href="/login"
                className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold text-accent transition hover:bg-accent/10 sm:px-2.5 sm:text-xs"
              >
                Zaloguj
              </Link>
            ) : null}
            <NavbarSheet showPrimaryLinks showPro={showPro} />
          </div>
        )}
      </nav>
    </header>
  );
}
