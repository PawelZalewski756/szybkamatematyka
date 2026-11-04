"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "sm-theme";

type Theme = "light" | "dark";

/** Wykonywany inline w <head>, zanim React się zhydratuje — bez migania motywu. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#faf7f0":"#0f0e0b")}catch(e){}`;

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#faf7f0" : "#0f0e0b");
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Brak dostępu do localStorage — motyw działa do końca sesji.
  }
}

type ThemeToggleProps = {
  /** Wariant z etykietą tekstową (menu mobilne). */
  withLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ withLabel = false, className = "" }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: Theme = theme === "light" ? "dark" : "light";
  const label = next === "light" ? "Włącz jasny motyw" : "Włącz ciemny motyw";
  const Icon = theme === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={
        withLabel
          ? `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-hover ${className}`
          : `inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-hover hover:text-foreground ${className}`
      }
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {withLabel ? (
        <span suppressHydrationWarning>
          {theme === "light" ? "Ciemny motyw" : "Jasny motyw"}
        </span>
      ) : null}
    </button>
  );
}
