"use client";

import {
  NAV_MORE_GROUPS,
  NAV_PRIMARY_LINKS,
  type NavLink,
} from "@/lib/layout/nav-links";
import { NavbarPathSelect } from "@/components/NavbarPathSelect";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

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
          ? "bg-brand/15 text-brand-light"
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
};

export function NavbarSheet({ showPrimaryLinks = false }: NavbarSheetProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheetId = useId();

  const menuActive =
    NAV_MORE_GROUPS.some((g) =>
      g.links.some((l) => isNavActive(pathname, l.href)),
    ) ||
    isNavActive(pathname, "/profil") ||
    (showPrimaryLinks &&
      NAV_PRIMARY_LINKS.some((l) => isNavActive(pathname, l.href)));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          open || menuActive
            ? "border-brand/40 bg-brand/10 text-brand-light"
            : "border-surface-border text-muted hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        <Menu className="h-[18px] w-[18px]" aria-hidden />
      </button>

      {open && (
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
            className="absolute right-0 top-0 flex h-full w-[min(100vw-2.5rem,17.5rem)] flex-col border-l border-surface-border bg-surface"
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
                <p className="mb-1.5 text-[11px] font-medium text-muted">
                  Twoja ścieżka
                </p>
                <NavbarPathSelect />
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-2 py-3">
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
                    <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {group.label}
                    </p>
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

              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <SheetLink
                  href="/profil"
                  label="Profil"
                  active={isNavActive(pathname, "/profil")}
                  onNavigate={close}
                />
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
