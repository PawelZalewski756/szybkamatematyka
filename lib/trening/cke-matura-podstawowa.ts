import type { ExamType } from "@/types/database";

/** Temat w drzewie CKE (slug = kolumna `topic` w Supabase). */
export type CkeTopicDef = {
  slug: string;
  name: string;
};

/** Dział w drzewie CKE (slug = kolumna `category` w Supabase). */
export type CkeCategoryDef = {
  slug: string;
  name: string;
  topics: CkeTopicDef[];
};

export type CkeMaturaPodstawowaTree = {
  examType: ExamType;
  label: string;
  shortLabel: string;
  categories: CkeCategoryDef[];
};

/** Oficjalne drzewo CKE — matura podstawowa (statyczna struktura UI). */
export const CKE_MATURA_PODSTAWOWA: CkeMaturaPodstawowaTree = {
  examType: "matura_podstawowa",
  label: "Matura podstawowa",
  shortLabel: "Matura",
  categories: [
    {
      slug: "liczby_rzeczywiste",
      name: "Liczby rzeczywiste i zbiory",
      topics: [
        { slug: "potegi", name: "Potęgi i pierwiastki" },
        { slug: "logarytmy", name: "Logarytmy" },
        { slug: "procenty", name: "Procenty i proporcje" },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra i równania",
      topics: [
        { slug: "wyrazenia_algebraiczne", name: "Wyrażenia algebraiczne" },
        { slug: "rownania_liniowe", name: "Równania liniowe" },
        { slug: "uklady_rownan", name: "Układy równań" },
      ],
    },
    {
      slug: "funkcje",
      name: "Funkcje",
      topics: [
        { slug: "funkcja_liniowa", name: "Funkcja liniowa" },
        { slug: "funkcja_kwadratowa", name: "Funkcja kwadratowa" },
      ],
    },
    {
      slug: "geometria",
      name: "Geometria",
      topics: [
        { slug: "planimetria", name: "Planimetria" },
        { slug: "stereometria", name: "Stereometria" },
        { slug: "geometria_analityczna", name: "Geometria analityczna" },
      ],
    },
    {
      slug: "kombinatoryka",
      name: "Kombinatoryka i Statystyka",
      topics: [
        { slug: "prawdopodobienstwo", name: "Prawdopodobieństwo" },
        { slug: "statystyka", name: "Statystyka" },
      ],
    },
  ],
};

export function findCkeTopicName(
  categorySlug: string,
  topicSlug: string,
): string | null {
  const category = CKE_MATURA_PODSTAWOWA.categories.find(
    (c) => c.slug === categorySlug,
  );
  return category?.topics.find((t) => t.slug === topicSlug)?.name ?? null;
}

export function findCkeCategoryName(categorySlug: string): string | null {
  return (
    CKE_MATURA_PODSTAWOWA.categories.find((c) => c.slug === categorySlug)
      ?.name ?? null
  );
}
