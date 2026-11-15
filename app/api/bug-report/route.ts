import { isIP } from "node:net";

import {
  BUG_REPORT_LIMITS,
  bugReportAttachmentName,
  buildBugReportEmail,
  isBugReportAttachmentType,
  matchesImageSignature,
  parseBugReportFields,
} from "@/lib/bug-report/report";
import { CONTACT_EMAIL } from "@/lib/brand/constants";

export const runtime = "nodejs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Szybka Matematyka <onboarding@resend.dev>";

/** Limit żądań trzymany w pamięci procesu - działa per instancja (jak reszta API). */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_BUCKETS = new Map<
  string,
  { count: number; resetAt: number }
>();

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientIp(request: Request): string | null {
  const headerName =
    process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : "x-forwarded-for";
  const rawIp = request.headers.get(headerName)?.split(",")[0]?.trim();
  if (rawIp && isIP(rawIp)) return rawIp;
  return process.env.NODE_ENV === "production" ? null : "127.0.0.1";
}

/** Zwraca false, gdy adres przekroczył limit zgłoszeń w bieżącym oknie. */
function consumeRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    RATE_LIMIT_BUCKETS.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    if (bucket.count >= RATE_LIMIT_MAX) return false;
    bucket.count += 1;
  }

  if (RATE_LIMIT_BUCKETS.size > 1000) {
    for (const [key, value] of RATE_LIMIT_BUCKETS) {
      if (value.resetAt <= now) RATE_LIMIT_BUCKETS.delete(key);
    }
  }
  return true;
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json({ error: "Nieprawidłowe źródło żądania." }, 403);
      }
    } catch {
      return json({ error: "Nieprawidłowe źródło żądania." }, 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 6 * 1024 * 1024) {
    return json({ error: "Zgłoszenie jest za duże (maks. 6 MB)." }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Nie udało się odczytać formularza." }, 400);
  }

  // Ukryte pole wypełniają tylko boty - udajemy sukces, żeby nie zdradzać pułapki.
  if (String(form.get("website") ?? "").trim().length > 0) {
    return json({ ok: true });
  }

  const parsed = parseBugReportFields({
    email: form.get("email"),
    title: form.get("title"),
    description: form.get("description"),
  });
  if (!parsed.ok) {
    return json({ error: parsed.error }, 422);
  }

  const ip = getClientIp(request);
  if (!ip) {
    return json(
      { error: "Nie można teraz przyjąć zgłoszenia. Spróbuj ponownie później." },
      503,
    );
  }
  if (!consumeRateLimit(ip)) {
    return json(
      {
        error:
          "Wysłano już kilka zgłoszeń z tego adresu. Spróbuj ponownie za godzinę.",
      },
      429,
    );
  }

  let attachment: { filename: string; content: string } | undefined;
  const rawAttachment = form.get("attachment");
  if (rawAttachment instanceof File && rawAttachment.size > 0) {
    if (rawAttachment.size > BUG_REPORT_LIMITS.attachmentMaxBytes) {
      return json({ error: "Załącznik jest za duży (maks. 3 MB)." }, 413);
    }
    if (!isBugReportAttachmentType(rawAttachment.type)) {
      return json(
        { error: "Załącznik musi być obrazem (PNG, JPG, WEBP lub GIF)." },
        415,
      );
    }

    const bytes = new Uint8Array(await rawAttachment.arrayBuffer());
    if (!matchesImageSignature(rawAttachment.type, bytes)) {
      return json({ error: "Załącznik nie jest poprawnym obrazem." }, 415);
    }
    attachment = {
      filename: bugReportAttachmentName(rawAttachment.type),
      content: Buffer.from(bytes).toString("base64"),
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.BUG_REPORT_TO?.trim() || CONTACT_EMAIL;
  const from = process.env.BUG_REPORT_FROM?.trim() || DEFAULT_FROM;
  if (!apiKey || !to.includes("@")) {
    console.error(
      "[bug-report] Brak konfiguracji: ustaw RESEND_API_KEY i BUG_REPORT_TO (poprawny adres).",
    );
    return json(
      {
        error:
          "Formularz zgłoszeń nie jest jeszcze skonfigurowany. Napisz na kontakt@szybkamatematyka.pl.",
      },
      503,
    );
  }

  const { subject, text, html } = buildBugReportEmail({
    fields: parsed.fields,
    pageUrl: String(form.get("pageUrl") ?? "").slice(
      0,
      BUG_REPORT_LIMITS.pageUrlMax,
    ),
    userAgent: String(form.get("userAgent") ?? "").slice(
      0,
      BUG_REPORT_LIMITS.userAgentMax,
    ),
    submittedAt: new Date(),
    hasAttachment: Boolean(attachment),
  });

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: parsed.fields.email,
        subject,
        text,
        html,
        ...(attachment ? { attachments: [attachment] } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(
        "[bug-report] Resend odrzucił wiadomość:",
        response.status,
        details.slice(0, 300),
      );
      return json(
        { error: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę." },
        502,
      );
    }
  } catch (error) {
    console.error("[bug-report] Wysyłka nie powiodła się:", error);
    return json(
      { error: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę." },
      502,
    );
  }

  return json({ ok: true });
}
