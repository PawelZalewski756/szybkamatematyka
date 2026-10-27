"use client";

import { NavbarClassBadge } from "@/components/NavbarClassBadge";
import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import { useLearningPath } from "@/components/LearningPathProvider";
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
  {
    label: "Informacje",
    links: [
      { href: "/regulamin", label: "Regulamin" },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/kontakt", label: "Kontakt" },
    ],
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
          : "text-muted hover:bg-surface-hover hover:text-foreground"
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
  const { schoolClass, setSchoolClass } = useLearningPath();

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
        className="absolute inset-x-0 bottom-0 max-h-[min(85vh,32rem)] overflow-hidden rounded-t-2xl border-t border-surface-border sheet-surface pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Więcej</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-surface-border px-4 py-3">
          <p className="mb-1.5 text-caption">Twoja klasa</p>
          <NavbarClassBadge
            linkToProfile={isLoggedIn}
            className="mb-2"
          />
          {!isLoggedIn && (
            <SchoolClassPicker
              id="more-sheet-class"
              value={schoolClass}
              onChange={setSchoolClass}
            />
          )}
          {isLoggedIn && (
            <p className="mt-2 text-caption text-muted">
              Zmiana klasy w{" "}
              <Link href="/profil#klasa" className="font-semibold text-accent">
                profilu
              </Link>
            </p>
          )}
        </div>

        <nav className="overflow-y-auto px-2 py-3">
          {MOBILE_MORE_GROUPS.map((group, index) => (
            <div
              key={group.label ?? "misc"}
              className={index > 0 ? "mt-3 border-t border-surface-border pt-3" : ""}
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
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          ))}

          {isLoggedIn && onLogout && (
            <div className="mt-3 border-t border-surface-border px-1 pt-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
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
