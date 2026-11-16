"use client";

import { getSupabase } from "@/lib/supabase";
import { AlertTriangle, Download, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Samodzielne usunięcie konta - wymaga wpisania „USUŃ” i sesji. */
export function DeleteAccountCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setExportError("Sesja wygasła. Zaloguj się ponownie.");
        return;
      }

      const response = await fetch("/api/account/export", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setExportError(
          payload?.error ?? "Nie udało się pobrać danych. Spróbuj ponownie.",
        );
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "szybka-matematyka-dane.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Safari potrafi przerwać pobieranie przy natychmiastowym revoke.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError("Nie udało się pobrać danych. Spróbuj ponownie.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);

    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Sesja wygasła. Zaloguj się ponownie.");
        return;
      }

      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmation }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Nie udało się usunąć konta.");
        return;
      }

      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-danger/35 bg-danger/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-foreground">Twoje dane</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Możesz pobrać kopię swoich danych albo usunąć konto. Usunięcie
            obejmuje profil, postępy, powtórki, odznaki i avatar - tej operacji
            nie można cofnąć. Aktywną subskrypcję anuluj najpierw w sekcji
            „Twój plan”.
          </p>

          {exportError ? (
            <p className="mt-2 text-xs font-semibold text-danger" role="alert">
              {exportError}
            </p>
          ) : null}

          {!open ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-xs font-bold text-foreground transition hover:border-accent/50 hover:text-accent disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-3.5 w-3.5" aria-hidden />
                )}
                {exporting ? "Przygotowuję…" : "Pobierz moje dane"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-danger/40 px-3 py-2 text-xs font-bold text-danger transition hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Usuń konto
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <label
                htmlFor="delete-account-confirmation"
                className="block text-xs font-semibold text-foreground"
              >
                Wpisz <span className="font-black">USUŃ</span>, żeby potwierdzić
              </label>
              <input
                id="delete-account-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-danger/60 focus:ring-2 focus:ring-danger/20"
              />
              {error ? (
                <p className="text-xs font-semibold text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={confirmation !== "USUŃ" || deleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-danger px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {deleting ? "Usuwam…" : "Trwale usuń konto"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirmation("");
                    setError(null);
                  }}
                  disabled={deleting}
                  className="rounded-lg border border-surface-border px-3 py-2 text-xs font-bold text-foreground disabled:opacity-50"
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
