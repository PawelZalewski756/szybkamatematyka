"use client";

import { NavbarClassBadge } from "@/components/NavbarClassBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import { useLearningPath } from "@/components/LearningPathProvider";
import { isNavActive } from "@/lib/layout/mobile-nav";
import {
  Award,
  CreditCard,
  FileText,
  LogOut,
  Mail,
  RotateCcw,
  Shield,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type MobileMoreLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type MobileMoreGroup = {
  label: string | null;
  links: readonly MobileMoreLink[];
};

const MOBILE_MORE_GROUPS: readonly MobileMoreGroup[] = [
  {
    label: "Nauka",
    links: [{ href: "/powtorki", label: "Powtórki", icon: RotateCcw }],
  },
  {
    label: "Społeczność",
    links: [
      { href: "/rankingi", label: "Rankingi", icon: Trophy },
      { href: "/osiagniecia", label: "Osiągnięcia", icon: Award },
    ],
  },
  {
    label: null,
    links: [{ href: "/cennik", label: "Cennik", icon: CreditCard }],
  },
  {
    label: "Informacje",
    links: [
      { href: "/regulamin", label: "Regulamin", icon: FileText },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności", icon: Shield },
      { href: "/kontakt", label: "Kontakt", icon: Mail },
    ],
  },
];

function SheetLink({
  href,
  label,
  active,
  onNavigate,
  icon: Icon,
}: MobileMoreLink & { active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-surface-border bg-background/40 text-foreground hover:border-accent/20 hover:bg-surface-hover"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-accent/15" : "bg-surface-hover text-muted"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
}

type MoreSheetProps = {
  open: boolean;
  sheetId: string;
  onClose: () => void;
  pathname: string;
  isLoggedIn: boolean;
  onLogout?: () => void;
  loggingOut?: boolean;
};

export function MoreSheet({
  open,
  sheetId,
  onClose,
  pathname,
  isLoggedIn,
  onLogout,
  loggingOut = false,
}: MoreSheetProps) {
  const { path, setPath, clearPath, hasPathSelection } = useLearningPath();

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
        className="absolute inset-x-0 bottom-0 flex h-[min(85dvh,36rem)] flex-col overflow-hidden rounded-t-3xl border-t border-surface-border shadow-2xl sheet-surface pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]"
      >
        <div className="flex shrink-0 justify-center pt-2" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-muted/40" />
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-surface-border px-4 pb-3 pt-2">
          <div>
            <p className="text-sm font-bold text-foreground">Więcej</p>
            <p className="text-caption">Skróty i ustawienia</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-background/50 text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-surface-border px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-overline">Poziom nauki</p>
            {!isLoggedIn && (
              <SchoolClassPicker
                id="more-sheet-class"
                value={hasPathSelection ? path : ""}
                onChange={(next) => {
                  if (next) setPath(next);
                  else clearPath();
                }}
                optional
              />
            )}
            {isLoggedIn && (
              <NavbarClassBadge linkToProfile className="max-w-full" />
            )}
            {isLoggedIn && (
              <p className="mt-1 text-caption text-muted">
                Zmienisz w{" "}
                <Link
                  href="/profil#klasa"
                  className="font-semibold text-accent"
                >
                  profilu
                </Link>
              </p>
            )}
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <div className="mb-3 border-b border-surface-border pb-3">
            <SheetLink
              href={isLoggedIn ? "/profil" : "/login"}
              label={isLoggedIn ? "Mój profil" : "Zaloguj się lub załóż konto"}
              icon={UserRound}
              active={isNavActive(pathname, isLoggedIn ? "/profil" : "/login")}
              onNavigate={onClose}
            />
          </div>

          {MOBILE_MORE_GROUPS.map((group, index) => (
            <div
              key={group.label ?? "misc"}
              className={
                index > 0 ? "mt-4 border-t border-surface-border pt-3" : ""
              }
            >
              {group.label ? (
                <p className="mb-2 px-1 text-overline">{group.label}</p>
              ) : null}
              <div className="space-y-1.5">
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

          <div className="mt-3 border-t border-surface-border px-1 pt-3">
            <ThemeToggle withLabel />
          </div>

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
