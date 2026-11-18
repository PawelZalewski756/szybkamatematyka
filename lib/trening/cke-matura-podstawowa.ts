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

/**
 * Drzewo CKE - matura podstawowa.
 *
 * Obejmuje wszystkie sekcje wymagań maturalnych (I-XIII) oraz tematy, które
 * pojawiają się w podstawie programowej liceum/technikum, także gdy w danym
 * roku nie było z nich zadania. Mapowanie i źródło:
 * `docs/cke-podstawa-programowa.md`.
 */
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
        { slug: "pierwiastki", name: "Pierwiastki dowolnego stopnia" },
        { slug: "logarytmy", name: "Logarytmy" },
        { slug: "procenty", name: "Procenty i proporcje" },
        { slug: "notacja_wykladnicza", name: "Notacja wykładnicza" },
        { slug: "zbiory_i_przedzialy", name: "Zbiory i przedziały" },
        { slug: "wartosc_bezwzgledna", name: "Wartość bezwzględna" },
        { slug: "kolejnosc_dzialan", name: "Kolejność wykonywania działań" },
        { slug: "dowody_podzielnosci", name: "Dowody podzielności" },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra i równania",
      topics: [
        { slug: "wyrazenia_algebraiczne", name: "Wyrażenia algebraiczne" },
        { slug: "wzory_skroconego_mnozenia", name: "Wzory skróconego mnożenia" },
        { slug: "przeksztalcanie_wyrazen", name: "Przekształcanie wyrażeń" },
        { slug: "wielomiany", name: "Wielomiany i rozkład na czynniki" },
        { slug: "dzielenie_wielomianow", name: "Dzielenie wielomianów" },
        { slug: "wyrazenia_wymierne", name: "Wyrażenia i równania wymierne" },
        { slug: "rownania_liniowe", name: "Równania liniowe" },
        { slug: "rownania_kwadratowe", name: "Równania kwadratowe" },
        { slug: "rownania_wielomianowe", name: "Równania wielomianowe" },
        { slug: "rownania_wymierne", name: "Równania wymierne" },
        { slug: "nierownosci", name: "Nierówności" },
        { slug: "nierownosci_kwadratowe", name: "Nierówności kwadratowe" },
        {
          slug: "rownania_z_wartoscia_bezwzgledna",
          name: "Równania z wartością bezwzględną",
        },
        { slug: "wzory_viete", name: "Wzory Viète'a" },
        { slug: "uklady_rownan", name: "Układy równań" },
        { slug: "uklady_liniowo_kwadratowe", name: "Układy liniowo-kwadratowe" },
        { slug: "zadania_tekstowe_uklady", name: "Zadania tekstowe z układami" },
      ],
    },
    {
      slug: "funkcje",
      name: "Funkcje",
      topics: [
        { slug: "funkcja_liniowa", name: "Funkcja liniowa" },
        { slug: "funkcja_kwadratowa", name: "Funkcja kwadratowa" },
        { slug: "funkcja_wykladnicza", name: "Funkcja wykładnicza" },
        { slug: "funkcja_logarytmiczna", name: "Funkcja logarytmiczna" },
        {
          slug: "proporcjonalnosc_odwrotna",
          name: "Proporcjonalność odwrotna i funkcja f(x)=a/x",
        },
        { slug: "wlasnosci_funkcji", name: "Własności funkcji i wykres" },
        { slug: "odczyt_wykresu", name: "Odczyt wykresu funkcji" },
        { slug: "przeksztalcenia_wykresow", name: "Przekształcenia wykresów" },
      ],
    },
    {
      slug: "ciagi",
      name: "Ciągi",
      topics: [
        { slug: "ciag_arytmetyczny", name: "Ciąg arytmetyczny" },
        { slug: "ciag_geometryczny", name: "Ciąg geometryczny" },
        { slug: "wyrazy_ciagu", name: "Wyrazy i monotoniczność ciągu" },
        { slug: "granica_ciagu", name: "Granica ciągu" },
        { slug: "szereg_geometryczny", name: "Szereg geometryczny" },
      ],
    },
    {
      slug: "trygonometria",
      name: "Trygonometria",
      topics: [
        { slug: "sin_cos_tg", name: "Sinus, cosinus, tangens" },
        {
          slug: "twierdzenie_sinusow_cosinusow",
          name: "Twierdzenie sinusów i cosinusów",
        },
        {
          slug: "zastosowania_trygonometrii",
          name: "Zastosowania trygonometrii",
        },
        {
          slug: "tozsamosci_trygonometryczne",
          name: "Tożsamości trygonometryczne",
        },
        { slug: "miara_lukowa", name: "Miara łukowa kąta" },
        { slug: "wzory_redukcyjne", name: "Wzory redukcyjne" },
      ],
    },
    {
      slug: "geometria",
      name: "Geometria",
      topics: [
        { slug: "planimetria", name: "Planimetria" },
        {
          slug: "tales_dwusieczna_okrag",
          name: "Twierdzenie Talesa, dwusieczna i okrąg wpisany",
        },
        { slug: "pitagoras_i_podobienstwo", name: "Tw. Pitagorasa i podobieństwo" },
        { slug: "okrag_i_kolo", name: "Okrąg i koło" },
        { slug: "wielokaty_foremne", name: "Wielokąty foremne" },
        {
          slug: "punkty_szczegolne_trojkata",
          name: "Punkty szczególne trójkąta",
        },
        { slug: "wycinek_i_luk", name: "Wycinek koła i łuk okręgu" },
        { slug: "stereometria", name: "Stereometria" },
        { slug: "katy_w_brylach", name: "Kąty w bryłach" },
        { slug: "przekroje_bryl", name: "Przekroje brył" },
        { slug: "bryly_podobne", name: "Bryły podobne" },
        { slug: "walce_stozki_kule", name: "Walec, stożek i kula" },
        { slug: "geometria_analityczna", name: "Geometria analityczna" },
        { slug: "rownanie_okregu", name: "Równanie okręgu" },
        {
          slug: "odleglosc_punktu_od_prostej",
          name: "Odległość punktu od prostej",
        },
        { slug: "wektory", name: "Wektory" },
      ],
    },
    {
      slug: "kombinatoryka",
      name: "Kombinatoryka i statystyka",
      topics: [
        { slug: "kombinatoryka", name: "Kombinatoryka" },
        { slug: "regula_mnozenia", name: "Reguła mnożenia i dodawania" },
        { slug: "permutacje", name: "Permutacje" },
        { slug: "kombinacje", name: "Kombinacje" },
        { slug: "prawdopodobienstwo", name: "Prawdopodobieństwo" },
        {
          slug: "prawdopodobienstwo_warunkowe",
          name: "Prawdopodobieństwo warunkowe",
        },
        { slug: "schemat_bernoulliego", name: "Schemat Bernoulliego" },
        { slug: "statystyka", name: "Statystyka" },
        {
          slug: "statystyka_zaawansowana",
          name: "Statystyka opisowa: średnia ważona i odchylenie",
        },
        { slug: "srednia_wazona", name: "Średnia ważona" },
        { slug: "odchylenie_standardowe", name: "Odchylenie standardowe" },
      ],
    },
    {
      slug: "optymalizacja",
      name: "Optymalizacja",
      topics: [
        {
          slug: "zadania_optymalizacyjne",
          name: "Zadania optymalizacyjne",
        },
        { slug: "granice_funkcji", name: "Granice funkcji" },
        { slug: "pochodna", name: "Pochodna funkcji" },
        {
          slug: "monotonicznosc_i_ekstrema",
          name: "Monotoniczność i ekstrema",
        },
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
