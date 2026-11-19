import {
  isAllowedEmail,
  maskEmail,
  scanFile,
  scanLine,
} from "@/lib/security/privacy-scan";
import { describe, expect, it } from "vitest";

describe("privacy scan - adresy e-mail", () => {
  it("przepuszcza placeholdery i publiczne domeny", () => {
    expect(isAllowedEmail("kontakt@szybkamatematyka.pl")).toBe(true);
    expect(isAllowedEmail("uczen@example.com")).toBe(true);
    expect(isAllowedEmail("adres@example.invalid")).toBe(true);
  });

  it("wykrywa prywatny adres i maskuje go w raporcie", () => {
    const findings = scanLine("zgłoszenie od uczen.prywatny@przyklad-prywatny.pl", 7);
    const email = findings.find((finding) => finding.kind === "email");

    expect(email).toBeDefined();
    expect(email!.label).toBe("Adres e-mail");
    expect(email!.masked).toBe("u***@przyklad-prywatny.pl");
    expect(email!.line).toBe(7);
  });

  it("nie skanuje adresów, gdy plik nie jest objęty ochroną PII", () => {
    const result = scanFile(
      "tests/example.test.ts",
      "const email = 'uczen.prywatny@przyklad-prywatny.pl';",
      { scanEmails: false },
    );
    expect(result.findings).toEqual([]);
  });

  it("maskuje adres bez ujawniania lokalnej części", () => {
    expect(maskEmail("bardzo.dlugi.adres@przyklad-prywatny.pl")).toBe(
      "b***@przyklad-prywatny.pl",
    );
  });
});

describe("privacy scan - sekrety", () => {
  it("wykrywa klucze bez wypisywania ich wartości", () => {
    const line = [
      ["sk", "live", "abcdefghijklmnop"].join("_"),
      ["sb", "secret", "abcdefghijklmnop"].join("_"),
      "AIza" + "abcdefghijklmnopqrstuvwxyz123456789",
      "123456789:" + "abcdefghijklmnopqrstuvwxyz12345",
    ].join(" ");
    const findings = scanLine(line, 1);
    const labels = findings.map((finding) => finding.label);

    expect(labels).toEqual(
      expect.arrayContaining([
        "Stripe secret key",
        "Supabase secret key",
        "Google API key",
        "Telegram bot token",
      ]),
    );
    for (const finding of findings) {
      expect(finding.masked).not.toContain("abcdefghij");
    }
  });

  it("blokuje JWT z rolą service_role, ale nie demo anon", () => {
    const payload = Buffer.from(JSON.stringify({ role: "service_role" })).toString(
      "base64url",
    );
    const anonPayload = Buffer.from(JSON.stringify({ role: "anon" })).toString(
      "base64url",
    );
    const serviceToken = `eyJhbGciOiJIUzI1NiJ9.${payload}.abcdefgh`;
    const anonToken = `eyJhbGciOiJIUzI1NiJ9.${anonPayload}.abcdefgh`;

    expect(
      scanLine(serviceToken, 1).some(
        (finding) => finding.label === "JWT z rolą service_role",
      ),
    ).toBe(true);
    expect(
      scanLine(anonToken, 1).some((finding) => finding.kind === "secret"),
    ).toBe(false);
  });
});
