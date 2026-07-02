import { parseTheorySections } from "@/lib/trening/theory-sections";

const RENAME: Record<string, string> = {
  "Najważniejsze": "Definicje i wzory",
  "Przykład krok po kroku": "Przykład 1 — podstawowy",
};

function renameTitle(title: string): string {
  return RENAME[title] ?? title;
}

function buildMapaTematu(sectionTitles: string[]): string {
  const items = sectionTitles
    .filter((t) => !/^na egzaminie/i.test(t))
    .map((t, i) => `${i + 1}. **${renameTitle(t)}**`);

  return `## Mapa tematu

W tej lekcji przejdziesz przez:

${items.join("\n")}

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.`;
}

function buildCwiczenia(reviewBody: string | null): string {
  const numbered = reviewBody
    ? reviewBody
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^\d+\./.test(line))
        .slice(0, 3)
    : [];

  const fromReview =
    numbered.length > 0
      ? numbered.map((q, i) => `${i + 4}. ${q.replace(/^\d+\.\s*/, "")}`)
      : [
          "4. Zastosuj wzory z lekcji w zadaniu podobnym do przykładu.",
          "5. Sprawdź rozwiązanie podstawieniem do równania.",
        ];

  return `## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
${fromReview.join("\n")}`;
}

function buildOdpowiedzi(reviewBody: string | null): string {
  if (!reviewBody?.trim()) {
    return `## Odpowiedzi

1–3. Porównaj z **Definicjami i wzorami** oraz **Przykładem 1** powyżej.
4–5. Rozwiązania zależą od wariantu — sprawdź w **arenie zadań** lub zapytaj w komentarzu do lekcji.`;
  }

  const lines = reviewBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line));

  const answers = lines.map((q, i) => {
    const text = q.replace(/^\d+\.\s*/, "");
    return `${i + 1}. ${text} — patrz sekcja **Definicje i wzory** i **Przykład 1**.`;
  });

  return `## Odpowiedzi

${answers.join("\n")}

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*`;
}

/** Rozszerza krótką lekcję (5 sekcji) do pełniejszego kursu z mapą, ćwiczeniami i odpowiedziami. */
export function enrichTheoryLesson(content: string): string {
  if (/## Ćwiczenia/i.test(content)) return content;

  const sections = parseTheorySections(content);
  if (sections.length === 0) return content;

  const hasMapa = sections.some((s) => /^mapa tematu/i.test(s.title));
  const reviewSection = sections.find((s) => /^szybka powtórka|^podsumowanie/i.test(s.title));

  const out: string[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const title = renameTitle(section.title);

    if (i === 0 && !hasMapa) {
      out.push(`## ${section.title}`, section.body, "", buildMapaTematu(sections.map((s) => s.title)));
    }

    if (/^szybka powtórka|^podsumowanie/i.test(section.title)) {
      out.push(
        buildCwiczenia(reviewSection?.body ?? null),
        "",
        buildOdpowiedzi(reviewSection?.body ?? null),
        "",
        `## ${title}`,
        section.body,
      );
      continue;
    }

    if (i === 0 && hasMapa) {
      out.push(`## ${section.title}`, section.body);
      continue;
    }

    if (i === 0) continue;

    out.push("", `## ${title}`, section.body);
  }

  return out.join("\n").trim();
}
