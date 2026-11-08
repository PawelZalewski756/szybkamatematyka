/**
 * Normalizacja rozwiązań z modelu (Gemini) do spójnego Markdown + LaTeX (KaTeX).
 *
 * Rozwiązania renderujemy przez react-markdown + remark-math + rehype-katex,
 * więc wyjście musi być poprawnym Markdownem z delimiterami `$...$` / `$$...$$`.
 * Modele potrafią jednak:
 *   - owinąć całość w blok kodu ```...```,
 *   - użyć delimiterów `\( \)` / `\[ \]` zamiast `$`,
 *   - dodać powitania, nagłówki `#`, potrójne `$$$`,
 *   - rozjechać etykiety kroków i linię odpowiedzi.
 *
 * Poniższe funkcje są defensywne: naprawiają najczęstsze artefakty, a gdy
 * czegoś nie da się bezpiecznie naprawić - zostawiają tekst bez zmian, zamiast
 * go psuć.
 */

const GREETING_RE =
  /^\s*(siema(nko)?|siemka|hej(ka)?|cze(ść|sc)|witaj(cie)?|jasne|oczywi(ś|s)cie|spoko|no\s+dobra|dobra)[\s!,.…-]+/i;

/** Usuwa blok kodu owijający CAŁĄ odpowiedź: ```lang\n...\n``` → środek. */
function stripCodeFenceWrapper(text: string): string {
  const fence = text.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n?```$/);
  if (fence) return fence[1].trim();
  return text;
}

/** Zamienia delimitery LaTeX `\( \)` → `$ $` oraz `\[ \]` → `$$ $$`. */
function convertLatexDelimiters(text: string): string {
  let out = text;
  out = out.replace(/\\\[/g, () => "$$").replace(/\\\]/g, () => "$$");
  out = out.replace(/\\\(/g, () => "$").replace(/\\\)/g, () => "$");
  return out;
}

/** Naprawia drobne artefakty delimiterów i mnożenia. */
function fixMathArtifacts(text: string): string {
  let out = text;
  // Potrójne (lub więcej) dolary → blokowy `$$`.
  out = out.replace(/\${3,}/g, () => "$$");
  // Gwiazdka jako mnożenie między liczbami/zmiennymi w trybie matematycznym
  // bywa renderowana jako pogrubienie - zamień na `\cdot`.
  out = out.replace(/(\$[^$]*?)\b(\d|[a-zA-Z)])\s*\*\s*(\d|[a-zA-Z(\\])/g, (m) =>
    m.replace(/\s*\*\s*/g, " \\cdot "),
  );
  return out;
}

/** Usuwa powitania/wypełniacze na początku odpowiedzi. */
function stripGreetings(text: string): string {
  let out = text.trim();
  // Maksymalnie kilka iteracji, gdyby było kilka wypełniaczy z rzędu.
  for (let i = 0; i < 3 && GREETING_RE.test(out); i++) {
    out = out.replace(GREETING_RE, "").trim();
  }
  return out;
}

/** Nagłówki Markdown (`#`..`######`) → pogrubienie (kompaktowo w karcie). */
function headingsToBold(text: string): string {
  return text.replace(/^[ \t]*#{1,6}[ \t]+(.+?)\s*$/gm, (_m, content: string) => {
    const inner = content.replace(/\*+/g, "").trim();
    return inner ? `**${inner}**` : "";
  });
}

/** Ujednolica etykiety kroków do `**Krok N.**`. */
function normalizeStepHeadings(text: string): string {
  return text.replace(
    /^[ \t]*\*{0,2}\s*krok\s*(\d+)\s*[:.)\-–]?\s*\*{0,2}[ \t]*/gim,
    (_m, n: string) => `**Krok ${n}.** `,
  );
}

/** Ujednolica linię odpowiedzi do `**Odpowiedź:** ...`. */
function normalizeFinalAnswer(text: string): string {
  return text.replace(
    /^[ \t]*\*{0,2}\s*odpowied[źz]\s*\*{0,2}\s*[:.\-–]?\s*\*{0,2}[ \t]*/gim,
    () => "**Odpowiedź:** ",
  );
}

/** Porządkuje białe znaki: trailing spacje, nadmiar pustych linii. */
function tidyWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Główna normalizacja odpowiedzi AI: spójny Markdown + LaTeX (KaTeX),
 * pogrubione kroki i linia `**Odpowiedź:**`.
 */
export function normalizeSolution(text: string): string {
  if (!text) return "";

  let out = text.replace(/\uFEFF/g, "").trim();
  if (!out) return "";

  out = stripCodeFenceWrapper(out);
  out = convertLatexDelimiters(out);
  out = stripGreetings(out);
  out = headingsToBold(out);
  out = normalizeStepHeadings(out);
  out = normalizeFinalAnswer(out);
  out = fixMathArtifacts(out);
  out = tidyWhitespace(out);

  return out;
}

/** Zgodne z `scripts/seedCkeMaturaAll.ts` - placeholder bez Gemini. */
export const SOLUTION_PLACEHOLDER_MARK = "Rozwiązanie zostanie uzupełnione";

export function isSolutionPlaceholder(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return (
    t.includes(SOLUTION_PLACEHOLDER_MARK) ||
    /samodzielnie według treści/i.test(t) ||
    /^rozwiązanie\s+w\s+przygotowaniu/i.test(t)
  );
}

/** Wyciąga czytelny Markdown z surowego stringa (może być JSON-em z cache). */
function extractMarkdown(trimmed: string): string {
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, i) => {
            const line =
              typeof item === "string"
                ? item
                : typeof item === "object" && item !== null && "text" in item
                  ? String((item as { text: unknown }).text)
                  : JSON.stringify(item);
            return `**Krok ${i + 1}.** ${line}`;
          })
          .join("\n\n");
      }
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "steps" in parsed &&
        Array.isArray((parsed as { steps: unknown }).steps)
      ) {
        return ((parsed as { steps: unknown[] }).steps)
          .map((item, i) => `**Krok ${i + 1}.** ${String(item)}`)
          .join("\n\n");
      }
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "rozwiazanie" in parsed
      ) {
        return extractMarkdown(
          String((parsed as { rozwiazanie: unknown }).rozwiazanie).trim(),
        );
      }
    } catch {
      /* zwykły tekst z nawiasami */
    }
  }

  return trimmed;
}

/**
 * Zamienia surowe rozwiązanie (tekst lub JSON z cache) na spójny, czytelny
 * Markdown + LaTeX gotowy do renderu. Placeholder zwraca bez zmian.
 */
export function formatSolutionForDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || isSolutionPlaceholder(trimmed)) return trimmed;
  return normalizeSolution(extractMarkdown(trimmed));
}
