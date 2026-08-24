import { logError } from "@/lib/observability/logger";
import {
  getServerSentryDsn,
  parseSentryDsn,
} from "@/lib/observability/sentry-dsn";

export type ErrorContext = Record<string, string | number | boolean | null | undefined>;

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

function errorName(error: unknown): string {
  if (error instanceof Error) return error.name;
  return "Error";
}

function errorDigest(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = (error as { digest?: unknown }).digest;
    if (digest != null) return String(digest);
  }
  return undefined;
}

async function sendToSentry(
  error: unknown,
  context: ErrorContext | undefined,
): Promise<void> {
  const parsed = parseSentryDsn(getServerSentryDsn());
  if (!parsed) return;

  const eventId = crypto.randomUUID().replace(/-/g, "");
  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: "node",
    level: "error",
    server_name: "szybkamatematyka",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    exception: {
      values: [
        {
          type: errorName(error),
          value: errorMessage(error).slice(0, 1000),
        },
      ],
    },
    tags: {
      digest: errorDigest(error),
    },
    extra: context ?? {},
  };

  const envelopeHeader = JSON.stringify({
    event_id: eventId,
    dsn: getServerSentryDsn(),
    sent_at: new Date().toISOString(),
  });
  const itemHeader = JSON.stringify({ type: "event", content_type: "application/json" });
  const body = `${envelopeHeader}\n${itemHeader}\n${JSON.stringify(event)}`;

  const auth = [
    "Sentry sentry_version=7",
    `sentry_client=szybkamatematyka/1.0`,
    `sentry_key=${parsed.publicKey}`,
  ].join(", ");

  try {
    const response = await fetch(parsed.envelopeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": auth,
      },
      body,
    });
    if (!response.ok) {
      logError("sentry.envelope_rejected", { status: response.status });
    }
  } catch (sendError) {
    logError("sentry.envelope_failed", {
      message: sendError instanceof Error ? sendError.message : "send failed",
    });
  }
}

/** Loguje błąd i opcjonalnie wysyła go do Sentry, gdy ustawiono DSN. */
export async function reportError(
  error: unknown,
  context?: ErrorContext,
): Promise<void> {
  const digest = errorDigest(error);
  logError("app.error", {
    name: errorName(error),
    message: errorMessage(error).slice(0, 500),
    digest,
    ...context,
  });
  await sendToSentry(error, context);
}

export function reportErrorSync(error: unknown, context?: ErrorContext): void {
  void reportError(error, context);
}
