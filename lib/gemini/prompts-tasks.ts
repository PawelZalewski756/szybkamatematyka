export type GenerateTasksInput = {
  examLabel: string;
  categoryName: string;
  topicName: string;
  categorySlug: string;
  topicSlug: string;
  batchSize: number;
  batchIndex: number;
  existingSamples: string[];
  /** choice = ABCD, open = wpisanie odpowiedzi */
  taskKind: "choice" | "open";
  /** Wymuś SVG przy każdym zadaniu (geometria / wykresy). */
  requireFigures?: boolean;
};

export const TASKS_OPEN_SYSTEM_PROMPT = `Jesteś autorem zadań maturalnych i egzaminu ósmoklasisty z matematyki.

Zwracasz WYŁĄCZNIE poprawny JSON (tablica) — bez markdown otaczającego odpowiedź.

Każde zadanie wymaga WPISANIA odpowiedzi (nie ABCD). Uczeń wpisze wynik w pole tekstowe.

Wymagania:
- answer_type: "open"
- options: [] (pusta tablica)
- correct_answer: jednoznaczna odpowiedź (liczba, ułamek 3/4, pierwiastek 2\\sqrt{2}, procent 15%, kąt 60°)
- Treść z LaTeX: inline $...$, display $$...$$
- correct_answer bez zbędnych jednostek, chyba że kluczowe (np. cm, cm²)
- Akceptowane równoważne formy: zapisz canonical w correct_answer (np. 0.5 lub 1/2 — wybierz prostszy)
- difficulty 1–3, xp_reward 14–25
- explanation: krótkie uzasadnienie
- figure_svg opcjonalnie (geometria, wykresy)`;

export function buildOpenTasksBatchUserPrompt(input: GenerateTasksInput): string {
  const samples =
    input.existingSamples.length > 0
      ? `\nPrzykłady (NIE powtarzaj):\n${input.existingSamples
          .slice(-6)
          .map((s, i) => `${i + 1}. ${s.slice(0, 180)}`)
          .join("\n")}\n`
      : "";

  return `Egzamin: ${input.examLabel}
Temat: ${input.topicName} (${input.categorySlug}/${input.topicSlug})
Wygeneruj ${input.batchSize} zadań OTWARTYCH (uczeń wpisuje odpowiedź).
${samples}
Schemat:
[
  {
    "answer_type": "open",
    "content": "Oblicz wartość wyrażenia $2^3 + 5$.",
    "options": [],
    "correct_answer": "13",
    "difficulty": 1,
    "xp_reward": 14,
    "explanation": "2^3 = 8, więc 8 + 5 = 13.",
    "figure_svg": null,
    "figure_caption": null
  }
]`;
}

export const TASKS_BATCH_SYSTEM_PROMPT = `Jesteś autorem zadań maturalnych i egzaminu ósmoklasisty z matematyki dla polskiej aplikacji edukacyjnej.

Zwracasz WYŁĄCZNIE poprawny JSON (tablica obiektów) — bez markdown, bez komentarzy, bez \`\`\`.

Każde zadanie to test wielokrotnego wyboru (ABCD) po polsku, zgodne z wymaganiami CKE i poziomem egzaminu.

Wymagania jakości:
- Treść: konkretna, jednoznaczna, bez błędów merytorycznych.
- Matematyka: używaj LaTeX — inline $...$, wyświetlanie $$...$$. W JSON escape backslash: \\\\frac{a}{b}.
- 4 opcje odpowiedzi — dokładnie jedna poprawna, pozostałe wiarygodne błędy ucznia.
- correct_answer MUSI być dokładnie jedną z opcji (identyczny string).
- difficulty: 1 (łatwe), 2 (średnie), 3 (trudne) — mieszaj w partii.
- xp_reward: 10–14 dla diff 1, 14–20 dla diff 2, 18–25 dla diff 3.
- explanation: krótkie (2–4 zdania) uzasadnienie poprawnej odpowiedzi po polsku, z LaTeX.
- Unikaj powtórzeń wzorców z istniejących przykładów podanych w promptcie.

Ilustracje (TYLKO gdy rysunek jest niezbędny do rozwiązania):
- figure_svg: kompaktowy SVG (viewBox="0 0 240 180"), czytelny na ciemnym tle: białe/szare linie (#e5e5e5), bez zewnętrznych fontów, polskie etykiety jako <text>.
- figure_caption: krótki opis figury po polsku.
- Gdy brak figury: figure_svg i figure_caption = null.
- ZAKAZ ozdobnych rysunków: jeśli wszystkie dane liczbowe i geometryczne są w treści tekstowej i da się rozwiązać bez patrzenia na SVG — NIE dodawaj figure_svg.
- Dobry przykład: odczyt współrzędnych/punktów/kąta/łuku WYŁĄCZNIE z rysunku; wykres bez podanego wzoru; diagram z wartościami tylko na rysunku.
- Zły przykład: „promień 9 cm, ką 120° — oblicz łuk” + rysunek powtarzający te same liczby.

NIE używaj obrazków URL — tylko SVG inline w figure_svg.`;

export function buildTasksBatchUserPrompt(input: GenerateTasksInput): string {
  const samples =
    input.existingSamples.length > 0
      ? `\nPrzykłady treści już wygenerowanych (NIE powtarzaj):\n${input.existingSamples
          .slice(-8)
          .map((s, i) => `${i + 1}. ${s.slice(0, 200)}`)
          .join("\n")}\n`
      : "";

  const figureRule = input.requireFigures
    ? `\nWYMAGANE — zadania WYŁĄCZNIE z niezbędnym rysunkiem:\n` +
      `- KAŻDE zadanie MUSI mieć figure_svg (viewBox="0 0 240 180") + figure_caption.\n` +
      `- Bez rysunku zadanie MUSI być nierozwiązywalne (brakuje liczb/współrzędnych/kątów podanych tylko na SVG).\n` +
      `- Treść: „Na rysunku… / Na wykresie…” — NIE powtarzaj w tekście wszystkich danych z rysunku.\n` +
      `- ZAKAZ dekoracji: nie generuj zadań, które da się rozwiązać samym tekstem.\n` +
      `- ZAKAZ figure_svg = null.\n`
    : "";

  return `Egzamin: ${input.examLabel}
Dział: ${input.categoryName} (${input.categorySlug})
Temat: ${input.topicName} (${input.topicSlug})
Partia nr: ${input.batchIndex + 1}
Liczba zadań w tej odpowiedzi: ${input.batchSize}
${samples}${figureRule}
Wygeneruj ${input.batchSize} różnorodnych zadań zamkniętych (ABCD) dla tego tematu.

Schemat JSON (tablica):
[
  {
    "content": "Treść pytania — markdown + LaTeX. Może mieć krótki kontekst (1–2 zdania).",
    "options": ["opcja A", "opcja B", "opcja C", "opcja D"],
    "correct_answer": "dokładnie jedna opcja",
    "answer_type": "choice",
    "difficulty": 2,
    "xp_reward": 16,
    "explanation": "Dlaczego ta odpowiedź jest poprawna…",
    "figure_svg": "<svg viewBox=\\"0 0 240 180\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>"${input.requireFigures ? "" : " lub null"},
    "figure_caption": "Opis figury"${input.requireFigures ? "" : " lub null"}
  }
]`;
}

export const TASKS_FORMAT_REMINDER =
  "Pamiętaj: zwróć TYLKO tablicę JSON. correct_answer MUSI być identyczna z jedną opcją. " +
  "Sprawdź obliczenia — correct_answer = wynik z explanation. Bez samokorekty w explanation.";

export const TASKS_FIGURES_REMINDER =
  "KAŻDE zadanie: figure_svg + figure_caption. Rysunek NIEZBĘDNY do rozwiązania " +
  "(dane kluczowe tylko na SVG, nie zdublowane w tekście). " +
  "Rysunek czytelny na ciemnym tle (#e5e5e5). correct_answer = jedna z opcji i zgodna z explanation. " +
  "Jeśli zadanie da się rozwiązać bez rysunku — NIE zwracaj go.";

export const TASKS_OPEN_FORMAT_REMINDER =
  "Pamiętaj: zwróć TYLKO tablicę JSON. options=[]. correct_answer = końcowy wynik obliczeń (krótki). " +
  "Sprawdź spójność: correct_answer musi zgadzać się z ostatnim wynikiem w explanation. Bez „błąd w zadaniu”.";
