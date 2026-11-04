"use client";

import { GrajHubSheet } from "@/components/mobile/GrajHubSheet";
import { MoreSheet } from "@/components/mobile/MoreSheet";
import { useDesktopNav } from "@/components/useDesktopNav";
import {
  getMobileActiveTab,
  isMobileGrajActive,
  isMobileMoreActive,
} from "@/lib/layout/mobile-nav";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  Ellipsis,
  Gamepad2,
  GraduationCap,
  Home,
  Library,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

type TabLinkProps = {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
};

function TabLink({ href, label, icon: Icon, active }: TabLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 transition-colors ${
        active ? "text-foreground" : "text-muted active:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      <span className="max-w-full truncate text-[10px] font-medium leading-tight">
        {label}
      </span>
    </Link>
  );
}

type TabButtonProps = {
  label: string;
  icon: typeof Ellipsis;
  active: boolean;
  onClick: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
};

function TabButton({
  label,
  icon: Icon,
  active,
  onClick,
  ariaExpanded,
  ariaControls,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      className={`mx-0.5 flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
        active
          ? "bg-accent/10 text-accent"
          : "text-muted hover:bg-surface-hover active:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      <span className="max-w-full truncate text-[10px] font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}

export function MobileTabBar() {
  const isDesktopNav = useDesktopNav();
  const pathname = usePathname();
  const router = useRouter();
  const moreSheetId = useId();
  const [grajPath, setGrajPath] = useState<string | null>(null);
  const [morePath, setMorePath] = useState<string | null>(null);
  const grajOpen = grajPath === pathname;
  const moreOpen = morePath === pathname;
  const setGrajOpen = (
    next: boolean | ((prev: boolean) => boolean),
  ) => {
    const resolved = typeof next === "function" ? next(grajOpen) : next;
    setGrajPath(resolved ? pathname : null);
    if (resolved) setMorePath(null);
  };
  const setMoreOpen = (
    next: boolean | ((prev: boolean) => boolean),
  ) => {
    const resolved = typeof next === "function" ? next(moreOpen) : next;
    setMorePath(resolved ? pathname : null);
    if (resolved) setGrajPath(null);
  };
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const activeTab = getMobileActiveTab(pathname);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setLoggingOut(false);
    };
  }, [router]);

  if (isDesktopNav) return null;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-surface-border bg-surface pb-[max(env(safe-area-inset-bottom,0px),0px)] lg:hidden"
        aria-label="Nawigacja mobilna"
      >
        <div className="mx-auto flex h-16 max-w-lg items-center px-1">
          <TabLink
            href="/"
            label="Start"
            icon={Home}
            active={activeTab === "start"}
          />
          <TabLink
            href="/trening"
            label="Trening"
            icon={GraduationCap}
            active={activeTab === "trening"}
          />

          <TabLink
            href="/baza-zadan"
            label="Zadania"
            icon={Library}
            active={activeTab === "zadania"}
          />
          <TabButton
            label="Graj"
            icon={Gamepad2}
            active={isMobileGrajActive(pathname) || grajOpen}
            onClick={() => {
              setMoreOpen(false);
              setGrajOpen((v) => !v);
            }}
            ariaExpanded={grajOpen}
          />
          <TabButton
            label="Więcej"
            icon={Ellipsis}
            active={isMobileMoreActive(pathname) || moreOpen}
            onClick={() => {
              setGrajOpen(false);
              setMoreOpen((v) => !v);
            }}
            ariaExpanded={moreOpen}
            ariaControls={moreSheetId}
          />
        </div>
      </nav>

      <GrajHubSheet
        open={grajOpen}
        onClose={() => setGrajOpen(false)}
        pathname={pathname}
      />
      <MoreSheet
        open={moreOpen}
        sheetId={moreSheetId}
        onClose={() => setMoreOpen(false)}
        pathname={pathname}
        isLoggedIn={Boolean(user)}
        onLogout={() => void handleLogout()}
        loggingOut={loggingOut}
      />
    </>
  );
}
