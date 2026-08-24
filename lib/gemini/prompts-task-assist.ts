export type TaskAssistHintInput = {
  examLabel?: string;
  topicLabel?: string;
  taskContent: string;
  correctAnswer: string;
  hintLevel: number;
  isOpenTask: boolean;
  options?: string[];
};

export type TaskAssistGradeInput = {
  examLabel?: string;
  topicLabel?: string;
  taskContent: string;
  correctAnswer: string;
  studentAnswer: string;
  maxPoints?: number;
  markingNotes?: string;
};

export type TaskAssistAskTurn = {
  role: "user" | "assistant";
  content: string;
};

export type TaskAssistAskInput = {
  examLabel?: string;
  topicLabel?: string;
  taskContent: string;
  correctAnswer: string;
  userMessage: string;
  hintContext?: string | null;
  gradeContext?: string | null;
  conversationHistory?: TaskAssistAskTurn[];
};

export const TASK_ASSIST_HINT_SYSTEM = `Jesteś cierpliwym korepetytorem matematyki dla uczniów szkoły średniej i 8 klasy w Polsce.
Twoim zadaniem jest PODPOWIADAĆ, nie rozwiązywać za ucznia.

Zasady:
- Pisz po polsku, krótko (2–4 zdania + ewentualnie jeden wzór w LaTeX inline $...$).
- NIGDY nie podawaj końcowej poprawnej odpowiedzi ani pełnego rozwiązania krok po kroku do końca.
- Wskazuj metodę, pierwszy krok lub typowe błędy — ucz ucznia myśleć samodzielnie.
- Im wyższy poziom podpowiedzi (0→2), tym bardziej konkretna wskazówka, ale nadal bez gotowej odpowiedzi.
- Nie wymyślaj danych spoza treści zadania.`;

export const TASK_ASSIST_GRADE_SYSTEM = `Jesteś egzaminatorem matematyki CKE oceniającym odpowiedź ucznia.
Oceń, czy odpowiedź ucznia jest matematycznie równoważna oczekiwanej (inne zapisy, ułamki, pierwiastki, jednostki OK).
Przy zadaniach wieloczęściowych przyznaj punkty częściowe według klucza.

Zwróć WYŁĄCZNIE JSON (bez markdown, bez \`\`\`):
{
  "verdict": "correct" | "partial" | "wrong",
  "feedback": "krótkie uzasadnienie po polsku (1–3 zdania, LaTeX inline $...$ dozwolony)",
  "acceptAsCorrect": true | false,
  "awardedPoints": 0
}

acceptAsCorrect=true tylko gdy verdict=correct (odpowiedź równoważna oczekiwanej).
partial = blisko, ale błąd w obliczeniach, brak jednostki albo tylko część podpunktów.
wrong = zła metoda lub wynik.
awardedPoints to liczba całkowita od 0 do maxPoints z polecenia.`;

export function buildHintUserPrompt(input: TaskAssistHintInput): string {
  const parts: string[] = [];
  if (input.examLabel) parts.push(`Egzamin: ${input.examLabel}`);
  if (input.topicLabel) parts.push(`Temat: ${input.topicLabel}`);
  parts.push(`Typ: ${input.isOpenTask ? "otwarte (wpisanie)" : "ABCD"}`);
  parts.push(`Poziom podpowiedzi: ${input.hintLevel + 1}/3`);
  parts.push(`Treść zadania:\n${input.taskContent.trim()}`);
  if (!input.isOpenTask && input.options?.length) {
    parts.push(`Opcje:\n${input.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n")}`);
  }
  parts.push(
    `Poprawna odpowiedź (TYLKO do wiedzy wewnętrznej — NIE ujawniaj uczniowi): ${input.correctAnswer}`,
  );
  parts.push("Podaj podpowiedź zgodnie z zasadami systemowymi.");
  return parts.join("\n\n");
}

export function buildGradeUserPrompt(input: TaskAssistGradeInput): string {
  const parts: string[] = [];
  if (input.examLabel) parts.push(`Egzamin: ${input.examLabel}`);
  if (input.topicLabel) parts.push(`Temat: ${input.topicLabel}`);
  if (input.maxPoints != null) {
    parts.push(`Maksymalna liczba punktów CKE: ${input.maxPoints}`);
  }
  parts.push(`Treść zadania:\n${input.taskContent.trim()}`);
  parts.push(`Oczekiwana odpowiedź: ${input.correctAnswer}`);
  if (input.markingNotes?.trim()) {
    parts.push(`Klucz / kroki (wewnętrznie):\n${input.markingNotes.trim()}`);
  }
  parts.push(`Odpowiedź ucznia: ${input.studentAnswer}`);
  parts.push("Oceń i zwróć JSON.");
  return parts.join("\n\n");
}

export const TASK_ASSIST_ASK_SYSTEM = `Jesteś cierpliwym korepetytorem matematyki dla uczniów w Polsce.
Uczeń rozwiązuje zadanie i zadaje pytanie własnymi słowami — czegoś nie rozumie albo chce doprecyzowania.

Zasady:
- Odpowiadaj po polsku, prosto i na temat (2–5 zdań; wzory w LaTeX inline $...$ dozwolone).
- Odnieś się do tego, co uczeń napisał — nie ignoruj jego pytania.
- NIGDY nie podawaj gotowej końcowej odpowiedzi na zadanie ani pełnego rozwiązania do końca.
- Możesz wyjaśnić pojęcie, wskazać kolejny krok myślenia albo rozwiać wątpliwość co do treści.
- Nie wymyślaj danych spoza zadania.`;

export function buildAskUserPrompt(input: TaskAssistAskInput): string {
  const parts: string[] = [];
  if (input.examLabel) parts.push(`Egzamin: ${input.examLabel}`);
  if (input.topicLabel) parts.push(`Temat: ${input.topicLabel}`);
  parts.push(`Treść zadania:\n${input.taskContent.trim()}`);
  parts.push(
    `Poprawna odpowiedź (TYLKO do wiedzy wewnętrznej — NIE ujawniaj uczniowi): ${input.correctAnswer}`,
  );

  if (input.hintContext?.trim()) {
    parts.push(`Wcześniejsza podpowiedź dla ucznia:\n${input.hintContext.trim()}`);
  }
  if (input.gradeContext?.trim()) {
    parts.push(`Wcześniejszy komentarz do odpowiedzi ucznia:\n${input.gradeContext.trim()}`);
  }

  const history = (input.conversationHistory ?? []).filter(
    (t) => t.content.trim().length > 0,
  );
  if (history.length > 0) {
    parts.push(
      "Dotychczasowa rozmowa:\n" +
        history
          .map((t) =>
            t.role === "user"
              ? `Uczeń: ${t.content.trim()}`
              : `Korepetytor: ${t.content.trim()}`,
          )
          .join("\n"),
    );
  }

  parts.push(`Nowe pytanie ucznia:\n${input.userMessage.trim()}`);
  parts.push("Odpowiedz zgodnie z zasadami systemowymi.");
  return parts.join("\n\n");
}
