import type { ExamType } from "@/types/database";
import type { CkeCategoryDef } from "@/lib/trening/cke-matura-podstawowa";

export type CkeEgzamin8Tree = {
  examType: ExamType;
  label: string;
  shortLabel: string;
  categories: CkeCategoryDef[];
};

/** Drzewo CKE - egzamin ósmoklasisty (wymagania + typowe zadania arkuszy). */
export const CKE_EGZAMIN_8: CkeEgzamin8Tree = {
  examType: "8_klasa",
  label: "Egzamin 8-klasisty",
  shortLabel: "8-klasista",
  categories: [
    {
      slug: "liczby",
      name: "Liczby i działania",
      topics: [
        { slug: "ulamki", name: "Ułamki zwykłe i dziesiętne" },
        { slug: "potegi", name: "Potęgi" },
        { slug: "pierwiastki", name: "Pierwiastki" },
        { slug: "procenty", name: "Procenty" },
        { slug: "liczby_calkowite", name: "Liczby całkowite" },
        { slug: "podzielnosc", name: "Podzielność liczb" },
        { slug: "kolejnosc_dzialan", name: "Kolejność wykonywania działań" },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra",
      topics: [
        { slug: "wyrazenia_algebraiczne", name: "Wyrażenia algebraiczne" },
        { slug: "wzory_skroconego_mnozenia", name: "Wzory skróconego mnożenia" },
        { slug: "rownania", name: "Równania" },
        { slug: "proporcje", name: "Proporcje i skala" },
      ],
    },
    {
      slug: "geometria",
      name: "Geometria płaska",
      topics: [
        { slug: "katy", name: "Kąty i proste" },
        { slug: "obwody", name: "Obwody figur" },
        { slug: "pola_figur", name: "Pola figur" },
        { slug: "pitagoras", name: "Twierdzenie Pitagorasa" },
        { slug: "podobienstwo", name: "Podobieństwo figur" },
        { slug: "okrag_i_kolo", name: "Okrąg i koło" },
        { slug: "symetrie", name: "Symetrie" },
      ],
    },
    {
      slug: "geometria_przestrzenna",
      name: "Geometria przestrzenna",
      topics: [
        { slug: "bryly", name: "Bryły - rozpoznawanie" },
        { slug: "objetosc_i_pole", name: "Objętość i pole powierzchni" },
      ],
    },
    {
      slug: "uklad_wspolrzednych",
      name: "Układ współrzędnych",
      topics: [
        { slug: "punkty_na_plaszczyznie", name: "Punkty na płaszczyźnie" },
        { slug: "dlugosc_odcinka", name: "Długość odcinka" },
      ],
    },
    {
      slug: "funkcje",
      name: "Funkcje i wykresy",
      topics: [
        { slug: "wykresy", name: "Odczyt wykresu" },
        { slug: "proporcjonalnosc", name: "Proporcjonalność prosta" },
      ],
    },
    {
      slug: "statystyka",
      name: "Statystyka",
      topics: [
        { slug: "srednia", name: "Średnia arytmetyczna" },
        { slug: "mediana_i_dominanta", name: "Mediana i dominanta" },
        { slug: "diagramy", name: "Diagramy słupkowe i kołowe" },
      ],
    },
    {
      slug: "kombinatoryka",
      name: "Kombinatoryka",
      topics: [
        { slug: "prawdopodobienstwo", name: "Prawdopodobieństwo" },
        { slug: "regula_mnozenia", name: "Reguła mnożenia" },
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
