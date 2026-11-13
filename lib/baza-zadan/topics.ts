/**
 * "Mnożenie #12" i "Mnożenie #13" to ten sam temat w katalogu.
 * Usuwamy końcowy numer wariantu, żeby nie pokazywać 80 osobnych tematów.
 */
export function getTaskTopic(title: string): string {
  const cleaned = title.replace(/\s+#\d+\s*$/, "").trim();
  return cleaned || title.trim();
}
