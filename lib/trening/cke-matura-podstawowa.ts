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

/** Drzewo CKE - matura podstawowa (wymagania egzaminacyjne + typowe działy arkuszy). */
export const CKE_MATURA_PODSTAWOWA: CkeMaturaPodstawowaTree = {
  examType: "matura_podstawowa",
  label: "Matura podstawowa",
  shortLabel: "Matura",
  categories: [
    {
      slug: "liczby_rzeczywiste",
      name: "Liczby rzeczywiste",
      topics: [
        { slug: "potegi", name: "Potęgi i pierwiastki" },
        { slug: "logarytmy", name: "Logarytmy" },
        { slug: "procenty", name: "Procenty i proporcje" },
        { slug: "notacja_wykladnicza", name: "Notacja wykładnicza" },
        { slug: "zbiory_i_przedzialy", name: "Zbiory i przedziały" },
        { slug: "wartosc_bezwzgledna", name: "Wartość bezwzględna" },
        { slug: "kolejnosc_dzialan", name: "Kolejność wykonywania działań" },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra i równania",
      topics: [
        { slug: "wyrazenia_algebraiczne", name: "Wyrażenia algebraiczne" },
        { slug: "wzory_skroconego_mnozenia", name: "Wzory skróconego mnożenia" },
        { slug: "rownania_liniowe", name: "Równania liniowe" },
        { slug: "rownania_kwadratowe", name: "Równania kwadratowe" },
        { slug: "nierownosci", name: "Nierówności" },
        { slug: "uklady_rownan", name: "Układy równań" },
      ],
    },
    {
      slug: "funkcje",
      name: "Funkcje",
      topics: [
        { slug: "funkcja_liniowa", name: "Funkcja liniowa" },
        { slug: "funkcja_kwadratowa", name: "Funkcja kwadratowa" },
        { slug: "funkcja_wykladnicza", name: "Funkcja wykładnicza" },
        { slug: "wlasnosci_funkcji", name: "Własności funkcji i wykres" },
        { slug: "odczyt_wykresu", name: "Odczyt wykresu funkcji" },
      ],
    },
    {
      slug: "ciagi",
      name: "Ciągi",
      topics: [
        { slug: "ciag_arytmetyczny", name: "Ciąg arytmetyczny" },
        { slug: "ciag_geometryczny", name: "Ciąg geometryczny" },
      ],
    },
    {
      slug: "trygonometria",
      name: "Trygonometria",
      topics: [
        { slug: "sin_cos_tg", name: "Sinus, cosinus, tangens" },
        {
          slug: "zastosowania_trygonometrii",
          name: "Zastosowania trygonometrii",
        },
      ],
    },
    {
      slug: "geometria",
      name: "Geometria",
      topics: [
        { slug: "planimetria", name: "Planimetria" },
        { slug: "pitagoras_i_podobienstwo", name: "Tw. Pitagorasa i podobieństwo" },
        { slug: "okrag_i_kolo", name: "Okrąg i koło" },
        { slug: "stereometria", name: "Stereometria" },
        { slug: "geometria_analityczna", name: "Geometria analityczna" },
      ],
    },
    {
      slug: "kombinatoryka",
      name: "Kombinatoryka i statystyka",
      topics: [
        { slug: "kombinatoryka", name: "Kombinatoryka" },
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
