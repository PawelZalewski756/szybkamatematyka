"use client";

import { getSupabaseOrNull } from "@/lib/supabase";
import { Loader2, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Diagnostics = {
  ok: boolean;
  checkedAt?: string;
  error?: string;
  config: {
    botToken: boolean;
    adminIds: number;
    serviceRole: boolean;
    siteUrl: boolean;
    webhookSecret: boolean;
  };
  bot?: {
    ok: boolean;
    id?: string | number | null;
    username?: string | null;
    error?: string;
  };
  webhook?: {
    ok: boolean;
    url?: string;
    pendingUpdates?: number;
    lastError?: string;
    error?: string;
  };
  admins?: Array<{ id: string; ok: boolean; error?: string }>;
};

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={ok ? "text-success" : "text-danger"}>
      {ok ? "✅" : "❌"} {children}
    </span>
  );
}

export function TelegramDiagnosticsClient() {
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (sendTest: boolean) => {
    setError(null);
    if (sendTest) setSending(true);
    else setLoading(true);

    try {
      const supabase = getSupabaseOrNull();
      const {
        data: { session },
      } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };

      if (!session?.access_token) {
        throw new Error("Brak sesji. Zaloguj się jako administrator.");
      }

      const response = await fetch("/api/telegram/diagnostics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ sendTest }),
      });
      const payload = (await response.json().catch(() => ({}))) as Diagnostics & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? `Diagnostyka zwróciła ${response.status}.`);
      }
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się sprawdzić Telegrama.");
    } finally {
      setLoading(false);
      setSending(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(false);
  }, [run]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/admin" className="text-sm font-semibold text-muted hover:text-accent">
        ← Panel administratora
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-black text-foreground">Telegram</h1>
        <p className="mt-2 text-sm text-muted">
          Sprawdź, czy bot ma token, czy zna odbiorców i czy potrafi do nich
          napisać. Test wyśle prawdziwą wiadomość na Telegram.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void run(false)}
          disabled={loading || sending}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-accent/50 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sprawdź konfigurację
        </button>
        <button
          type="button"
          onClick={() => void run(true)}
          disabled={loading || sending}
          className="btn-chunky inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Wyślij testową wiadomość
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <section className="rounded-2xl border border-surface-border bg-surface p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-muted">
              Konfiguracja
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Status ok={data.config.botToken}>TELEGRAM_BOT_TOKEN</Status></li>
              <li>
                <Status ok={data.config.adminIds > 0}>
                  TELEGRAM_ADMIN_IDS ({data.config.adminIds})
                </Status>
              </li>
              <li><Status ok={data.config.serviceRole}>SUPABASE_SERVICE_ROLE_KEY</Status></li>
              <li><Status ok={data.config.webhookSecret}>TELEGRAM_WEBHOOK_SECRET</Status></li>
              <li><Status ok={data.config.siteUrl}>NEXT_PUBLIC_SITE_URL</Status></li>
            </ul>
          </section>

          <section className="rounded-2xl border border-surface-border bg-surface p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-muted">
              Bot
            </h2>
            <p className="mt-3 text-sm">
              {data.bot?.ok ? (
                <Status ok>
                  @{data.bot.username ?? "?"} (id {String(data.bot.id ?? "?")})
                </Status>
              ) : (
                <Status ok={false}>{data.bot?.error ?? "Brak odpowiedzi getMe."}</Status>
              )}
            </p>
            <p className="mt-2 text-sm">
              {data.webhook?.ok ? (
                <>
                  <Status ok={Boolean(data.webhook.url)}>
                    Webhook: {data.webhook.url || "brak"}
                  </Status>
                  {typeof data.webhook.pendingUpdates === "number" &&
                    data.webhook.pendingUpdates > 0 && (
                      <span className="ml-2 text-amber-600">
                        (oczekuje: {data.webhook.pendingUpdates})
                      </span>
                    )}
                  {data.webhook.lastError && (
                    <span className="mt-1 block text-danger">
                      Ostatni błąd: {data.webhook.lastError}
                    </span>
                  )}
                </>
              ) : (
                <Status ok={false}>{data.webhook?.error ?? "Brak getWebhookInfo."}</Status>
              )}
            </p>
          </section>

          {data.admins && data.admins.length > 0 && (
            <section className="rounded-2xl border border-surface-border bg-surface p-5">
              <h2 className="text-sm font-black uppercase tracking-wide text-muted">
                Test wysyłki
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.admins.map((admin) => (
                  <li key={admin.id}>
                    <Status ok={admin.ok}>
                      {admin.id}
                      {admin.error ? ` - ${admin.error}` : ""}
                    </Status>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.error && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
              {data.error}
            </p>
          )}

          <p className="text-xs text-muted">
            Najczęstszy błąd 403 oznacza, że administrator nie wysłał do bota
            <code className="mx-1 rounded bg-surface-hover px-1">/start</code>
            na prywatnym czacie. Błąd 400 „chat not found” oznacza złe
            <code className="mx-1 rounded bg-surface-hover px-1">TELEGRAM_ADMIN_IDS</code>.
          </p>
        </div>
      )}
    </div>
  );
}
