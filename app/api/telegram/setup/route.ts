import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function matchesSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function POST(request: Request): Promise<Response> {
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!setupSecret || !botToken || !webhookSecret || !siteUrl) {
    return Response.json({ error: "Telegram setup is not configured." }, { status: 503 });
  }

  if (!matchesSecret(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null, setupSecret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let origin: URL;
  try {
    origin = new URL(siteUrl);
  } catch {
    return Response.json({ error: "Invalid site URL." }, { status: 500 });
  }
  if (origin.protocol !== "https:") {
    return Response.json({ error: "Telegram webhook requires HTTPS." }, { status: 500 });
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: new URL("/api/telegram/webhook", origin).toString(),
      secret_token: webhookSecret,
      allowed_updates: ["message"],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  const result = (await response.json()) as { ok?: boolean; description?: string };
  if (!response.ok || !result.ok) {
    console.error("Telegram setWebhook failed:", result.description ?? response.status);
    return Response.json({ error: "Telegram rejected webhook setup." }, { status: 502 });
  }

  const commands = [
    { command: "stats", description: "Konta, profile i rozwiązane zadania" },
    { command: "new", description: "Ostatnie rejestracje" },
    { command: "users", description: "Lista użytkowników" },
    { command: "top", description: "Ranking XP" },
    { command: "szybkaproba", description: "Statystyki szybkiej próby" },
    { command: "visits", description: "Wejścia na stronę" },
    { command: "health", description: "Diagnostyka bota i webhooka" },
    { command: "pomoc", description: "Lista komend" },
  ];
  const commandsResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/setMyCommands`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ commands }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );
  const commandsResult = (await commandsResponse.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
  };
  const warnings: string[] = [];
  if (!commandsResponse.ok || !commandsResult.ok) {
    warnings.push(
      `Nie udało się ustawić menu komend: ${
        commandsResult.description ?? commandsResponse.status
      }`,
    );
  }

  const infoResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    { cache: "no-store", signal: AbortSignal.timeout(8_000) },
  );
  const info = (await infoResponse.json().catch(() => ({}))) as {
    ok?: boolean;
    result?: Record<string, unknown>;
  };

  return Response.json({
    ok: true,
    message: "Telegram webhook i menu komend są skonfigurowane.",
    webhook: info.result ?? null,
    warnings,
  });
}
