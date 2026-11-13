/**
 * "Mnożenie #12" i "Mnożenie #13" to ten sam temat w katalogu.
 * Usuwamy końcowy numer wariantu, żeby nie pokazywać 80 osobnych tematów.
 *
 * Zadania z arkuszy mają tytuły typu "Matura - maj 2025 - poziom podstawowy
 * - zad. 12". Dla katalogu tematów grupujemy je po sesji, a nie po numerze
 * zadania, bo inaczej lista puchnie do setek pozycji z liczbą 1.
 */
export function getTaskTopic(title: string): string {
  const withoutVariant = title.replace(/\s+#\d+\s*$/, "").trim();
  const examTask = withoutVariant.match(
    /^(.+?)\s+-\s+zad\.\s*\d+(?:\.\d+)?$/i,
  );
  return examTask ? examTask[1]!.trim() : withoutVariant || title.trim();
}
