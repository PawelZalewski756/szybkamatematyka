/** Minimalna lekcja-placeholder (do nadpisania przez Gemini). */
export function buildMaterialStub(input: {
  examLabel: string;
  categoryName: string;
  topicName: string;
}): { title: string; content: string } {
  const { examLabel, categoryName, topicName } = input;
  const title = `${topicName} — ${examLabel}`;

  const content = `## Na egzaminie

Temat **${topicName}** (${categoryName}) należy do wymagań ${examLabel}. Pełna lekcja jest generowana automatycznie — odśwież za chwilę, jeśli widzisz ten szkic.

## Mapa tematu

1. Definicje i wzory z działu **${categoryName}**
2. Przykłady krok po kroku
3. Typowe pułapki egzaminacyjne
4. Ćwiczenia z odpowiedziami

## Definicje i wzory

*Materiał w trakcie uzupełniania dla: ${topicName}.*

## Przykład 1 — podstawowy

**Krok 1.** Przejdź do zadań w arenie treningowej dla tego tematu.

## Pułapki

- Ten wpis to tymczasowy placeholder — docelowa lekcja ma min. 2500 znaków i pełne przykłady.

## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż pierwsze zadanie z listy w treningu dla tego tematu.

## Odpowiedzi

1. Sprawdź rozwiązanie w aplikacji po ukończeniu zadania.

## Szybka powtórka

1. Jaki dział obejmuje ten temat?
2. Gdzie znajdziesz zadania do ćwiczeń?`;

  return { title, content };
}
