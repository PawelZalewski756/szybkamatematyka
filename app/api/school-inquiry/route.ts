import { CONTACT_EMAIL } from "@/lib/brand/constants";
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  // Honeypot: boty wypełniają ukryte pole.
  if (clean(body.website, 100)) {
    return Response.json({ ok: true });
  }

  // Publiczna skrzynka mailowa - bez limitu dawała się zalać spamem
  // i wyczerpać kwotę Resend.
  const limit = checkRateLimit(`school-inquiry:${clientIp(request)}`, {
    limit: 8,
    windowMs: 10 * 60_000,
  });
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const school = clean(body.school, 160);
  const name = clean(body.name, 80);
  const email = clean(body.email, 160);
  const message = clean(body.message, 2000);
  const consent = body.consent === true;

  if (school.length < 2) {
    return Response.json({ error: "Podaj nazwę szkoły." }, { status: 400 });
  }
  if (name.length < 2) {
    return Response.json({ error: "Podaj imię i nazwisko." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Podaj poprawny e-mail." }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json(
      { error: "Napisz kilka słów o potrzebach szkoły (min. 10 znaków)." },
      { status: 400 },
    );
  }
  if (!consent) {
    return Response.json(
      { error: "Zaznacz zgodę na kontakt w sprawie pakietu szkolnego." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.BUG_REPORT_TO?.trim() || CONTACT_EMAIL;
  const from =
    process.env.BUG_REPORT_FROM?.trim() ||
    "Szybka Matematyka <onboarding@resend.dev>";

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Formularz jest chwilowo niedostępny. Napisz bezpośrednio na " +
          CONTACT_EMAIL +
          ".",
      },
      { status: 503 },
    );
  }

  const html = `
    <h2>Zapytanie o pakiet szkolny</h2>
    <p><strong>Szkoła:</strong> ${escapeHtml(school)}</p>
    <p><strong>Osoba:</strong> ${escapeHtml(name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
    <p><strong>Wiadomość:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Pakiet szkolny: ${school}`,
        html,
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[school-inquiry] Resend error:", response.status, detail.slice(0, 200));
      return Response.json(
        { error: "Nie udało się wysłać zapytania. Spróbuj ponownie." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[school-inquiry] send failed:", error);
    return Response.json(
      { error: "Nie udało się wysłać zapytania. Spróbuj ponownie." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
