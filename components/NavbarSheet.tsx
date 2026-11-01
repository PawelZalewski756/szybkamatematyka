"use client";

import {
  NAV_MORE_GROUPS,
  NAV_PRIMARY_LINKS,
  type NavLink,
} from "@/lib/layout/nav-links";
import { NavbarClassBadge } from "@/components/NavbarClassBadge";
import { NavbarProBadge } from "@/components/NavbarProBadge";
import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import { useLearningPath } from "@/components/LearningPathProvider";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, useCallback } from "react";
import { createPortal } from "react-dom";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
          ? "bg-surface-hover text-foreground"
          : "text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

type NavbarSheetProps = {
  /** Główne linki w panelu (mobile / tablet). */
  showPrimaryLinks?: boolean;
  showPro?: boolean;
};

export function NavbarSheet({
  showPrimaryLinks = false,
  showPro = false,
}: NavbarSheetProps) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof next === "function" ? next(menuPath === pathname) : next;
      setMenuPath(resolved ? pathname : null);
    },
    [menuPath, pathname],
  );
  const sheetId = useId();
  const { path, setPath, clearPath, hasPathSelection } = useLearningPath();

  const menuActive =
    NAV_MORE_GROUPS.some((g) =>
      g.links.some((l) => isNavActive(pathname, l.href)),
    ) ||
    isNavActive(pathname, "/profil") ||
    (showPrimaryLinks &&
      NAV_PRIMARY_LINKS.some((l) => isNavActive(pathname, l.href)));

  useEffect(() => {
    if (!open) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPadding = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.paddingRight = prevBodyPadding;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const close = () => setOpen(false);

  const sheet =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[200]" role="presentation">
            <button
              type="button"
              aria-label="Zamknij menu"
              className="absolute inset-0 bg-black/55"
              onClick={close}
            />

            <aside
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Menu nawigacji"
              className="absolute right-0 top-0 flex h-[100dvh] w-[min(100vw-2.5rem,17.5rem)] flex-col border-l border-surface-border bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Menu</span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Zamknij"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {showPrimaryLinks && (
                <div className="border-b border-surface-border px-4 py-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <NavbarClassBadge />
                    {showPro ? <NavbarProBadge linkToProfile /> : null}
                  </div>
                  <p className="mb-1.5 text-overline">Poziom nauki</p>
                  <SchoolClassPicker
                    id="navbar-sheet-class"
                    value={hasPathSelection ? path : ""}
                    onChange={(next) => {
                      if (next) {
                        setPath(next);
                      } else {
                        clearPath();
                      }
                    }}
                    optional
                  />
                </div>
              )}

              <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
                {showPrimaryLinks && (
                  <div className="mb-3 space-y-0.5">
                    {NAV_PRIMARY_LINKS.map((link) => (
                      <SheetLink
                        key={link.href}
                        {...link}
                        active={isNavActive(pathname, link.href)}
                        onNavigate={close}
                      />
                    ))}
                  </div>
                )}

                {NAV_MORE_GROUPS.map((group, index) => (
                  <div
                    key={group.label ?? "misc"}
                    className={
                      index > 0 || showPrimaryLinks
                        ? "mt-3 border-t border-surface-border pt-3"
                        : ""
                    }
                  >
                    {group.label ? (
                      <p className="mb-1 px-3 text-overline">{group.label}</p>
                    ) : null}
                    <div className="space-y-0.5">
                      {group.links.map((link) => (
                        <SheetLink
                          key={link.href}
                          {...link}
                          active={isNavActive(pathname, link.href)}
                          onNavigate={close}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-3 border-t border-surface-border pt-3">
                  <SheetLink
                    href="/profil"
                    label="Profil"
                    active={isNavActive(pathname, "/profil")}
                    onNavigate={close}
                  />
                </div>
              </nav>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-surface-border px-2.5 transition-colors ${
          open || menuActive
            ? "border-accent/40 bg-accent-soft text-accent"
            : "bg-surface text-foreground hover:bg-surface-hover"
        }`}
      >
        {open ? (
          <X className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <Menu className="h-[18px] w-[18px]" aria-hidden />
        )}
        <span className="text-xs font-bold tracking-wide">Menu</span>
      </button>

      {sheet}
    </>
  );
}
