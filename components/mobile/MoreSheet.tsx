"use client";

import { NavbarPathSelect } from "@/components/NavbarPathSelect";
import { isNavActive } from "@/lib/layout/mobile-nav";
import type { NavGroup, NavLink } from "@/lib/layout/nav-links";
import { LogOut, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId } from "react";

const MOBILE_MORE_GROUPS: readonly NavGroup[] = [
  {
    label: "Nauka",
    links: [
      { href: "/baza-zadan", label: "Baza zadań" },
      { href: "/powtorki", label: "Powtórki" },
    ],
  },
  {
    label: "Społeczność",
    links: [
      { href: "/rankingi", label: "Rankingi" },
      { href: "/osiagniecia", label: "Osiągnięcia" },
    ],
  },
  {
    label: null,
    links: [{ href: "/cennik", label: "Cennik" }],
  },
];

function SheetLink({
  href,
  label,
  active,
  onNavigate,
}: NavLink & { active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-accent/12 text-accent"
          : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

type MoreSheetProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  isLoggedIn: boolean;
  onLogout?: () => void;
  loggingOut?: boolean;
};

export function MoreSheet({
  open,
  onClose,
  pathname,
  isLoggedIn,
  onLogout,
  loggingOut = false,
}: MoreSheetProps) {
  const sheetId = useId();

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] lg:hidden" role="presentation">
      <button
        type="button"
        aria-label="Zamknij menu"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <aside
        id={sheetId}
        role="dialog"
        aria-modal="true"
        aria-label="Więcej"
        className="absolute inset-x-0 bottom-0 max-h-[min(85vh,32rem)] overflow-hidden rounded-t-2xl border-t border-white/[0.08] bg-[#0c1219] pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <span className="text-sm font-semibold text-white">Więcej</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="mb-1.5 text-[11px] font-medium text-slate-500">Twoja ścieżka</p>
          <NavbarPathSelect />
        </div>

        <nav className="overflow-y-auto px-2 py-3">
          {MOBILE_MORE_GROUPS.map((group, index) => (
            <div
              key={group.label ?? "misc"}
              className={index > 0 ? "mt-3 border-t border-white/[0.06] pt-3" : ""}
            >
              {group.label ? (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {group.links.map((link) => (
                  <SheetLink
                    key={link.href}
                    {...link}
                    active={isNavActive(pathname, link.href)}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          ))}

          {isLoggedIn && onLogout && (
            <div className="mt-3 border-t border-white/[0.06] px-1 pt-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Wyloguj
              </button>
            </div>
          )}
        </nav>
      </aside>
    </div>
  );
}
