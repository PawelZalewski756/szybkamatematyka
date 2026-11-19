export type PrivacyFindingKind = "email" | "secret";

export type PrivacyFinding = {
  kind: PrivacyFindingKind;
  label: string;
  /** Zamaskowana wartość - nigdy nie logujemy całego sekretu/adresu. */
  masked: string;
  line: number;
};

/** Domeny, które są jawne (przykłady, kontakt operatora, placeholdery). */
const ALLOWED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "example.invalid",
  "invalid",
  "resend.dev",
  "szybkamatematyka.pl",
  "email.pl",
  "test.com",
  "localhost",
]);

const EMAIL_PATTERN =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const SECRET_PATTERNS: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: "Stripe secret key", pattern: /sk_(?:live|test)_[A-Za-z0-9]{10,}/g },
  { label: "Stripe webhook secret", pattern: /whsec_[A-Za-z0-9]{10,}/g },
  { label: "Supabase secret key", pattern: /sb_secret_[A-Za-z0-9_-]{10,}/g },
  { label: "Supabase access token", pattern: /sbp_[A-Za-z0-9]{20,}/g },
  {
    label: "Google API key",
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
  },
  {
    label: "Telegram bot token",
    pattern: /\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/g,
  },
  {
    label: "GitHub token",
    pattern: /gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/g,
  },
  {
    label: "Private key",
    pattern: /BEGIN [A-Z ]*PRIVATE KEY/g,
  },
  {
    label: "Postgres URL z hasłem",
    pattern: /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/g,
  },
  {
    label: "Resend API key",
    pattern: /re_[A-Za-z0-9]{20,}/g,
  },
];

const JWT_PATTERN = /eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g;

export function maskEmail(value: string): string {
  const at = value.indexOf("@");
  if (at <= 0) return "***";
  return `${value.slice(0, 1)}***@${value.slice(at + 1)}`;
}

export function isAllowedEmail(value: string): boolean {
  const at = value.lastIndexOf("@");
  if (at <= 0) return false;
  const domain = value.slice(at + 1).trim().toLowerCase().replace(/\.+$/, "");
  if (!domain) return false;
  if (ALLOWED_EMAIL_DOMAINS.has(domain)) return true;
  return domain.endsWith(".invalid");
}

function decodeJwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1]!, "base64url").toString("utf8"),
    ) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

/**
 * Skanuje pojedynczą linię. Adresy e-mail są zwracane zawsze - o tym, czy
 * plik podlega pod ochronę PII, decyduje wywołujący (np. tylko supabase/docs).
 */
export function scanLine(line: string, lineNumber: number): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];

  for (const match of line.matchAll(EMAIL_PATTERN)) {
    const value = match[0];
    if (!isAllowedEmail(value)) {
      findings.push({
        kind: "email",
        label: "Adres e-mail",
        masked: maskEmail(value),
        line: lineNumber,
      });
    }
  }

  for (const { label, pattern } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of line.matchAll(pattern)) {
      findings.push({
        kind: "secret",
        label,
        masked: `${match[0].slice(0, 6)}… (len=${match[0].length})`,
        line: lineNumber,
      });
    }
  }

  for (const match of line.matchAll(JWT_PATTERN)) {
    const role = decodeJwtRole(match[0]);
    if (role === "service_role") {
      findings.push({
        kind: "secret",
        label: "JWT z rolą service_role",
        masked: `eyJ… (role=service_role, len=${match[0].length})`,
        line: lineNumber,
      });
    }
  }

  return findings;
}

export type ScannedFile = {
  file: string;
  findings: PrivacyFinding[];
};

export function scanFile(
  file: string,
  content: string,
  options: { scanEmails: boolean },
): ScannedFile {
  const findings: PrivacyFinding[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const finding of scanLine(line, index + 1)) {
      if (finding.kind === "email" && !options.scanEmails) continue;
      findings.push(finding);
    }
  });

  return { file, findings };
}
