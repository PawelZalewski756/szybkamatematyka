import { BRAND_NAME, CONTACT_EMAIL } from "@/lib/brand/constants";

export type WelcomeEmailInput = {
  to: string;
  nick: string;
  siteUrl: string;
};

export type WelcomeEmailResult =
  | { ok: true }
  | { ok: false; error: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sender(): string {
  return (
    process.env.WELCOME_EMAIL_FROM?.trim() ||
    process.env.BUG_REPORT_FROM?.trim() ||
    `${BRAND_NAME} <onboarding@resend.dev>`
  );
}

export function isWelcomeEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function welcomeEmailHtml(input: WelcomeEmailInput): string {
  const site = input.siteUrl.replace(/\/$/, "");
  const nick = escapeHtml(input.nick.trim() || "uczniu");
  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;background:#faf7f0;font-family:Arial,Helvetica,sans-serif;color:#1f1b16">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <h1 style="font-size:24px;margin:0 0 12px">Cześć, ${nick}!</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">
        Dziękujemy za założenie konta w ${BRAND_NAME}. Najprostszy start to
        krótka diagnoza - 8 pytań, po których zobaczysz, od czego zacząć.
      </p>
      <p style="margin:0 0 20px">
        <a href="${site}/diagnostyka" style="display:inline-block;background:#b45309;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold">
          Zrób diagnozę startową
        </a>
      </p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 10px">
        Potem możesz:
      </p>
      <ul style="font-size:15px;line-height:1.7;padding-left:20px;margin:0 0 18px">
        <li><a href="${site}/trening" style="color:#b45309">przejść do treningu tematycznego</a>,</li>
        <li><a href="${site}/plan-klasy" style="color:#b45309">zobaczyć plan dla swojej klasy</a>,</li>
        <li><a href="${site}/trening/arkusze" style="color:#b45309">sprawdzić się na arkuszach CKE</a>.</li>
      </ul>
      <p style="font-size:13px;line-height:1.6;color:#6b6257;margin:0">
        Masz pytanie? Odpisz na tę wiadomość albo napisz na
        <a href="mailto:${CONTACT_EMAIL}" style="color:#b45309">${CONTACT_EMAIL}</a>.
      </p>
    </div>
  </body>
</html>`;
}

/**
 * Best-effort welcome email przez Resend. Bez zweryfikowanej domeny Resend
 * odrzuci wysyłkę do obcego adresu - wtedy tylko logujemy błąd i nie blokujemy
 * rejestracji.
 */
export async function sendWelcomeEmail(
  input: WelcomeEmailInput,
): Promise<WelcomeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "not configured" };
  if (!input.to.trim()) return { ok: false, error: "missing recipient" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender(),
        to: [input.to],
        subject: `Witaj w ${BRAND_NAME} - zacznij od diagnozy`,
        html: welcomeEmailHtml(input),
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        error: `Resend ${response.status}: ${detail.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Błąd sieci.",
    };
  }
}
