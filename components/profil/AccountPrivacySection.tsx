"use client";

import { getSupabaseAccessToken } from "@/lib/supabase";
import { Loader2, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LOCAL_PREFIXES = [
  "szybka-matma-",
  "sm_",
  "szybka-matma-onboarding-dismissed",
];

function clearLocalAccountData(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (LOCAL_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keys.push(key);
      }
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function AccountPrivacySection() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function authHeaders(): Promise<HeadersInit | null> {
    const token = await getSupabaseAccessToken();
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async function handleExport() {
    setMessage(null);
    setExporting(true);
    try {
      const headers = await authHeaders();
      if (!headers) {
        setIsError(true);
        setMessage("Zaloguj się ponownie, żeby pobrać dane.");
        return;
      }
      const response = await fetch("/api/account/export", {
        method: "POST",
        headers,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setIsError(true);
        setMessage(body?.error ?? "Nie udało się pobrać eksportu.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "szybkamatematyka-konto.json";
      link.click();
      URL.revokeObjectURL(url);
      setIsError(false);
      setMessage("Zapisano plik z danymi konta.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setMessage(null);
    setDeleting(true);
    try {
      const headers = await authHeaders();
      if (!headers) {
        setIsError(true);
        setMessage("Zaloguj się ponownie, żeby usunąć konto.");
        return;
      }
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ confirm }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;
      if (!response.ok) {
        setIsError(true);
        setMessage(body?.error ?? "Nie udało się usunąć konta.");
        return;
      }
      clearLocalAccountData();
      router.replace("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      id="dane-konta"
      className="mt-10 rounded-2xl border border-surface-border bg-white/5 p-5 sm:p-6"
    >
      <h2 className="text-lg font-black text-white">Twoje dane</h2>
      <p className="mt-2 text-sm text-muted">
        Możesz pobrać kopię danych z serwisu albo trwale usunąć konto. Usunięcie
        kasuje profil, postęp, powtórki i awatar. Tej operacji nie da się
        cofnąć.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={exporting || deleting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm font-bold text-foreground disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          Pobierz moje dane
        </button>
      </div>

      <div className="mt-6 border-t border-surface-border pt-5">
        <p className="text-sm font-semibold text-foreground">Usuń konto</p>
        <label className="mt-2 block text-xs text-muted" htmlFor="delete-confirm">
          Wpisz USUN, żeby potwierdzić
        </label>
        <input
          id="delete-confirm"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="mt-1 w-full max-w-xs rounded-2xl border border-surface-border bg-background px-3 py-2 text-sm text-white"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting || exporting || confirm.trim() !== "USUN"}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-red-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden />
          )}
          Usuń konto na stałe
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm font-semibold ${isError ? "text-danger" : "text-success"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </section>
  );
}
