export type ParsedSentryDsn = {
  publicKey: string;
  host: string;
  projectId: string;
  envelopeUrl: string;
};

/** Parsuje klasyczny DSN Sentry (`https://key@host/projectId`). */
export function parseSentryDsn(dsn: string | undefined | null): ParsedSentryDsn | null {
  const raw = dsn?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const publicKey = decodeURIComponent(url.username || "").trim();
    const projectId = url.pathname.replace(/^\/+/, "").split("/")[0]?.trim();
    if (!publicKey || !url.host || !projectId) return null;
    return {
      publicKey,
      host: url.host,
      projectId,
      envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}

export function getServerSentryDsn(): string | null {
  const dsn =
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
    "";
  return dsn || null;
}
