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
        className={`rounded-3xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-zinc-900/80 p-5 backdrop-blur-xl sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/20">
            {enabled ? (
              <Bell className="h-5 w-5 text-orange-300" aria-hidden />
            ) : (
              <BellOff className="h-5 w-5 text-zinc-400" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-orange-300">
              Przypomnienia o serii
            </h2>
            <p className="mt-1 text-sm text-zinc-300">
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  <Bell className="h-4 w-4" aria-hidden />
                  {enabling ? "Włączanie…" : "Włącz powiadomienia"}
                </button>
              )}
              {enabled && (
                <button
                  type="button"
                  onClick={handleDisable}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10"
                >
                  Wyłącz powiadomienia
                </button>
              )}
              {permission === "denied" && (
                <p className="text-xs text-zinc-500">
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
      className={`pointer-events-auto fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-lg rounded-2xl border border-orange-500/40 bg-zinc-900/95 p-4 shadow-xl shadow-orange-900/30 backdrop-blur-xl sm:left-auto sm:right-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/20">
          <Bell className="h-4 w-4 text-orange-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">Przypomnienia o serii</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Włącz powiadomienia, żeby wieczorem przypomnieć o zachowaniu passy.
            Bez zgody zostanie tylko baner w aplikacji.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={enabling}
              onClick={() => void handleEnable()}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-black text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {enabling ? "…" : "Włącz"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-400 transition hover:text-zinc-200"
            >
              Nie teraz
            </button>
            <Link
              href="/profil"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Ustawienia →
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-300"
          aria-label="Zamknij"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
