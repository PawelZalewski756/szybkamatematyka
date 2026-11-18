import { BRAND_NAME, CONTACT_EMAIL } from "@/lib/brand/constants";

export type BugReportApologyInput = {
  to: string;
  name?: string | null;
  siteUrl?: string;
};

export type BugReportApologyResult =
  | { ok: true }
  | { ok: false; error: string };

export const BUG_REPORT_APOLOGY_SUBJECT =
  "Przepraszamy za błąd w zadaniu — miesiąc Pro od Szybkiej Matematyki";

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
    process.env.BUG_REPORT_FROM?.trim() ||
    process.env.WELCOME_EMAIL_FROM?.trim() ||
    `${BRAND_NAME} <onboarding@resend.dev>`
  );
}

export function isBugReportApologyConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function bugReportApologyText(input: BugReportApologyInput): string {
  const site = (input.siteUrl ?? "https://www.szybkamatematyka.pl").replace(
    /\/$/,
    "",
  );
  return [
    `Dzień dobry${input.name ? `, ${input.name}` : ""},`,
    "",
    "dziękujemy za zgłoszenie błędu w zadaniu. Przepraszamy — strona jest nowa, a my wciąż uczymy się jej słabych miejsc. Twoje zgłoszenie było dla nas bardzo cenne: pomogło nam znaleźć i naprawić błąd.",
    "",
    "Wszystkie zgłoszone zadania sprawdzamy i poprawiamy. Dodaliśmy też automatyczny audyt, który wykrywa złe odpowiedzi, zepsute wzory i zadania przypisane do niewłaściwego tematu — dzięki temu kolejne zgłoszenia będziemy naprawiać szybciej.",
    "",
    "W ramach przeprosin przyznajemy Ci miesiąc planu Pro za darmo. Nie musisz podawać karty. To Pro nie odnawia się automatycznie i nie ma subskrypcji Stripe, więc nie można go anulować — po prostu wygaśnie po miesiącu.",
    "",
    `Jeśli znajdziesz kolejny błąd, napisz na ${CONTACT_EMAIL}. Będziemy wdzięczni — każde zgłoszenie pomaga nam robić stronę lepszą.`,
    "",
    "Pozdrawiamy,",
    "zespół Szybka Matematyka",
    site,
  ].join("\n");
}

export function bugReportApologyHtml(input: BugReportApologyInput): string {
  const site = (input.siteUrl ?? "https://www.szybkamatematyka.pl").replace(
    /\/$/,
    "",
  );
  const name = input.name ? `, ${escapeHtml(input.name)}` : "";
  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;background:#faf7f0;font-family:Arial,Helvetica,sans-serif;color:#1f1b16">
    <div style="max-width:580px;margin:0 auto;padding:32px 20px">
      <h1 style="font-size:24px;line-height:1.3;margin:0 0 16px">Przepraszamy za błąd w zadaniu${name}</h1>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px">
        Dziękujemy za zgłoszenie. Strona jest nowa, a my wciąż uczymy się jej
        słabych miejsc — Twoja wiadomość pomogła nam znaleźć i naprawić błąd.
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px">
        Wszystkie zgłoszone zadania sprawdzamy i poprawiamy. Dodaliśmy też
        automatyczny audyt, który wykrywa złe odpowiedzi, zepsute wzory i
        zadania przypisane do niewłaściwego tematu. Dzięki temu kolejne
        zgłoszenia będziemy naprawiać szybciej.
      </p>
      <div style="background:#fdf0d3;border:1px solid #e0a022;border-radius:12px;padding:16px;margin:18px 0">
        <p style="font-size:15px;line-height:1.6;margin:0 0 8px;font-weight:bold">
          W ramach przeprosin przyznajemy Ci miesiąc planu Pro za darmo.
        </p>
        <p style="font-size:14px;line-height:1.6;margin:0">
          Nie musisz podawać karty. To Pro nie odnawia się automatycznie i nie
          ma subskrypcji Stripe, więc nie można go anulować — po prostu
          wygaśnie po miesiącu.
        </p>
      </div>
      <p style="font-size:15px;line-height:1.65;margin:0 0 14px">
        Jeśli znajdziesz kolejny błąd, napisz na
        <a href="mailto:${CONTACT_EMAIL}" style="color:#b45309">${CONTACT_EMAIL}</a>.
        Każde zgłoszenie pomaga nam robić stronę lepszą.
      </p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 4px">
        Pozdrawiamy,<br />zespół Szybka Matematyka
      </p>
      <p style="font-size:13px;line-height:1.6;margin:0">
        <a href="${site}" style="color:#b45309">${site}</a>
      </p>
    </div>
  </body>
</html>`;
}

/** Wysyłka przez Resend. Bez klucza zwraca błąd konfiguracji (nie rzuca). */
export async function sendBugReportApology(
  input: BugReportApologyInput,
): Promise<BugReportApologyResult> {
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
        subject: BUG_REPORT_APOLOGY_SUBJECT,
        html: bugReportApologyHtml(input),
        text: bugReportApologyText(input),
      }),
      signal: AbortSignal.timeout(10_000),
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
