"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { NavbarMetaStrip } from "@/components/NavbarMetaStrip";
import { NavbarProfileChip } from "@/components/NavbarProfileChip";
import { ThemeToggle } from "@/components/ThemeToggle";
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
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
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
  user,
  profile,
  profileLoading,
  loggingOut,
  onLogout,
}: {
  user: User | null;
  profile: Profile | null;
  profileLoading: boolean;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  // Gość: zawsze pokazuj Zaloguj od razu (bez czekania na Supabase).
  // Zalogowany: chip / skeleton / wyloguj pojawiają się po rozpoznaniu sesji.
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ThemeToggle />
      {!user ? (
        <Link
          href="/login"
          className="btn-primary rounded-md px-4 py-2 text-xs sm:text-sm"
        >
          Zaloguj
        </Link>
      ) : (
        <>
          {profileLoading && !profile ? (
            <span
              className="inline-flex h-9 w-24 animate-pulse rounded-md border border-surface-border bg-surface"
              aria-hidden
            />
          ) : null}
          {profile ? <NavbarProfileChip profile={profile} /> : null}
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            aria-label="Wyloguj"
            title="Wyloguj"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-border text-muted transition hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </>
      )}

      <NavbarSheet showPrimaryLinks={false} isLoggedIn={Boolean(user)} />
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
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

    let cancelled = false;

    // Nie blokuj UI na getSession / profil — Zaloguj jest widoczny od razu.
    // Jeśli sesja wisi, po krótkim limicie uznajemy gościa.
    const readyTimeout = window.setTimeout(() => {
      if (!cancelled) setAuthReady(true);
    }, 1200);

    const markReady = () => {
      if (cancelled) return;
      window.clearTimeout(readyTimeout);
      setAuthReady(true);
    };

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        markReady();
        void loadProfile(session?.user ?? null);
      })
      .catch(() => {
        markReady();
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      markReady();
      void loadProfile(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimeout);
      subscription.unsubscribe();
    };
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
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden lg:flex-none lg:gap-3">
          <BrandLogo
            markSize={isDesktopNav ? 30 : 28}
            className="min-w-0 shrink"
          />
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
              user={user}
              profile={profile}
              profileLoading={profileLoading}
              loggingOut={loggingOut}
              onLogout={() => void handleLogout()}
            />
          </>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            {!user ? (
              <Link
                href="/login"
                className="btn-primary shrink-0 rounded-md px-3 py-1.5 text-xs"
              >
                Zaloguj
              </Link>
            ) : profile ? (
              <NavbarProfileChip profile={profile} />
            ) : null}
          </div>
        )}
      </nav>
    </header>
  );
}
