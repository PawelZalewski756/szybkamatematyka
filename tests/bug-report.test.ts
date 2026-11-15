import {
  BUG_REPORT_LIMITS,
  bugReportAttachmentName,
  bugReportSubject,
  buildBugReportEmail,
  escapeHtml,
  isBugReportAttachmentType,
  matchesImageSignature,
  parseBugReportFields,
} from "@/lib/bug-report/report";
import { describe, expect, it } from "vitest";

const VALID_FIELDS = {
  email: "ala@example.com",
  title: "Błąd w zadaniu 12",
  description: "Po wybraniu odpowiedzi B aplikacja pokazuje błąd zamiast wyniku.",
};

function imageBytes(head: number[], length = 16): Uint8Array {
  return new Uint8Array([...head, ...Array(length - head.length).fill(0)]);
}

describe("parseBugReportFields", () => {
  it("przyjmuje poprawne zgłoszenie i przycina spacje", () => {
    const result = parseBugReportFields({
      email: `  ${VALID_FIELDS.email}  `,
      title: `  ${VALID_FIELDS.title}  `,
      description: `  ${VALID_FIELDS.description}  `,
    });

    expect(result).toEqual({ ok: true, fields: VALID_FIELDS });
  });

  it("odrzuca niepoprawny adres e-mail", () => {
    const result = parseBugReportFields({
      ...VALID_FIELDS,
      email: "ala.example.com",
    });

    expect(result).toEqual({
      ok: false,
      error: "Podaj poprawny adres e-mail.",
    });
  });

  it("odrzuca za krótki tytuł", () => {
    const result = parseBugReportFields({ ...VALID_FIELDS, title: "ab" });

    expect(result.ok).toBe(false);
  });

  it("odrzuca tytuł dłuższy niż limit", () => {
    const result = parseBugReportFields({
      ...VALID_FIELDS,
      title: "a".repeat(BUG_REPORT_LIMITS.titleMax + 1),
    });

    expect(result.ok).toBe(false);
  });

  it("odrzuca za krótki opis", () => {
    const result = parseBugReportFields({ ...VALID_FIELDS, description: "krótko" });

    expect(result.ok).toBe(false);
  });

  it("odrzuca opis dłuższy niż limit", () => {
    const result = parseBugReportFields({
      ...VALID_FIELDS,
      description: "a".repeat(BUG_REPORT_LIMITS.descriptionMax + 1),
    });

    expect(result.ok).toBe(false);
  });
});

describe("załącznik", () => {
  it("rozpoznaje dozwolone typy obrazów", () => {
    expect(isBugReportAttachmentType("image/jpeg")).toBe(true);
    expect(isBugReportAttachmentType("image/png")).toBe(true);
    expect(isBugReportAttachmentType("image/webp")).toBe(true);
    expect(isBugReportAttachmentType("image/gif")).toBe(true);
    expect(isBugReportAttachmentType("application/pdf")).toBe(false);
  });

  it("dobiera rozszerzenie do typu pliku", () => {
    expect(bugReportAttachmentName("image/png")).toBe("zgloszenie.png");
    expect(bugReportAttachmentName("image/gif")).toBe("zgloszenie.gif");
    expect(bugReportAttachmentName("image/jpeg")).toBe("zgloszenie.jpg");
  });

  it("sprawdza nagłówki JPEG, PNG, GIF i WEBP", () => {
    expect(
      matchesImageSignature("image/jpeg", imageBytes([0xff, 0xd8, 0xff])),
    ).toBe(true);
    expect(
      matchesImageSignature(
        "image/png",
        imageBytes([0x89, 0x50, 0x4e, 0x47]),
      ),
    ).toBe(true);
    expect(
      matchesImageSignature(
        "image/gif",
        imageBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
      ),
    ).toBe(true);

    const webp = imageBytes([0x52, 0x49, 0x46, 0x46]);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    expect(matchesImageSignature("image/webp", webp)).toBe(true);
  });

  it("odrzuca plik, który nie jest obrazem", () => {
    const notAnImage = new TextEncoder().encode("<html>nie obraz</html>");

    expect(matchesImageSignature("image/jpeg", notAnImage)).toBe(false);
  });
});

describe("e-mail ze zgłoszeniem", () => {
  const submittedAt = new Date("2026-11-15T13:00:00.000Z");

  it("temat zawiera tytuł zgłoszenia", () => {
    expect(bugReportSubject("  Błąd\nw zadaniu  ")).toBe(
      "[Zgłoszenie błędu] Błąd w zadaniu",
    );
  });

  it("tekst zawiera dane zgłaszającego i opis", () => {
    const { text } = buildBugReportEmail({
      fields: VALID_FIELDS,
      pageUrl: "https://szybkamatematyka.pl/baza-zadan",
      userAgent: "Mozilla/5.0",
      submittedAt,
      hasAttachment: true,
    });

    expect(text).toContain(`E-mail zgłaszającego: ${VALID_FIELDS.email}`);
    expect(text).toContain(`Tytuł: ${VALID_FIELDS.title}`);
    expect(text).toContain(VALID_FIELDS.description);
    expect(text).toContain("Załącznik: tak");
  });

  it("escapuje HTML w treści wiadomości", () => {
    const { html } = buildBugReportEmail({
      fields: {
        ...VALID_FIELDS,
        description: "<script>alert('x')</script>",
      },
      pageUrl: "https://szybkamatematyka.pl/",
      userAgent: "Mozilla/5.0",
      submittedAt,
      hasAttachment: false,
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(escapeHtml(`a & b "c"`)).toBe("a &amp; b &quot;c&quot;");
  });
});
