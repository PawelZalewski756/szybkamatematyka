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
  });
  const result = (await response.json()) as { ok?: boolean; description?: string };
  if (!response.ok || !result.ok) {
    console.error("Telegram setWebhook failed:", result.description ?? response.status);
    return Response.json({ error: "Telegram rejected webhook setup." }, { status: 502 });
  }

  return Response.json({ ok: true, message: "Telegram webhook is configured." });
}
