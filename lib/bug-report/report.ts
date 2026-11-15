import { BRAND_NAME } from "@/lib/brand/constants";

/** Limity formularza zgłoszenia błędu - wspólne dla klienta i API. */
export const BUG_REPORT_LIMITS = {
  emailMax: 200,
  titleMin: 3,
  titleMax: 120,
  descriptionMin: 10,
  descriptionMax: 4000,
  pageUrlMax: 400,
  userAgentMax: 300,
  attachmentMaxBytes: 3 * 1024 * 1024,
} as const;

export const BUG_REPORT_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type BugReportAttachmentType =
  (typeof BUG_REPORT_ATTACHMENT_TYPES)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export type BugReportFields = {
  email: string;
  title: string;
  description: string;
};

export type BugReportValidationResult =
  | { ok: true; fields: BugReportFields }
  | { ok: false; error: string };

export function isBugReportAttachmentType(
  value: string,
): value is BugReportAttachmentType {
  return (BUG_REPORT_ATTACHMENT_TYPES as readonly string[]).includes(value);
}

export function bugReportAttachmentName(type: BugReportAttachmentType): string {
  if (type === "image/png") return "zgloszenie.png";
  if (type === "image/webp") return "zgloszenie.webp";
  if (type === "image/gif") return "zgloszenie.gif";
  return "zgloszenie.jpg";
}

/** Odrzuca załączniki, które tylko udają obraz (zły nagłówek pliku). */
export function matchesImageSignature(
  type: BugReportAttachmentType,
  bytes: Uint8Array,
): boolean {
  if (bytes.length < 12) return false;

  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (type === "image/gif") {
    return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
  }
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  return riff === "RIFF" && webp === "WEBP";
}

export function parseBugReportFields(raw: {
  email?: unknown;
  title?: unknown;
  description?: unknown;
}): BugReportValidationResult {
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";

  if (
    !email ||
    email.length > BUG_REPORT_LIMITS.emailMax ||
    !EMAIL_PATTERN.test(email)
  ) {
    return { ok: false, error: "Podaj poprawny adres e-mail." };
  }
  if (title.length < BUG_REPORT_LIMITS.titleMin) {
    return {
      ok: false,
      error: `Tytuł musi mieć co najmniej ${BUG_REPORT_LIMITS.titleMin} znaki.`,
    };
  }
  if (title.length > BUG_REPORT_LIMITS.titleMax) {
    return {
      ok: false,
      error: `Tytuł może mieć maksymalnie ${BUG_REPORT_LIMITS.titleMax} znaków.`,
    };
  }
  if (description.length < BUG_REPORT_LIMITS.descriptionMin) {
    return {
      ok: false,
      error: `Opis musi mieć co najmniej ${BUG_REPORT_LIMITS.descriptionMin} znaków.`,
    };
  }
  if (description.length > BUG_REPORT_LIMITS.descriptionMax) {
    return {
      ok: false,
      error: `Opis może mieć maksymalnie ${BUG_REPORT_LIMITS.descriptionMax} znaków.`,
    };
  }

  return { ok: true, fields: { email, title, description } };
}

export function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

function singleLine(value: string, maxLength: number): string {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

const WARSAW_DATE_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
});

export function formatBugReportDate(date: Date): string {
  return `${WARSAW_DATE_FORMAT.format(date)} (czas warszawski)`;
}

export function bugReportSubject(title: string): string {
  return `[Zgłoszenie błędu] ${singleLine(title, BUG_REPORT_LIMITS.titleMax)}`;
}

export type BugReportEmailInput = {
  fields: BugReportFields;
  pageUrl?: string | null;
  userAgent?: string | null;
  submittedAt: Date;
  hasAttachment: boolean;
};

export function buildBugReportEmail(input: BugReportEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const { fields, submittedAt, hasAttachment } = input;
  const pageUrl = singleLine(input.pageUrl ?? "", BUG_REPORT_LIMITS.pageUrlMax);
  const userAgent = singleLine(
    input.userAgent ?? "",
    BUG_REPORT_LIMITS.userAgentMax,
  );
  const date = formatBugReportDate(submittedAt);
  const subject = bugReportSubject(fields.title);

  const text = [
    `Nowe zgłoszenie błędu z serwisu ${BRAND_NAME}.`,
    "",
    `E-mail zgłaszającego: ${fields.email}`,
    `Tytuł: ${fields.title}`,
    `Strona: ${pageUrl || "nie podano"}`,
    `Data: ${date}`,
    `Przeglądarka: ${userAgent || "nie podano"}`,
    `Załącznik: ${hasAttachment ? "tak" : "nie"}`,
    "",
    "Opis:",
    fields.description,
    "",
    `Odpowiedz na ten e-mail, aby napisać do zgłaszającego (${fields.email}).`,
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><th align="left" style="padding:4px 12px 4px 0;white-space:nowrap">${escapeHtml(
      label,
    )}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f1b16">',
    `<p><strong>Nowe zgłoszenie błędu z serwisu ${escapeHtml(BRAND_NAME)}.</strong></p>`,
    "<table>",
    row("E-mail", fields.email),
    row("Tytuł", fields.title),
    row("Strona", pageUrl || "nie podano"),
    row("Data", date),
    row("Przeglądarka", userAgent || "nie podano"),
    row("Załącznik", hasAttachment ? "tak" : "nie"),
    "</table>",
    '<p style="margin-top:16px"><strong>Opis:</strong></p>',
    `<pre style="white-space:pre-wrap;font-family:inherit;margin:0">${escapeHtml(
      fields.description,
    )}</pre>`,
    `<p style="margin-top:16px;color:#6b6257">Odpowiedz na ten e-mail, aby napisać do zgłaszającego (${escapeHtml(
      fields.email,
    )}).</p>`,
    "</div>",
  ].join("");

  return { subject, text, html };
}
