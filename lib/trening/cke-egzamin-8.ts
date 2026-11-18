import type { ExamType } from "@/types/database";
import type { CkeCategoryDef } from "@/lib/trening/cke-matura-podstawowa";

export type CkeEgzamin8Tree = {
  examType: ExamType;
  label: string;
  shortLabel: string;
  categories: CkeCategoryDef[];
};

/**
 * Drzewo CKE - egzamin ósmoklasisty.
 *
 * Zakres nie jest wyłącznie listą działów z arkusza. Obejmuje całą podstawę
 * programową matematyki dla klas IV-VIII (14 działów klas IV-VI + 15 działów
 * klas VII-VIII), żeby w treningu nie ginęły tematy, które nie trafiły do
 * ostatniego arkusza. Mapowanie działów podstawy na tematy i źródło:
 * `docs/cke-podstawa-programowa.md`.
 */
export const CKE_EGZAMIN_8: CkeEgzamin8Tree = {
  examType: "8_klasa",
  label: "Egzamin 8-klasisty",
  shortLabel: "8-klasista",
  categories: [
    {
      slug: "liczby",
      name: "Liczby i działania",
      topics: [
        { slug: "liczby_naturalne", name: "Liczby naturalne i zapis dziesiątkowy" },
        { slug: "dzialania_pisemne", name: "Działania pisemne" },
        { slug: "podzielnosc", name: "Podzielność liczb" },
        { slug: "nwd_i_nww", name: "NWD i NWW" },
        { slug: "zaokraglanie_i_szacowanie", name: "Zaokrąglanie i szacowanie" },
        { slug: "ulamki", name: "Ułamki zwykłe" },
        { slug: "ulamki_dziesietne", name: "Ułamki dziesiętne" },
        { slug: "liczby_calkowite", name: "Liczby całkowite" },
        { slug: "potegi", name: "Potęgi" },
        { slug: "pierwiastki", name: "Pierwiastki" },
        { slug: "notacja_wykladnicza", name: "Notacja wykładnicza" },
        { slug: "procenty", name: "Procenty" },
        { slug: "system_rzymski", name: "System rzymski" },
        { slug: "kolejnosc_dzialan", name: "Kolejność wykonywania działań" },
      ],
    },
    {
      slug: "obliczenia_praktyczne",
      name: "Obliczenia praktyczne",
      topics: [
        { slug: "czas_droga_predkosc", name: "Czas, droga i prędkość" },
        { slug: "jednostki_i_pieniadze", name: "Jednostki, czas i pieniądze" },
        { slug: "skala", name: "Skala i plan" },
        { slug: "zegar_i_kalendarz", name: "Zegar i kalendarz" },
        { slug: "temperatura", name: "Temperatura" },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra",
      topics: [
        { slug: "wyrazenia_algebraiczne", name: "Wyrażenia algebraiczne" },
        { slug: "przeksztalcanie_wyrazen", name: "Przekształcanie wyrażeń" },
        { slug: "wzory_skroconego_mnozenia", name: "Wzory skróconego mnożenia" },
        { slug: "rownania", name: "Równania" },
        { slug: "nierownosci", name: "Nierówności" },
        { slug: "proporcje", name: "Proporcje" },
        { slug: "wyznaczanie_wielkosci_ze_wzoru", name: "Wyznaczanie wielkości ze wzoru" },
      ],
    },
    {
      slug: "geometria",
      name: "Geometria płaska",
      topics: [
        { slug: "proste_i_odcinki", name: "Proste, półproste i odcinki" },
        { slug: "katy", name: "Kąty i proste" },
        { slug: "trojkaty", name: "Trójkąty" },
        { slug: "czworokaty", name: "Czworokąty" },
        { slug: "wielokaty", name: "Wielokąty" },
        { slug: "wielokaty_foremne", name: "Wielokąty foremne" },
        { slug: "obwody", name: "Obwody figur" },
        { slug: "pola_figur", name: "Pola figur" },
        { slug: "pitagoras", name: "Twierdzenie Pitagorasa" },
        { slug: "podobienstwo", name: "Podobieństwo figur" },
        { slug: "twierdzenie_talesa", name: "Twierdzenie Talesa" },
        { slug: "okrag_i_kolo", name: "Okrąg i koło" },
        { slug: "symetralna_i_dwusieczna", name: "Symetralna i dwusieczna" },
        { slug: "symetrie", name: "Symetrie" },
      ],
    },
    {
      slug: "geometria_przestrzenna",
      name: "Geometria przestrzenna",
      topics: [
        { slug: "bryly", name: "Bryły - rozpoznawanie" },
        { slug: "siatki_bryl", name: "Siatki brył" },
        { slug: "objetosc_i_pole", name: "Objętość i pole powierzchni" },
      ],
    },
    {
      slug: "uklad_wspolrzednych",
      name: "Układ współrzędnych",
      topics: [
        { slug: "os_liczbowa", name: "Oś liczbowa" },
        { slug: "punkty_na_plaszczyznie", name: "Punkty na płaszczyźnie" },
        { slug: "dlugosc_odcinka", name: "Długość odcinka" },
        { slug: "srodek_odcinka", name: "Środek odcinka" },
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
        { slug: "tabele_i_wykresy", name: "Tabele i wykresy" },
      ],
    },
    {
      slug: "kombinatoryka",
      name: "Kombinatoryka i prawdopodobieństwo",
      topics: [
        { slug: "prawdopodobienstwo", name: "Prawdopodobieństwo" },
        { slug: "regula_mnozenia", name: "Reguła mnożenia" },
        { slug: "kombinatoryka", name: "Zliczanie obiektów" },
      ],
    },
    {
      slug: "zadania_tekstowe",
      name: "Zadania tekstowe",
      topics: [
        { slug: "zadania_tekstowe", name: "Zadania tekstowe z treścią" },
        { slug: "zadania_na_dowodzenie", name: "Zadania na dowodzenie" },
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
