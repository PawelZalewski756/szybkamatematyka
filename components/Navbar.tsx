"use client";

import { NavbarPathSelect } from "@/components/NavbarPathSelect";
import { NavbarProfileStats } from "@/components/NavbarProfileStats";
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
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, Fragment } from "react";
import { NAV_GROUPS } from "@/lib/layout/nav-links";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  className = "",
  linkClassName = "",
  showGroupLabels = false,
}: {
  className?: string;
  linkClassName?: string;
  showGroupLabels?: boolean;
}) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {NAV_GROUPS.map((group, groupIndex) => (
        <Fragment key={group.label ?? "start"}>
          {showGroupLabels && group.label ? (
            <li
              className="hidden shrink-0 list-none self-center px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 xl:block"
              aria-hidden
            >
              {group.label}
            </li>
          ) : null}
          {group.links.map(({ href, label }) => {
            const active = isNavActive(pathname, href);
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`block shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${linkClassName} ${
                    active
                      ? "bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 text-white shadow-[0_0_14px_rgba(192,38,211,0.2)] ring-1 ring-fuchsia-500/30"
                      : "text-zinc-300 hover:bg-white/10 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          {groupIndex < NAV_GROUPS.length - 1 ? (
            <li
              className="mx-0.5 hidden h-5 w-px shrink-0 self-center bg-white/10 lg:block"
              aria-hidden
            />
          ) : null}
        </Fragment>
      ))}
    </ul>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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
      // No Supabase configured — mark auth resolved so UI can render.
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

  const showStats = authReady && user && profile;

  const authControl = !authReady ? (
    <span className="h-9 w-16 shrink-0 animate-pulse rounded-full bg-zinc-800 sm:w-20" />
  ) : user ? (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loggingOut}
      className="shrink-0 rounded-full border border-white/15 bg-zinc-900 px-2.5 py-2 text-[11px] font-bold text-zinc-200 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 sm:px-4 sm:text-sm"
    >
      {loggingOut ? "…" : "Wyloguj"}
    </button>
  ) : (
    <Link
      href="/login"
      className="inline-flex shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-xs font-black text-white shadow-md shadow-fuchsia-500/25 sm:px-4 sm:text-sm"
    >
      Zaloguj
    </Link>
  );

  const profileStatsSkeleton = (
    <div
      className="h-9 w-[8.5rem] shrink-0 animate-pulse rounded-lg bg-zinc-800/80 md:h-10 md:w-[9rem]"
      aria-hidden
    />
  );

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/10 bg-zinc-950/95 pt-[max(env(safe-area-inset-top,0px),0px)] backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[1920px] flex-col gap-1.5 px-4 py-2 sm:gap-2 md:px-8">
        {/* Mobile */}
        <div className="flex min-h-11 items-center gap-2 sm:min-h-12 sm:gap-3 md:hidden">
          <Link
            href="/"
            className="shrink-0 text-sm font-extrabold tracking-tight sm:text-lg"
          >
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              <span className="sm:hidden">Matma</span>
              <span className="hidden sm:inline">Szybka Matma</span>
            </span>
          </Link>

          {user && profileLoading && (
            <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-zinc-800/80" />
          )}
          {showStats && (
            <div className="min-w-0 flex-1">
              <NavbarProfileStats profile={profile} compact />
            </div>
          )}
          {!user && <NavbarPathSelect className="min-w-0 flex-1" />}

          <div className="flex shrink-0 items-center">{authControl}</div>
        </div>

        {user && (
          <div className="md:hidden">
            <NavbarPathSelect className="w-full" />
          </div>
        )}

        <div className="md:hidden">
          <NavLinks
            className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            linkClassName="whitespace-nowrap px-3 py-1.5 text-xs"
          />
        </div>

        {/* Desktop (lg+): lewa | środek (scroll) | prawa kolumna */}
        <div className="hidden min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:grid lg:gap-3">
          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <Link
              href="/"
              className="shrink-0 text-lg font-extrabold tracking-tight"
            >
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Szybka Matma
              </span>
            </Link>
            <NavbarPathSelect className="w-[10.5rem] shrink-0 xl:w-[13.5rem]" />
          </div>

          <div className="flex min-w-0 justify-center overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <NavLinks className="flex w-max items-center gap-1 xl:gap-1.5" showGroupLabels />
          </div>

          <div className="flex shrink-0 items-center gap-2 border-l border-white/10 pl-2.5 lg:gap-2.5 lg:pl-3">
            {user && profileLoading && profileStatsSkeleton}
            {showStats && <NavbarProfileStats profile={profile} dense />}
            {authControl}
          </div>
        </div>

        {/* Tablet (md–lg): kompakt z przewijaniem linków */}
        <div className="hidden min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 md:grid lg:hidden">
          <Link
            href="/"
            className="shrink-0 text-base font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Matma
            </span>
          </Link>

          <div className="flex min-w-0 justify-center overflow-x-auto px-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <NavLinks
              className="flex w-max items-center gap-0.5"
              linkClassName="px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 border-l border-white/10 pl-2">
            {user && profileLoading && profileStatsSkeleton}
            {showStats && <NavbarProfileStats profile={profile} dense />}
            {authControl}
          </div>
        </div>
      </nav>
    </header>
  );
}
