"use client";

import { isNavActive } from "@/lib/layout/mobile-nav";
import { Gamepad2, Swords, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId } from "react";

const GRAJ_LINKS = [
  {
    href: "/minigry",
    label: "Minigry",
    hint: "Szybki trening w grach",
    icon: Gamepad2,
  },
  {
    href: "/pojedynki",
    label: "Pojedynki",
    hint: "Rywalizacja z innymi",
    icon: Swords,
  },
  {
    href: "/wyzwania",
    label: "Wyzwanie dnia",
    hint: "Jedno zadanie na timer",
    icon: Trophy,
  },
] as const;

type GrajHubSheetProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

export function GrajHubSheet({ open, onClose, pathname }: GrajHubSheetProps) {
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
        aria-label="Zamknij"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        id={sheetId}
        role="dialog"
        aria-modal="true"
        aria-label="Graj"
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-surface-border sheet-surface pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Graj</p>
            <p className="text-caption">Wybierz tryb</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="grid gap-2 p-3">
          {GRAJ_LINKS.map(({ href, label, hint, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                  active
                    ? "border-accent/30 bg-accent/10"
                    : "border-surface-border bg-surface hover:border-accent/20 hover:bg-surface-hover"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-accent/20 text-accent" : "bg-surface-hover text-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="mt-0.5 block text-caption">{hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
