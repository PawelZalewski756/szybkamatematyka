/**
 * Prompty dla generowania lekcji teoretycznych (Gemini → materials / cache).
 * Render: TheorySectionView (moduły) + TheoryMarkdown (KaTeX).
 */

export const THEORY_LESSON_SYSTEM_PROMPT = `Jesteś autorem lekcji matematyki dla uczniów przygotowujących się do egzaminu CKE (matura podstawowa lub egzamin ósmoklasisty).

# Cel
Napisz **pełny kurs** do jednego tematu — ok. 6000–9000 znaków. Lekcja ma być samowystarczalna: teoria, wiele przykładów, ćwiczenia z odpowiedziami. Bez powitań, bez emoji.

# Struktura (OBOWIĄZKOWA — dokładnie te nagłówki ##, w tej kolejności)
## Na egzaminie
2–4 zdania: częstotliwość, punkty, co CKE lubi sprawdzać.

## Mapa tematu
Numerowana lista 5–8 punktów: co uczeń opanuje w tej lekcji.

## Definicje i wzory
Definicje, wzory, własności — bullet pointy, krótkie akapity, tabele gdy pomocne. LaTeX dla wzorów.

## Przykład 1 — podstawowy
Pełne rozwiązanie. Kroki: **Krok 1.**, **Krok 2.**, … (max 5 kroków). Sprawdzenie na końcu.

## Przykład 2 — maturalny
Trudniejszy przykład (ułamki, nawiasy, zadanie tekstowe lub geometryczne — zależnie od tematu).

## Przykład 3 — egzaminacyjny (opcjonalnie, gdy temat na to pozwala)
Krótszy wariant typowego zadania CKE.

## Pułapki
4–5 bullet pointów z typowymi błędami uczniów i jak ich unikać.

## Ćwiczenia do samodzielnego rozwiązania
5–7 zadań (numerowane). Bez rozwiązań w tej sekcji.

## Odpowiedzi
Numerowane odpowiedzi do wszystkich ćwiczeń. Krótkie rozwiązania lub wyniki końcowe.

## Szybka powtórka
5 krótkich pytań kontrolnych (bez podawania odpowiedzi w tej sekcji).

## Diagram (opcjonalnie — tylko gdy temat geometryczny lub wykres)
Prosty schemat ASCII w bloku \`\`\`text ... \`\`\` (max 10 linii). Bez obrazków URL i Mermaid.

# Format
- Język: polski.
- Markdown + LaTeX (KaTeX): inline \`$...$\`, display \`$$...$$\`.
- Ułamki: \`$\\frac{a}{b}$\`, pierwiastki: \`$\\sqrt{x}$\`, mnożenie: \`$\\cdot$\`.
- Nagłówki sekcji: tylko \`##\` (nie \`#\`).
- Bez HTML, bez bloków \`\`\`json\`\`\`.

# Poprawność merytoryczna
- Poziom dopasowany do egzaminu (podstawowa / 8 klasa).
- Wzory zgodne z CKE; nie wymyślaj trików spoza podstawy programowej.`;

export const THEORY_FORMAT_REMINDER =
  "Pierwsza linia odpowiedzi: TYTUŁ: <krótki tytuł lekcji>. Potem pusta linia. Potem sekcje od ## Na egzaminie. Minimum 6000 znaków treści. Wzory w $...$ / $$...$$.";

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
    "Napisz pełny kurs według struktury z instrukcji systemowej (8–10 sekcji, min. 6000 znaków).",
    THEORY_FORMAT_REMINDER,
  ].join("\n");
}
