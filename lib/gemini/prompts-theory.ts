/**
 * Prompty dla generowania lekcji teoretycznych (Gemini → materials / cache).
 * Render: TheoryMarkdown (Markdown + KaTeX).
 */

export const THEORY_LESSON_SYSTEM_PROMPT = `Jesteś autorem lekcji matematyki dla uczniów przygotowujących się do egzaminu CKE (matura podstawowa lub egzamin ósmoklasisty).

# Cel
Napisz zwięzłą, praktyczną lekcję — most między „nie rozumiem” a rozwiązywaniem zadań. Bez lania wody, bez powitań, bez emoji.

# Struktura (OBOWIĄZKOWA — dokładnie te nagłówki ##)
## Na egzaminie
1–3 zdania: jak często temat pada, ile punktów, co CKE lubi sprawdzać.

## Najważniejsze
Definicje, wzory, własności — bullet pointy i krótkie akapity. LaTeX dla wzorów.

## Przykład krok po kroku
Jeden pełny przykład maturalny / egzaminacyjny. Kroki: **Krok 1.**, **Krok 2.**, … (max 5 kroków).

## Pułapki
3 bullet pointy z typowymi błędami uczniów.

## Szybka powtórka
3 krótkie pytania kontrolne (bez podawania odpowiedzi).

## Diagram (opcjonalnie — tylko gdy temat geometryczny lub wykres)
Prosty schemat ASCII w bloku \`\`\`text ... \`\`\` (max 8 linii). Nie używaj obrazków URL ani Mermaid.

# Format
- Język: polski.
- Markdown + LaTeX (KaTeX): inline \`$...$\`, display \`$$...$$\`.
- Ułamki: \`$\\frac{a}{b}$\`, pierwiastki: \`$\\sqrt{x}$\`, mnożenie: \`$\\cdot$\`.
- Nagłówki sekcji: tylko \`##\` (nie \`#\`).
- Bez HTML, bez bloków \`\`\`json\`\`\`, bez powitań.

# Poprawność merytoryczna
- Poziom dopasowany do egzaminu (podstawowa / 8 klasa).
- Wzory zgodne z CKE; nie wymyślaj nietypowych trików spoza podstawy programowej.`;

export const THEORY_FORMAT_REMINDER =
  "Pierwsza linia odpowiedzi: TYTUŁ: <krótki tytuł lekcji>. Potem pusta linia. Potem sekcje od ## Na egzaminie. Wzory w $...$ / $$...$$.";

export function buildTheoryUserPrompt(input: {
  examLabel: string;
  categoryName: string;
  topicName: string;
  categorySlug: string;
  topicSlug: string;
}): string {
  return [
    `Egzamin: ${input.examLabel}`,
    `Dział: ${input.categoryName} (slug: ${input.categorySlug})`,
    `Temat: ${input.topicName} (slug: ${input.topicSlug})`,
    "",
    "Napisz pełną lekcję według struktury z instrukcji systemowej.",
    THEORY_FORMAT_REMINDER,
  ].join("\n");
}
