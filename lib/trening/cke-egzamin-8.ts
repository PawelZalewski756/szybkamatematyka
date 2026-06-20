import type { ExamType } from "@/types/database";
import type { CkeCategoryDef } from "@/lib/trening/cke-matura-podstawowa";

export type CkeEgzamin8Tree = {
  examType: ExamType;
  label: string;
  shortLabel: string;
  categories: CkeCategoryDef[];
};

/** Drzewo CKE — egzamin ósmoklasisty (slugi = kolumny category / topic w Supabase). */
export const CKE_EGZAMIN_8: CkeEgzamin8Tree = {
  examType: "8_klasa",
  label: "Egzamin 8-klasisty",
  shortLabel: "8-klasista",
  categories: [
    {
      slug: "liczby",
      name: "Liczby",
      topics: [
        { slug: "ulamki", name: "Ułamki" },
        { slug: "potegi", name: "Potęgi" },
        { slug: "procenty", name: "Procenty" },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra",
      topics: [
        { slug: "wyrazenia_algebraiczne", name: "Wyrażenia algebraiczne" },
        { slug: "rownania", name: "Równania" },
      ],
    },
    {
      slug: "geometria",
      name: "Geometria",
      topics: [
        { slug: "pola_figur", name: "Pola figur" },
        { slug: "obwody", name: "Obwody" },
        { slug: "katy", name: "Kąty" },
      ],
    },
    {
      slug: "funkcje",
      name: "Funkcje i wykresy",
      topics: [{ slug: "wykresy", name: "Odczyt wykresu" }],
    },
    {
      slug: "statystyka",
      name: "Statystyka",
      topics: [
        { slug: "srednia", name: "Średnia" },
        { slug: "diagramy", name: "Diagramy" },
      ],
    },
    {
      slug: "kombinatoryka",
      name: "Kombinatoryka",
      topics: [
        { slug: "prawdopodobienstwo", name: "Prawdopodobieństwo" },
      ],
    },
  ],
};

export function findCke8TopicName(
  categorySlug: string,
  topicSlug: string,
): string | null {
  const category = CKE_EGZAMIN_8.categories.find(
    (c) => c.slug === categorySlug,
  );
  return category?.topics.find((t) => t.slug === topicSlug)?.name ?? null;
}

export function findCke8CategoryName(categorySlug: string): string | null {
  return (
    CKE_EGZAMIN_8.categories.find((c) => c.slug === categorySlug)?.name ?? null
  );
}
