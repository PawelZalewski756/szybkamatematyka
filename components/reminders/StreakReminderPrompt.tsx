"use client";

import {
  loadStreakReminderPrefs,
  saveStreakReminderPrefs,
  type StreakReminderPrefs,
} from "@/lib/reminders/storage";
import {
  canUseBrowserNotifications,
  getNotificationPermission,
  requestNotificationPermission,
} from "@/lib/reminders/notifications";
import { Bell, BellOff, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

type StreakReminderPromptProps = {
  /** W profilu — pełna karta zamiast pływającego banera. */
  variant?: "banner" | "card";
  className?: string;
};

function resolvePromptState(
  variant: "banner" | "card",
  prefs: StreakReminderPrefs,
): { visible: boolean; enabled: boolean } {
  const permission = getNotificationPermission();
  const enabled = prefs.notificationsEnabled && permission === "granted";

  if (variant === "card") {
    return { visible: canUseBrowserNotifications(), enabled };
  }

  return {
    visible:
      canUseBrowserNotifications() &&
      !prefs.promptDismissed &&
      !prefs.notificationsEnabled &&
      permission === "default",
    enabled,
  };
}

export function StreakReminderPrompt({
  variant = "banner",
  className = "",
}: StreakReminderPromptProps) {
  const [prefs, setPrefs] = useState(loadStreakReminderPrefs);
  const [enabling, setEnabling] = useState(false);
  const { visible, enabled } = resolvePromptState(variant, prefs);
  const permission = getNotificationPermission();

  const handleEnable = useCallback(async () => {
    setEnabling(true);
    try {
      const nextPermission = await requestNotificationPermission();
      const granted = nextPermission === "granted";
      setPrefs(
        saveStreakReminderPrefs({
          notificationsEnabled: granted,
          promptDismissed: true,
        }),
      );
    } finally {
      setEnabling(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setPrefs(saveStreakReminderPrefs({ promptDismissed: true }));
  }, []);

  const handleDisable = useCallback(() => {
    setPrefs(saveStreakReminderPrefs({ notificationsEnabled: false }));
  }, []);

  if (!visible && variant === "banner") return null;

  if (variant === "card") {
    return (
      <section
        className={`rounded-3xl border border-accent/25 bg-accent-soft p-5 sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="icon-chip flex h-10 w-10 shrink-0 rounded-2xl">
            {enabled ? (
              <Bell className="h-5 w-5" aria-hidden />
            ) : (
              <BellOff className="h-5 w-5 text-muted" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-overline text-accent">Przypomnienia o serii</h2>
            <p className="mt-1 text-sm text-foreground">
              {permission === "unsupported"
                ? "Twoja przeglądarka nie obsługuje powiadomień — przypomnimy Ci w aplikacji."
                : enabled
                  ? "Powiadomienia włączone. Wieczorem przypomnimy, jeśli nie zagrasz dziś."
                  : permission === "denied"
                    ? "Powiadomienia zablokowane w przeglądarce — nadal zobaczysz baner w aplikacji."
                    : "Włącz przypomnienia, żeby nie stracić serii dni z grą."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {permission !== "unsupported" && !enabled && permission !== "denied" && (
                <button
                  type="button"
                  disabled={enabling}
                  onClick={() => void handleEnable()}
                  className="btn-chunky inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
                >
                  <Bell className="h-4 w-4" aria-hidden />
                  {enabling ? "Włączanie…" : "Włącz powiadomienia"}
                </button>
              )}
              {enabled && (
                <button
                  type="button"
                  onClick={handleDisable}
                  className="btn-chunky-soft rounded-2xl px-4 py-2 text-sm"
                >
                  Wyłącz powiadomienia
                </button>
              )}
              {permission === "denied" && (
                <p className="text-caption">
                  Odblokuj powiadomienia w ustawieniach przeglądarki dla tej strony.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      role="status"
      className={`pointer-events-auto fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-lg rounded-2xl border border-accent/35 bg-surface/95 p-4 shadow-xl backdrop-blur-xl sm:left-auto sm:right-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="icon-chip flex h-9 w-9 shrink-0 rounded-xl">
          <Bell className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground">Przypomnienia o serii</p>
          <p className="mt-0.5 text-xs text-muted">
            Włącz powiadomienia, żeby wieczorem przypomnieć o zachowaniu passy.
            Bez zgody zostanie tylko baner w aplikacji.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={enabling}
              onClick={() => void handleEnable()}
              className="btn-chunky rounded-xl px-3 py-1.5 text-xs disabled:opacity-60"
            >
              {enabling ? "…" : "Włącz"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-bold text-muted transition hover:text-foreground"
            >
              Nie teraz
            </button>
            <Link
              href="/profil"
              className="text-xs font-semibold text-accent hover:text-accent-strong"
            >
              Ustawienia →
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1 text-muted transition hover:bg-surface-hover hover:text-foreground"
          aria-label="Zamknij"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
