/**
 * Mail z przeprosinami i informacją o miesiącu Pro dla osób, które zgłosiły
 * błędy w zadaniach 18.11.2026.
 *
 *   npx tsx scripts/sendBugReportApology.ts --dry-run
 *   npx tsx scripts/sendBugReportApology.ts --write
 *   npx tsx scripts/sendBugReportApology.ts --send
 *
 * Domyślnie działa dry-run (nic nie wysyła). `--send` wymaga RESEND_API_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import {
  BUG_REPORT_APOLOGY_SUBJECT,
  bugReportApologyHtml,
  bugReportApologyText,
  isBugReportApologyConfigured,
  sendBugReportApology,
} from "@/lib/email/bug-report-apology";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const argv = process.argv.slice(2);
const send = argv.includes("--send");
const write = argv.includes("--write");
const dryRun = argv.includes("--dry-run") || (!send && !write);
const toArg = argv.find((arg) => arg.startsWith("--to="));
const envRecipients = (process.env.BUG_REPORTER_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
const recipients = toArg
  ? [toArg.split("=").slice(1).join("=").trim()]
  : envRecipients;


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.szybkamatematyka.pl";

async function main() {
  if (write) {
    const dir = path.resolve(process.cwd(), "docs/email-templates");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "przeprosiny-zgloszenie-bledu.md"),
      `# ${BUG_REPORT_APOLOGY_SUBJECT}\n\n${bugReportApologyText({ to: "", siteUrl })}\n`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(dir, "przeprosiny-zgloszenie-bledu.html"),
      bugReportApologyHtml({ to: "", siteUrl }),
      "utf8",
    );
    console.log(`Zapisano szablony w docs/email-templates/.`);
    return;
  }

  if (dryRun) {
    console.log(`TEMAT: ${BUG_REPORT_APOLOGY_SUBJECT}\n`);
    console.log(bugReportApologyText({ to: "", siteUrl }));
    console.log(`\nOdbiorcy (${recipients.length}): ${recipients.join(", ")}`);
    console.log(
      isBugReportApologyConfigured()
        ? "Resend skonfigurowany. Użyj --send, żeby wysłać."
        : "Brak RESEND_API_KEY - to tylko podgląd. Uzupełnij .env.local i użyj --send.",
    );
    return;
  }

  if (recipients.length === 0) {
    console.error(
      "Podaj odbiorcę: --to=adres@example.com albo ustaw BUG_REPORTER_EMAILS=a@x.pl,b@y.pl",
    );
    process.exit(1);
  }
  if (!isBugReportApologyConfigured()) {
    console.error(
      "Brak RESEND_API_KEY w .env.local - nie mogę wysłać maili. Użyj --dry-run, żeby zobaczyć treść.",
    );
    process.exit(1);
  }

  for (const to of recipients) {
    const result = await sendBugReportApology({ to, siteUrl });
    console.log(
      result.ok
        ? `✓ wysłano do ${to}`
        : `✗ ${to}: ${result.error}`,
    );
    if (!result.ok) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
