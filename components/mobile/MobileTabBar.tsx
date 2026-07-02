"use client";

import { GrajHubSheet } from "@/components/mobile/GrajHubSheet";
import { MoreSheet } from "@/components/mobile/MoreSheet";
import { useDesktopNav } from "@/components/useDesktopNav";
import {
  getMobileActiveTab,
  isMobileGrajActive,
  isMobileMoreActive,
} from "@/lib/layout/mobile-nav";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  FileText,
  GraduationCap,
  LayoutGrid,
  Play,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TabLinkProps = {
  href: string;
  label: string;
  icon: typeof FileText;
  active: boolean;
};

function TabLink({ href, label, icon: Icon, active }: TabLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 transition-colors ${
        active ? "text-teal-400" : "text-slate-500 active:text-slate-300"
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
  icon: typeof LayoutGrid;
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
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 transition-colors ${
        active ? "text-teal-400" : "text-slate-500 active:text-slate-300"
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
  const [grajOpen, setGrajOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const activeTab = getMobileActiveTab(pathname);
  const profilHref = user ? "/profil" : "/login";
  const profilLabel = user ? "Profil" : "Konto";

  useEffect(() => {
    setGrajOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = getSupabase();
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setUser(data.session?.user ?? null);
        setAuthReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
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
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/[0.08] bg-[#0a0f14]/95 pb-[max(env(safe-area-inset-bottom,0px),0px)] backdrop-blur-md lg:hidden"
        aria-label="Nawigacja mobilna"
      >
        <div className="mx-auto flex h-16 max-w-lg items-end px-1">
          <TabLink
            href="/arkusze"
            label="Arkusze"
            icon={FileText}
            active={activeTab === "arkusze"}
          />
          <TabLink
            href="/trening"
            label="Trening"
            icon={GraduationCap}
            active={activeTab === "trening"}
          />

          <div className="relative flex min-w-0 flex-1 flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setGrajOpen((v) => !v);
              }}
              aria-expanded={grajOpen}
              aria-label="Graj"
              className={`-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient shadow-lg shadow-teal-950/40 ring-4 ring-[#0a0f14] transition hover:brightness-110 active:scale-95 ${
                isMobileGrajActive(pathname) || grajOpen ? "ring-teal-500/20" : ""
              }`}
            >
              <Play className="ml-0.5 h-6 w-6 fill-white text-white" aria-hidden />
            </button>
            <span
              className={`mt-1 text-[10px] font-semibold leading-tight ${
                isMobileGrajActive(pathname) || grajOpen
                  ? "text-teal-400"
                  : "text-slate-500"
              }`}
            >
              Graj
            </span>
          </div>

          <TabLink
            href={profilHref}
            label={profilLabel}
            icon={UserRound}
            active={activeTab === "profil"}
          />
          <TabButton
            label="Więcej"
            icon={LayoutGrid}
            active={isMobileMoreActive(pathname) || moreOpen}
            onClick={() => {
              setGrajOpen(false);
              setMoreOpen((v) => !v);
            }}
            ariaExpanded={moreOpen}
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
        onClose={() => setMoreOpen(false)}
        pathname={pathname}
        isLoggedIn={authReady && Boolean(user)}
        onLogout={() => void handleLogout()}
        loggingOut={loggingOut}
      />
    </>
  );
}
