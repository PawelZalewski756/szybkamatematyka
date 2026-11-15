import type { ExamType } from "@/types/database";

/**
 * Podsumowanie tematu renderowane na końcu lekcji.
 *
 * Wariant dobieramy do treści, nie do szablonu:
 * - steps: proces, kolejność działań,
 * - figure: geometria, kształt i zależności,
 * - plot: funkcje, zależność i punkty charakterystyczne.
 *
 * Treści trzymamy w kodzie, więc podmiana nie wymaga migracji bazy.
 */
export type SummaryItem = {
  title: string;
  note?: string;
  /** Tekst lub LaTeX w $...$, np. "$x^2$, $\\sqrt{x}$". */
  formula?: string;
};

export type StepsSummary = {
  variant: "steps";
  eyebrow: string;
  title: string;
  intro?: string;
  items: SummaryItem[];
  footer?: string;
};

export type FigureSummary = {
  variant: "figure";
  eyebrow: string;
  title: string;
  intro?: string;
  figure:
    | "right-triangle"
    | "right-triangle-angle"
    | "circle"
    | "triangle"
    | "quadrilateral"
    | "solid"
    | "angle"
    | "symmetry";
  /** Tekst lub LaTeX w $...$. */
  formula: string;
  bullets: string[];
  footer?: string;
};

export type PlotSummary = {
  variant: "plot";
  eyebrow: string;
  title: string;
  intro?: string;
  plot: "parabola" | "line" | "exponential" | "points" | "curve";
  /** Tekst lub LaTeX w $...$. */
  formula: string;
  facts: SummaryItem[];
  footer?: string;
};

export type CheatsheetSummary = {
  variant: "cheatsheet";
  eyebrow: string;
  title: string;
  intro?: string;
  items: SummaryItem[];
  footer?: string;
};

export type TableSummary = {
  variant: "table";
  eyebrow: string;
  title: string;
  intro?: string;
  columns: string[];
  rows: string[][];
  footer?: string;
};

export type TopicSummary =
  | StepsSummary
  | FigureSummary
  | PlotSummary
  | CheatsheetSummary
  | TableSummary;

const TOPIC_SUMMARIES: Record<string, TopicSummary> = {
  "matura_podstawowa:liczby_rzeczywiste:kolejnosc_dzialan": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Kolejność działań",
    intro: "Cztery poziomy priorytetu. Zawsze od góry do dołu.",
    items: [
      {
        title: "Nawiasy",
        note: "od najbardziej wewnętrznych",
        formula: "( ) [ ] { }",
      },
      {
        title: "Potęgowanie i pierwiastkowanie",
        note: "ten sam priorytet",
        formula: "$x^2$, $\\sqrt{x}$",
      },
      {
        title: "Mnożenie i dzielenie",
        note: "od lewej do prawej",
        formula: "$\\cdot$, $:$",
      },
      {
        title: "Dodawanie i odejmowanie",
        note: "od lewej do prawej",
        formula: "$+$, $-$",
      },
    ],
    footer: "W tym samym kroku licz od lewej do prawej.",
  },

  "8_klasa:liczby:procenty": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Procenty krok po kroku",
    intro: "Od procentu do wyniku w czterech krokach.",
    items: [
      {
        title: "Zamień procent na ułamek",
        note: "np. 20% to 0,2",
        formula: "$p\\% = \\frac{p}{100}$",
      },
      {
        title: "Pomnóż przez całość",
        note: "obliczasz część z całości",
        formula: "$p\\% \\cdot L$",
      },
      {
        title: "Dodaj lub odejmij zmianę",
        note: "podwyżka albo obniżka",
        formula: "$L\\left(1 \\pm \\frac{p}{100}\\right)$",
      },
      {
        title: "Sprawdź sens wyniku",
        note: "część nie może być większa od całości",
      },
    ],
    footer: "Procent składany licz osobno dla każdego okresu.",
  },

  "matura_podstawowa:geometria:pitagoras_i_podobienstwo": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Twierdzenie Pitagorasa",
    intro: "Długość przeciwprostokątnej z dwóch przyprostokątnych.",
    figure: "right-triangle",
    formula: "$a^2 + b^2 = c^2$",
    bullets: [
      "$a$, $b$ - przyprostokątne",
      "$c$ - przeciwprostokątna",
      "tylko w trójkącie prostokątnym",
      "podobieństwo: boki w skali $k$",
    ],
    footer: "Przykład: $3^2 + 4^2 = 5^2$. Pola zmieniają się jak $k^2$.",
  },

  "matura_podstawowa:funkcje:funkcja_kwadratowa": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Funkcja kwadratowa",
    intro: "Wykres, wierzchołek i miejsca zerowe.",
    plot: "parabola",
    formula: "$y = ax^2 + bx + c$",
    facts: [
      { title: "$a > 0$ / $a < 0$", note: "ramiona w górę / w dół" },
      { title: "$p = -\\frac{b}{2a}$", note: "współrzędna x wierzchołka" },
      { title: "$\\Delta = b^2 - 4ac$", note: "wyróżnik" },
      { title: "$x_1$, $x_2$", note: "miejsca zerowe dla $\\Delta > 0$" },
    ],
    footer:
      "$\\Delta > 0$: dwa miejsca zerowe. $\\Delta = 0$: jedno. $\\Delta < 0$: brak.",
  },

  "8_klasa:geometria:okrag_i_kolo": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Okrąg i koło",
    intro: "Promień, średnica, obwód i pole.",
    figure: "circle",
    formula: "$L = 2\\pi r$, $P = \\pi r^2$",
    bullets: [
      "$r$ - promień, $d = 2r$",
      "$L$ - obwód okręgu",
      "$P$ - pole koła",
    ],
    footer: "Obwód ma jednostki liniowe, pole - kwadratowe.",
  },

  "matura_podstawowa:liczby_rzeczywiste:procenty": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Procenty w zadaniach",
    intro: "Od procentu do nowej wartości.",
    items: [
      {
        title: "Zamień procent na ułamek",
        note: "np. 15% to 0,15",
        formula: "$p\\% = \\frac{p}{100}$",
      },
      {
        title: "Oblicz zmianę",
        note: "część z całości",
        formula: "$L \\cdot \\frac{p}{100}$",
      },
      {
        title: "Nowa wartość",
        note: "podwyżka lub obniżka",
        formula: "$L\\left(1 \\pm \\frac{p}{100}\\right)$",
      },
      {
        title: "Procent składany",
        note: "odsetki doliczane po każdym okresie",
        formula: "$K_n = K_0\\left(1 + \\frac{p}{100}\\right)^n$",
      },
    ],
    footer:
      "Każdą zmianę procentową licz od aktualnej wartości, nie od początkowej.",
  },

  "matura_podstawowa:algebra:rownania_liniowe": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Równanie liniowe",
    intro: "Cztery kroki do rozwiązania.",
    items: [
      {
        title: "Usuń nawiasy i mianowniki",
        note: "pomnóż przez wspólny mianownik",
      },
      {
        title: "Przenieś wyrazy z x na jedną stronę",
        note: "zmień znak przy przenoszeniu",
        formula: "$ax + b = c$",
      },
      {
        title: "Podziel przez współczynnik",
        note: "dla $a \\ne 0$",
        formula: "$x = \\frac{c - b}{a}$",
      },
      {
        title: "Sprawdź rozwiązanie",
        note: "podstaw x do pierwotnego równania",
      },
    ],
    footer:
      "Równanie może mieć jedno rozwiązanie, brak rozwiązań albo nieskończenie wiele.",
  },

  "matura_podstawowa:algebra:rownania_kwadratowe": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Równanie kwadratowe",
    intro: "Delta, pierwiastki i sprawdzenie.",
    items: [
      {
        title: "Zapisz postać ogólną",
        note: "$a \\ne 0$",
        formula: "$ax^2 + bx + c = 0$",
      },
      {
        title: "Oblicz deltę",
        formula: "$\\Delta = b^2 - 4ac$",
      },
      {
        title: "Oblicz pierwiastki",
        note: "dla $\\Delta \\ge 0$",
        formula: "$x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$",
      },
      {
        title: "Sprawdź wynik",
        note: "delta i podstawienie do równania",
      },
    ],
    footer: "Delta ujemna oznacza brak rozwiązań rzeczywistych.",
  },

  "matura_podstawowa:algebra:nierownosci": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Nierówność liniowa",
    intro: "Przekształć, podziel i zapisz przedział.",
    items: [
      {
        title: "Przenieś wyrazy",
        note: "tak samo jak w równaniu",
      },
      {
        title: "Podziel przez współczynnik",
        note: "przy ujemnym zmień znak nierówności",
      },
      {
        title: "Zapisz przedział",
        formula: "$x \\in (a, b)$",
      },
      {
        title: "Sprawdź punkt",
        note: "wstaw liczbę z przedziału do nierówności",
      },
    ],
  },

  "matura_podstawowa:algebra:uklady_rownan": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Układ równań",
    intro: "Dwie niewiadome, jedna para rozwiązań.",
    items: [
      {
        title: "Wybierz metodę",
        note: "podstawianie lub przeciwnych współczynników",
      },
      {
        title: "Zredukuj do jednej niewiadomej",
        note: "dodaj lub odejmij równania",
      },
      {
        title: "Oblicz drugą niewiadomą",
        note: "podstaw wynik do jednego z równań",
      },
      {
        title: "Sprawdź parę",
        note: "$(x, y)$ musi spełniać oba równania",
      },
    ],
  },

  "matura_podstawowa:ciagi:ciag_arytmetyczny": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Ciąg arytmetyczny",
    intro: "Różnica, wyraz i suma.",
    items: [
      {
        title: "Znajdź różnicę",
        formula: "$r = a_{n+1} - a_n$",
      },
      {
        title: "Oblicz n-ty wyraz",
        formula: "$a_n = a_1 + (n-1)r$",
      },
      {
        title: "Oblicz sumę",
        formula: "$S_n = \\frac{a_1 + a_n}{2} \\cdot n$",
      },
      {
        title: "Sprawdź",
        note: "kolejne wyrazy różnią się o $r$",
      },
    ],
  },

  "matura_podstawowa:ciagi:ciag_geometryczny": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Ciąg geometryczny",
    intro: "Iloraz, wyraz i suma.",
    items: [
      {
        title: "Znajdź iloraz",
        formula: "$q = \\frac{a_{n+1}}{a_n}$",
      },
      {
        title: "Oblicz n-ty wyraz",
        formula: "$a_n = a_1 q^{n-1}$",
      },
      {
        title: "Oblicz sumę",
        note: "dla $q \\ne 1$",
        formula: "$S_n = a_1 \\frac{1-q^n}{1-q}$",
      },
      {
        title: "Sprawdź",
        note: "kolejne wyrazy mają stały iloraz",
      },
    ],
  },

  "matura_podstawowa:kombinatoryka:kombinatoryka": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Kombinatoryka",
    intro: "Najpierw ustal, czy kolejność ma znaczenie.",
    items: [
      {
        title: "Reguła mnożenia",
        note: "etapy niezależne mnożymy",
      },
      {
        title: "Permutacje",
        formula: "$n!$",
      },
      {
        title: "Kombinacje",
        formula: "$\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$",
      },
      {
        title: "Wariacje",
        note: "z powtórzeniami",
        formula: "$n^k$",
      },
    ],
    footer: "Kolejność ma znaczenie - wariacje. Nie ma - kombinacje.",
  },

  "matura_podstawowa:kombinatoryka:prawdopodobienstwo": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Prawdopodobieństwo",
    intro: "Policz wszystkie wyniki i te sprzyjające.",
    items: [
      {
        title: "Policz wszystkie wyniki",
        formula: "$|\\Omega|$",
      },
      {
        title: "Policz wyniki sprzyjające",
        formula: "$|A|$",
      },
      {
        title: "Podziel",
        formula: "$P(A) = \\frac{|A|}{|\\Omega|}$",
      },
      {
        title: "Sprawdź zakres",
        formula: "$0 \\le P(A) \\le 1$",
      },
    ],
  },

  "8_klasa:liczby:ulamki": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Ułamki",
    intro: "Wspólny mianownik, skracanie i liczba mieszana.",
    items: [
      {
        title: "Znajdź wspólny mianownik",
        note: "dodawanie i odejmowanie",
      },
      {
        title: "Skróć przed mnożeniem",
        note: "mnożenie i dzielenie",
      },
      {
        title: "Zamień liczbę mieszaną",
        formula: "$a\\frac{b}{c} = \\frac{ac + b}{c}$",
      },
      {
        title: "Sprawdź wynik",
        note: "czy ułamek jest nieskracalny",
      },
    ],
  },

  "8_klasa:liczby:liczby_calkowite": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Liczby całkowite",
    intro: "Znaki, odejmowanie i kolejność.",
    items: [
      {
        title: "Ustal znak sumy",
        note: "ten sam znak - dodaj, różne - odejmij",
      },
      {
        title: "Zamień odejmowanie",
        formula: "$a - b = a + (-b)$",
      },
      {
        title: "Mnożenie i dzielenie",
        note: "minus razy minus daje plus",
      },
      {
        title: "Pamiętaj o kolejności",
        note: "nawiasy, potęgi, mnożenie, dodawanie",
      },
    ],
  },

  "8_klasa:liczby:podzielnosc": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Podzielność",
    intro: "Cechy, rozkład, NWD i NWW.",
    items: [
      {
        title: "Sprawdź cechy podzielności",
        note: "2, 3, 5, 9 i 10",
      },
      {
        title: "Rozłóż na czynniki pierwsze",
        formula: "$180 = 2^2 \\cdot 3^2 \\cdot 5$",
      },
      {
        title: "Oblicz NWD",
        note: "wspólne czynniki, najmniejsze wykładniki",
      },
      {
        title: "Oblicz NWW",
        note: "wszystkie czynniki, największe wykładniki",
      },
    ],
  },

  "8_klasa:liczby:kolejnosc_dzialan": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Kolejność działań",
    intro: "Cztery poziomy priorytetu. Zawsze od góry do dołu.",
    items: [
      {
        title: "Nawiasy",
        note: "od najbardziej wewnętrznych",
        formula: "( ) [ ] { }",
      },
      {
        title: "Potęgowanie i pierwiastkowanie",
        note: "ten sam priorytet",
        formula: "$x^2$, $\\sqrt{x}$",
      },
      {
        title: "Mnożenie i dzielenie",
        note: "od lewej do prawej",
        formula: "$\\cdot$, $:$",
      },
      {
        title: "Dodawanie i odejmowanie",
        note: "od lewej do prawej",
        formula: "$+$, $-$",
      },
    ],
    footer: "W tym samym kroku licz od lewej do prawej.",
  },

  "8_klasa:algebra:rownania": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Równanie liniowe",
    intro: "Od uporządkowania do sprawdzenia.",
    items: [
      {
        title: "Uporządkuj równanie",
        note: "nawiasy i wyrazy podobne",
      },
      {
        title: "Przenieś na jedną stronę",
        note: "zmień znak przy przenoszeniu",
      },
      {
        title: "Podziel przez współczynnik",
        formula: "$x = \\frac{c}{a}$",
      },
      {
        title: "Sprawdź",
        note: "podstaw wynik do równania",
      },
    ],
  },

  "8_klasa:algebra:proporcje": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Proporcje i skala",
    intro: "Zapisz proporcję i pomnóż na krzyż.",
    items: [
      {
        title: "Zapisz proporcję",
        formula: "$\\frac{a}{b} = \\frac{c}{d}$",
      },
      {
        title: "Pomnóż na krzyż",
        formula: "$ad = bc$",
      },
      {
        title: "Rozwiąż",
        formula: "$x = \\frac{bc}{a}$",
      },
      {
        title: "Sprawdź sens",
        note: "jednostki i skala",
      },
    ],
  },

  "8_klasa:kombinatoryka:prawdopodobienstwo": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Prawdopodobieństwo",
    intro: "Wszystkie wyniki, sprzyjające, ułamek.",
    items: [
      {
        title: "Policz wszystkie wyniki",
        formula: "$|\\Omega|$",
      },
      {
        title: "Policz wyniki sprzyjające",
        formula: "$|A|$",
      },
      {
        title: "Podziel",
        formula: "$P(A) = \\frac{|A|}{|\\Omega|}$",
      },
      {
        title: "Zapisz ułamek nieskracalny",
        note: "sprawdź, czy wynik ma sens",
      },
    ],
  },

  "8_klasa:kombinatoryka:regula_mnozenia": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Reguła mnożenia",
    intro: "Policz etapy i opcje na każdym etapie.",
    items: [
      {
        title: "Policz etapy",
        note: "ile decyzji podejmujesz",
      },
      {
        title: "Policz opcje na etap",
        note: "ile możliwości na każdym etapie",
      },
      {
        title: "Pomnóż",
        formula: "$n_1 \\cdot n_2 \\cdot \\ldots$",
      },
      {
        title: "Sprawdź",
        note: "czy kolejność ma znaczenie",
      },
    ],
  },

  "matura_podstawowa:trygonometria:sin_cos_tg": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Sinus, cosinus, tangens",
    intro: "Trzy stosunki boków w trójkącie prostokątnym.",
    figure: "right-triangle-angle",
    formula:
      "$\\sin\\alpha = \\frac{a}{c}$, $\\cos\\alpha = \\frac{b}{c}$, $\\operatorname{tg}\\alpha = \\frac{a}{b}$",
    bullets: [
      "$a$ - bok naprzeciw kąta $\\alpha$",
      "$b$ - bok przy kącie $\\alpha$",
      "$c$ - przeciwprostokątna",
    ],
    footer: "Kąt prosty jest naprzeciw przeciwprostokątnej.",
  },

  "matura_podstawowa:trygonometria:zastosowania_trygonometrii": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Trygonometria w zadaniach",
    intro: "Szukaj trójkąta prostokątnego w opisie zadania.",
    figure: "right-triangle-angle",
    formula: "$\\sin\\alpha = \\frac{h}{c}$",
    bullets: [
      "kąt elewacji lub depresji",
      "wysokość i odległość",
      "szukaj trójkąta prostokątnego",
    ],
    footer: "Rysunek pomaga ustalić, który bok jest naprzeciw kąta.",
  },

  "matura_podstawowa:geometria:planimetria": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Planimetria",
    intro: "Kąty, boki i wysokości w jednej figurze.",
    figure: "triangle",
    formula: "$P = \\frac{1}{2}ah$",
    bullets: [
      "suma kątów trójkąta to $180^\\circ$",
      "obwód to suma długości boków",
      "wysokość jest prostopadła do podstawy",
    ],
    footer: "Pole zależy od podstawy i wysokości, nie od kształtu.",
  },

  "matura_podstawowa:geometria:okrag_i_kolo": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Okrąg i koło",
    intro: "Promień, średnica, obwód i pole.",
    figure: "circle",
    formula: "$L = 2\\pi r$, $P = \\pi r^2$",
    bullets: [
      "$r$ - promień, $d = 2r$",
      "$L$ - obwód okręgu",
      "$P$ - pole koła",
    ],
    footer: "Obwód ma jednostki liniowe, pole - kwadratowe.",
  },

  "matura_podstawowa:geometria:stereometria": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Stereometria",
    intro: "Objętość i pole powierzchni bryły.",
    figure: "solid",
    formula: "$V = abc$, $P = 2(ab + ac + bc)$",
    bullets: [
      "objętość w jednostkach sześciennych",
      "pole powierzchni to suma ścian",
      "rysuj bryłę i zaznacz krawędzie",
    ],
    footer: "Najpierw nazwij bryłę, potem wybierz wzór.",
  },

  "8_klasa:geometria:katy": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Kąty i proste",
    intro: "Kąty wierzchołkowe, przyległe i odpowiadające.",
    figure: "angle",
    formula: "$\\alpha + \\beta = 180^\\circ$",
    bullets: [
      "kąty wierzchołkowe są równe",
      "kąty przyległe sumują się do $180^\\circ$",
      "przy prostych równoległych kąty odpowiadające są równe",
    ],
    footer: "Zaznacz kąty na rysunku, zanim zaczniesz liczyć.",
  },

  "8_klasa:geometria:obwody": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Obwody figur",
    intro: "Obwód to suma długości boków.",
    figure: "quadrilateral",
    formula: "$Obw = 2(a + b)$",
    bullets: [
      "obwód to suma długości boków",
      "jednostki liniowe",
      "kwadrat: $4a$",
    ],
    footer: "Obwód nie zależy od pola.",
  },

  "8_klasa:geometria:pola_figur": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Pola figur",
    intro: "Trójkąt, prostokąt i kwadrat.",
    figure: "triangle",
    formula: "$P = \\frac{1}{2}ah$, $P = ab$",
    bullets: [
      "trójkąt: połowa iloczynu podstawy i wysokości",
      "prostokąt: iloczyn boków",
      "kwadrat: $a^2$",
    ],
    footer: "Pole podajesz w jednostkach kwadratowych.",
  },

  "8_klasa:geometria:pitagoras": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Twierdzenie Pitagorasa",
    intro: "Długość przeciwprostokątnej z dwóch przyprostokątnych.",
    figure: "right-triangle",
    formula: "$a^2 + b^2 = c^2$",
    bullets: [
      "$a$, $b$ - przyprostokątne",
      "$c$ - przeciwprostokątna",
      "tylko w trójkącie prostokątnym",
    ],
    footer: "Przykład: $3^2 + 4^2 = 5^2$.",
  },

  "8_klasa:geometria:podobienstwo": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Podobieństwo figur",
    intro: "Ten sam kształt, inna skala.",
    figure: "triangle",
    formula: "$\\frac{a'}{a} = \\frac{b'}{b} = \\frac{c'}{c} = k$",
    bullets: [
      "kąty pozostają równe",
      "boki są w skali $k$",
      "pola są w skali $k^2$",
    ],
    footer: "Skala podobieństwa dotyczy długości, nie pól.",
  },

  "8_klasa:geometria:symetrie": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Symetrie",
    intro: "Odbicie względem osi lub punktu.",
    figure: "symmetry",
    formula: "odległości od osi są równe",
    bullets: [
      "symetria osiowa",
      "symetria środkowa",
      "figura może mieć oś symetrii",
    ],
    footer: "Odbicie zachowuje kształt i rozmiar.",
  },

  "8_klasa:geometria_przestrzenna:bryly": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Bryły",
    intro: "Nazwij bryłę i wypisz dane.",
    figure: "solid",
    formula: "$V = abc$",
    bullets: [
      "graniastosłup",
      "ostrosłup",
      "walec, stożek i kula",
    ],
    footer: "Nazwa bryły podpowiada wzór.",
  },

  "8_klasa:geometria_przestrzenna:objetosc_i_pole": {
    variant: "figure",
    eyebrow: "GEOMETRIA",
    title: "Objętość i pole powierzchni",
    intro: "Dwie różne wielkości, dwie różne jednostki.",
    figure: "solid",
    formula: "$V = abc$, $P = 2(ab + ac + bc)$",
    bullets: [
      "objętość: jednostki sześcienne",
      "pole: jednostki kwadratowe",
      "suma pól wszystkich ścian",
    ],
    footer: "Sprawdź, czy liczysz objętość, czy pole.",
  },

  "matura_podstawowa:funkcje:funkcja_liniowa": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Funkcja liniowa",
    intro: "Prosta, nachylenie i miejsce zerowe.",
    plot: "line",
    formula: "$y = ax + b$",
    facts: [
      { title: "$a > 0$ / $a < 0$", note: "rosnąca / malejąca" },
      { title: "$b$", note: "przecięcie z osią OY" },
      {
        title: "$x_0 = -\\frac{b}{a}$",
        note: "miejsce zerowe dla $a \\ne 0$",
      },
    ],
    footer: "Współczynnik $a$ decyduje o nachyleniu prostej.",
  },

  "matura_podstawowa:funkcje:funkcja_wykladnicza": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Funkcja wykładnicza",
    intro: "Wzrost lub spadek w jednakowym tempie.",
    plot: "exponential",
    formula: "$y = a^x$",
    facts: [
      { title: "$a > 1$", note: "funkcja rosnąca" },
      { title: "$0 < a < 1$", note: "funkcja malejąca" },
      { title: "$(0, 1)$", note: "punkt wspólny dla każdej podstawy" },
    ],
    footer: "Dziedziną jest zbiór liczb rzeczywistych.",
  },

  "matura_podstawowa:funkcje:wlasnosci_funkcji": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Własności funkcji",
    intro: "Co można odczytać z wykresu.",
    plot: "curve",
    formula: "odczyt własności z wykresu",
    facts: [
      { title: "dziedzina i zbiór wartości" },
      { title: "monotoniczność" },
      { title: "miejsca zerowe i ekstrema" },
    ],
    footer: "Zaznacz na wykresie punkty charakterystyczne.",
  },

  "matura_podstawowa:funkcje:odczyt_wykresu": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Odczyt wykresu",
    intro: "Wartość dla argumentu i argument dla wartości.",
    plot: "curve",
    formula: "wartość i argument",
    facts: [
      { title: "wartość funkcji dla danego $x$" },
      { title: "argument dla danej wartości" },
      { title: "miejsca zerowe" },
    ],
    footer: "Pionowa prosta przecina wykres co najwyżej raz.",
  },

  "matura_podstawowa:geometria:geometria_analityczna": {
    variant: "plot",
    eyebrow: "GEOMETRIA",
    title: "Geometria analityczna",
    intro: "Punkty, odcinki i proste w układzie współrzędnych.",
    plot: "points",
    formula: "$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$",
    facts: [
      { title: "odległość punktów" },
      { title: "środek odcinka" },
      { title: "równanie prostej" },
    ],
    footer: "Rysunek w układzie współrzędnych porządkuje dane.",
  },

  "8_klasa:uklad_wspolrzednych:punkty_na_plaszczyznie": {
    variant: "plot",
    eyebrow: "UKŁAD WSPÓŁRZĘDNYCH",
    title: "Punkty na płaszczyźnie",
    intro: "Najpierw x, potem y.",
    plot: "points",
    formula: "$A = (x, y)$",
    facts: [
      { title: "oś OX i OY" },
      { title: "cztery ćwiartki" },
      { title: "kolejność współrzędnych" },
    ],
    footer: "Punkt na osi ma jedną współrzędną równą zero.",
  },

  "8_klasa:uklad_wspolrzednych:dlugosc_odcinka": {
    variant: "plot",
    eyebrow: "UKŁAD WSPÓŁRZĘDNYCH",
    title: "Długość odcinka",
    intro: "Odległość dwóch punktów z twierdzenia Pitagorasa.",
    plot: "points",
    formula: "$|AB| = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$",
    facts: [
      { title: "różnica współrzędnych" },
      { title: "twierdzenie Pitagorasa" },
      { title: "jednostki długości" },
    ],
    footer: "Podstaw współrzędne w tej samej kolejności.",
  },

  "8_klasa:funkcje:wykresy": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Odczyt wykresu",
    intro: "Wartości, miejsca zerowe i ekstrema.",
    plot: "curve",
    formula: "odczyt wykresu",
    facts: [
      { title: "wartość dla danego argumentu" },
      { title: "miejsca zerowe" },
      { title: "największa i najmniejsza wartość" },
    ],
    footer: "Patrz na punkty charakterystyczne.",
  },

  "8_klasa:funkcje:proporcjonalnosc": {
    variant: "plot",
    eyebrow: "FUNKCJE",
    title: "Proporcjonalność prosta",
    intro: "Prosta przechodząca przez początek układu.",
    plot: "line",
    formula: "$y = ax$",
    facts: [
      { title: "prosta przez $(0,0)$" },
      { title: "$a > 0$: rośnie" },
      { title: "$a < 0$: maleje" },
    ],
    footer:
      "Proporcjonalność prosta to szczególny przypadek funkcji liniowej.",
  },

  "matura_podstawowa:kombinatoryka:statystyka": {
    variant: "table",
    eyebrow: "STATYSTYKA",
    title: "Miary statystyczne",
    intro: "Którą miarę wybrać i co ona pokazuje.",
    columns: ["Miara", "Co pokazuje", "Kiedy używać"],
    rows: [
      ["Średnia", "suma podzielona przez liczbę obserwacji", "gdy dane są w miarę równomierne"],
      ["Mediana", "środkowa wartość po uporządkowaniu", "gdy są skrajne wartości"],
      ["Dominanta", "najczęstsza wartość", "gdy dane są jakościowe lub powtarzalne"],
      ["Odchylenie standardowe", "rozproszenie wokół średniej", "gdy ważna jest zmienność"],
    ],
    footer: "Najpierw uporządkuj dane, potem licz.",
  },

  "8_klasa:statystyka:srednia": {
    variant: "table",
    eyebrow: "STATYSTYKA",
    title: "Średnia arytmetyczna",
    intro: "Cztery kroki, które zawsze działają.",
    columns: ["Krok", "Działanie", "Przykład"],
    rows: [
      ["1", "Dodaj wszystkie wartości", "2 + 3 + 4 = 9"],
      ["2", "Policz, ile ich jest", "3"],
      ["3", "Podziel sumę przez liczbę", "9 : 3 = 3"],
      ["4", "Sprawdź sens wyniku", "średnia między min a max"],
    ],
    footer: "Średnia nie musi być jedną z danych wartości.",
  },

  "8_klasa:statystyka:mediana_i_dominanta": {
    variant: "table",
    eyebrow: "STATYSTYKA",
    title: "Mediana i dominanta",
    intro: "Dwie miary odporne na skrajne wartości.",
    columns: ["Miara", "Definicja", "Przykład"],
    rows: [
      ["Mediana", "środkowa wartość po uporządkowaniu", "1, 2, 4 -> 2"],
      ["Mediana (parzysta)", "średnia dwóch środkowych", "1, 2, 4, 6 -> 3"],
      ["Dominanta", "najczęstsza wartość", "2, 2, 3 -> 2"],
    ],
    footer: "Uporządkuj dane przed wyznaczeniem mediany.",
  },

  "8_klasa:statystyka:diagramy": {
    variant: "table",
    eyebrow: "STATYSTYKA",
    title: "Diagramy",
    intro: "Który diagram do jakich danych.",
    columns: ["Diagram", "Co pokazuje", "Kiedy"],
    rows: [
      ["Słupkowy", "porównanie kategorii", "gdy kategorie są nazwane"],
      ["Kołowy", "udział części w całości", "gdy sumuje się do 100%"],
      ["Liniowy", "zmianę w czasie", "gdy dane są uporządkowane"],
    ],
    footer: "Czytaj osie i legendę, zanim odczytasz wartość.",
  },

  "matura_podstawowa:liczby_rzeczywiste:potegi": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Potęgi i pierwiastki",
    intro: "Cztery wzory, które wystarczą.",
    items: [
      {
        title: "Mnożenie i dzielenie",
        formula:
          "$a^m \\cdot a^n = a^{m+n}$, $\\frac{a^m}{a^n} = a^{m-n}$",
      },
      { title: "Potęga potęgi", formula: "$(a^m)^n = a^{mn}$" },
      {
        title: "Wykładnik ujemny",
        note: "dla $a \\ne 0$",
        formula: "$a^{-n} = \\frac{1}{a^n}$",
      },
      {
        title: "Pierwiastek jako potęga",
        formula: "$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$",
      },
    ],
    footer: "Dla $a > 0$ wzory działają dla dowolnych wykładników.",
  },

  "matura_podstawowa:liczby_rzeczywiste:logarytmy": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Logarytmy",
    intro: "Definicja i cztery własności.",
    items: [
      {
        title: "Definicja",
        note: "$a > 0$, $a \\ne 1$, $b > 0$",
        formula: "$\\log_a b = x \\iff a^x = b$",
      },
      {
        title: "Iloczyn i iloraz",
        formula:
          "$\\log_a(xy) = \\log_a x + \\log_a y$, $\\log_a \\frac{x}{y} = \\log_a x - \\log_a y$",
      },
      {
        title: "Potęga",
        formula: "$\\log_a x^k = k \\log_a x$",
      },
      {
        title: "Zmiana podstawy",
        formula: "$\\log_a b = \\frac{\\log_c b}{\\log_c a}$",
      },
    ],
  },

  "matura_podstawowa:liczby_rzeczywiste:notacja_wykladnicza": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Notacja wykładnicza",
    intro: "Jedna postać, dwa kierunki zamiany.",
    items: [
      {
        title: "Postać",
        note: "$1 \\le a < 10$",
        formula: "$a \\cdot 10^k$",
      },
      {
        title: "Duże liczby",
        formula: "$123\\,000 = 1{,}23 \\cdot 10^5$",
      },
      {
        title: "Małe liczby",
        formula: "$0{,}0004 = 4 \\cdot 10^{-4}$",
      },
      {
        title: "Mnożenie i dzielenie",
        formula:
          "$10^m \\cdot 10^n = 10^{m+n}$, $\\frac{10^m}{10^n} = 10^{m-n}$",
      },
    ],
  },

  "matura_podstawowa:liczby_rzeczywiste:zbiory_i_przedzialy": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Zbiory i przedziały",
    intro: "Nawiasy mówią, czy koniec należy do zbioru.",
    items: [
      {
        title: "Przedział domknięty",
        note: "oba końce należą",
        formula: "$[a, b]$",
      },
      {
        title: "Przedział otwarty",
        note: "końce nie należą",
        formula: "$(a, b)$",
      },
      { title: "Suma", formula: "$A \\cup B$" },
      { title: "Część wspólna", formula: "$A \\cap B$" },
    ],
    footer: "Przy nieskończoności zawsze nawias okrągły.",
  },

  "matura_podstawowa:liczby_rzeczywiste:wartosc_bezwzgledna": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Wartość bezwzględna",
    intro: "Odległość od zera i dwa typy równań.",
    items: [
      {
        title: "Definicja",
        formula:
          "$|a| = a$ dla $a \\ge 0$, $|a| = -a$ dla $a < 0$",
      },
      {
        title: "Związek z pierwiastkiem",
        formula: "$|a| = \\sqrt{a^2}$",
      },
      {
        title: "Równanie",
        formula: "$|x| = c \\iff x = c \\lor x = -c$",
      },
      {
        title: "Nierówność",
        formula: "$|x| < c \\iff -c < x < c$",
      },
    ],
  },

  "matura_podstawowa:algebra:wyrazenia_algebraiczne": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Wyrażenia algebraiczne",
    intro: "Cztery ruchy, które upraszczają wyrażenie.",
    items: [
      {
        title: "Wyrazy podobne",
        formula: "$3x + 2x = 5x$",
      },
      {
        title: "Rozdzielność",
        formula: "$a(b + c) = ab + ac$",
      },
      {
        title: "Mnożenie sum",
        formula: "$(a+b)(c+d) = ac + ad + bc + bd$",
      },
      {
        title: "Skracanie",
        note: "$b, c \\ne 0$",
        formula: "$\\frac{ac}{bc} = \\frac{a}{b}$",
      },
    ],
  },

  "matura_podstawowa:algebra:wzory_skroconego_mnozenia": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Wzory skróconego mnożenia",
    intro: "Trzy wzory i jeden przykład.",
    items: [
      {
        title: "Kwadrat sumy",
        formula: "$(a+b)^2 = a^2 + 2ab + b^2$",
      },
      {
        title: "Kwadrat różnicy",
        formula: "$(a-b)^2 = a^2 - 2ab + b^2$",
      },
      {
        title: "Różnica kwadratów",
        formula: "$a^2 - b^2 = (a-b)(a+b)$",
      },
      {
        title: "Przykład",
        formula: "$101^2 = (100+1)^2 = 10201$",
      },
    ],
  },

  "8_klasa:liczby:potegi": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Potęgi",
    intro: "Cztery podstawowe działania.",
    items: [
      { title: "Mnożenie", formula: "$a^m \\cdot a^n = a^{m+n}$" },
      { title: "Dzielenie", formula: "$\\frac{a^m}{a^n} = a^{m-n}$" },
      { title: "Potęga potęgi", formula: "$(a^m)^n = a^{mn}$" },
      {
        title: "Zero i ujemny",
        formula: "$a^0 = 1$, $a^{-n} = \\frac{1}{a^n}$",
      },
    ],
  },

  "8_klasa:liczby:pierwiastki": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Pierwiastki",
    intro: "Definicja, iloczyn, iloraz i wyłączanie.",
    items: [
      {
        title: "Definicja",
        note: "$b \\ge 0$",
        formula: "$\\sqrt{a} = b \\iff b^2 = a$",
      },
      {
        title: "Iloczyn",
        formula: "$\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$",
      },
      {
        title: "Iloraz",
        formula: "$\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$",
      },
      {
        title: "Wyłączanie czynnika",
        formula: "$\\sqrt{18} = 3\\sqrt{2}$",
      },
    ],
  },

  "8_klasa:algebra:wyrazenia_algebraiczne": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Wyrażenia algebraiczne",
    intro: "Redukcja, rozdzielność i wartość liczbowa.",
    items: [
      { title: "Redukcja", formula: "$3x + 2x = 5x$" },
      { title: "Rozdzielność", formula: "$a(b+c) = ab + ac$" },
      {
        title: "Mnożenie sum",
        formula: "$(a+b)(c+d) = ac + ad + bc + bd$",
      },
      {
        title: "Wartość liczbowa",
        note: "podstaw liczbę za literę",
      },
    ],
  },

  "8_klasa:algebra:wzory_skroconego_mnozenia": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Wzory skróconego mnożenia",
    intro: "Trzy wzory, które warto znać na pamięć.",
    items: [
      {
        title: "Kwadrat sumy",
        formula: "$(a+b)^2 = a^2 + 2ab + b^2$",
      },
      {
        title: "Kwadrat różnicy",
        formula: "$(a-b)^2 = a^2 - 2ab + b^2$",
      },
      {
        title: "Różnica kwadratów",
        formula: "$a^2 - b^2 = (a-b)(a+b)$",
      },
      {
        title: "Przykład",
        formula: "$21^2 = (20+1)^2 = 441$",
      },
    ],
  },

  "matura_podstawowa:optymalizacja:zadania_optymalizacyjne": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Zadanie optymalizacyjne",
    intro: "Od treści do największej wartości w pięciu krokach.",
    items: [
      {
        title: "Oznacz zmienną",
        note: "np. bok prostokąta",
        formula: "$x$",
      },
      {
        title: "Zapisz warunek",
        note: "zależność z treści zadania",
        formula: "$y = ...$",
      },
      {
        title: "Zbuduj funkcję celu",
        note: "pole, przychód albo zysk",
        formula: "$P(x) = ...$",
      },
      {
        title: "Wyznacz dziedzinę",
        note: "długości muszą być dodatnie",
        formula: "$x > 0$",
      },
      {
        title: "Znajdź wierzchołek",
        note: "dla $a < 0$ to maksimum",
        formula: "$x_w = \\frac{-b}{2a}$",
      },
    ],
    footer: "Sprawdź, czy wierzchołek należy do dziedziny, i podaj wynik z jednostką.",
  },

  "matura_podstawowa:algebra:wielomiany": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Rozkład wielomianu",
    intro: "Cztery sposoby, które prowadzą do iloczynu czynników.",
    items: [
      {
        title: "Wyłącz wspólny czynnik",
        note: "zaczynamy od najprostszego",
        formula: "$x^3 - 4x = x(x^2 - 4)$",
      },
      {
        title: "Użyj wzoru skróconego mnożenia",
        note: "różnica kwadratów",
        formula: "$x^2 - a^2 = (x-a)(x+a)$",
      },
      {
        title: "Spróbuj grupowania",
        note: "gdy są cztery wyrazy",
        formula: "$ax + ay + bx + by$",
      },
      {
        title: "Sprawdź pierwiastki",
        note: "reszta z dzielenia przez $x-a$ to $W(a)$",
        formula: "$W(a) = 0$",
      },
    ],
    footer: "Stopień wielomianu to najwyższa potęga $x$. Pierwiastek to argument, dla którego $W(x)=0$.",
  },

  "matura_podstawowa:algebra:wyrazenia_wymierne": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Wyrażenie wymierne",
    intro: "Dziedzina jest ważniejsza niż samo skracanie.",
    items: [
      {
        title: "Wyznacz dziedzinę",
        note: "mianownik nie może być zerem",
        formula: "$Q(x) \\ne 0$",
      },
      {
        title: "Rozłóż licznik i mianownik",
        note: "wyłącz czynnik lub użyj wzoru",
        formula: "$P(x), Q(x)$",
      },
      {
        title: "Skróć wspólne czynniki",
        note: "pamiętaj o założeniu",
        formula: "$\\frac{P(x)}{Q(x)}$",
      },
      {
        title: "Rozwiąż równanie",
        note: "licznik równy zeru, mianownik różny od zera",
        formula: "$P(x)=0 \\land Q(x)\\ne0$",
      },
    ],
    footer: "Każde rozwiązanie sprawdź z dziedziną. Skracany czynnik też musi być różny od zera.",
  },

  "matura_podstawowa:funkcje:funkcja_logarytmiczna": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Logarytmy i funkcja logarytmiczna",
    intro: "Cztery wzory, które wystarczą.",
    items: [
      {
        title: "Definicja",
        formula: "$\\log_a b = c \\iff a^c = b$",
        note: "dla $a>0$, $a\\ne1$, $b>0$",
      },
      {
        title: "Logarytm iloczynu",
        formula: "$\\log_a(xy) = \\log_a x + \\log_a y$",
      },
      {
        title: "Logarytm ilorazu",
        formula: "$\\log_a\\frac{x}{y} = \\log_a x - \\log_a y$",
      },
      {
        title: "Logarytm potęgi",
        formula: "$\\log_a x^n = n\\log_a x$",
      },
    ],
    footer: "Dziedzina funkcji $f(x)=\\log_a x$ to $x>0$. Dla $a>1$ funkcja rośnie, dla $0<a<1$ maleje.",
  },

  "matura_podstawowa:funkcje:proporcjonalnosc_odwrotna": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Proporcjonalność odwrotna",
    intro: "Stały iloczyn i funkcja $f(x)=\\frac{a}{x}$.",
    items: [
      {
        title: "Wzór",
        formula: "$y = \\frac{a}{x}$",
        note: "$x \\ne 0$, $a \\ne 0$",
      },
      {
        title: "Stały iloczyn",
        formula: "$x \\cdot y = a$",
      },
      {
        title: "Znak parametru",
        formula: "$a>0$: I i III ćwiartka, $a<0$: II i IV",
      },
      {
        title: "Monotoniczność",
        formula: "dla $a>0$ funkcja maleje w każdym przedziale",
      },
    ],
    footer: "W zadaniach o pracy i czasie iloczyn liczby pracowników i liczby dni jest stały.",
  },

  "matura_podstawowa:trygonometria:twierdzenie_sinusow_cosinusow": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Twierdzenie sinusów i cosinusów",
    intro: "Trzy wzory do rozwiązywania trójkątów bez kąta prostego.",
    items: [
      {
        title: "Twierdzenie sinusów",
        formula: "$\\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = 2R$",
      },
      {
        title: "Twierdzenie cosinusów",
        formula: "$c^2 = a^2 + b^2 - 2ab\\cos\\gamma$",
      },
      {
        title: "Pole z sinusem",
        formula: "$P = \\frac12 ab\\sin\\gamma$",
      },
      {
        title: "Kąt prosty",
        formula: "$\\cos90^\\circ = 0$",
        note: "wtedy twierdzenie cosinusów daje Pitagorasa",
      },
    ],
    footer: "Kąt $\\gamma$ w twierdzeniu cosinusów musi być kątem między bokami $a$ i $b$.",
  },

  "matura_podstawowa:geometria:tales_dwusieczna_okrag": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Tales, dwusieczna i okrąg",
    intro: "Cztery twierdzenia, które często łączą się w jednym zadaniu.",
    items: [
      {
        title: "Twierdzenie Talesa",
        formula: "$\\frac{|OA|}{|OB|} = \\frac{|OC|}{|OD|}$",
        note: "proste równoległe przecinają ramiona kąta",
      },
      {
        title: "Twierdzenie o dwusiecznej",
        formula: "$\\frac{|BD|}{|DC|} = \\frac{|AB|}{|AC|}$",
      },
      {
        title: "Kąt wpisany i środkowy",
        formula: "$\\alpha = \\frac12 \\beta$",
        note: "oparte na tym samym łuku",
      },
      {
        title: "Okręgi w trójkącie",
        formula: "wpisany: dwusieczne, opisany: symetralne",
      },
    ],
    footer: "Środek okręgu wpisanego to przecięcie dwusiecznych, a opisanego - symetralnych boków.",
  },

  "matura_podstawowa:kombinatoryka:statystyka_zaawansowana": {
    variant: "table",
    eyebrow: "TABELA",
    title: "Statystyka opisowa",
    intro: "Cztery miary, które trzeba rozróżniać.",
    columns: ["Miara", "Wzór", "Kiedy używać"],
    rows: [
      ["Średnia ważona", "$\\bar{x}=\\frac{\\sum x_iw_i}{\\sum w_i}$", "gdy wartości mają różne wagi"],
      ["Wariancja", "$\\sigma^2=\\frac{1}{n}\\sum(x_i-\\bar{x})^2$", "miara rozproszenia danych"],
      ["Odchylenie standardowe", "$\\sigma=\\sqrt{\\sigma^2}$", "gdy wynik ma mieć jednostkę danych"],
      ["Wartość oczekiwana", "$E(X)=\\sum x_iP(x_i)$", "gry losowe i loterie"],
    ],
    footer: "Skala centylowa mówi, jaki procent wyników jest niższy lub równy danemu.",
  },

  "8_klasa:liczby:notacja_wykladnicza": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Notacja wykładnicza",
    intro: "Duże i małe liczby w jednej postaci.",
    items: [
      {
        title: "Postać",
        formula: "$a \\cdot 10^n$",
        note: "$1 \\le a < 10$, $n$ całkowite",
      },
      {
        title: "Duża liczba",
        formula: "$3200 = 3{,}2 \\cdot 10^3$",
      },
      {
        title: "Mała liczba",
        formula: "$0{,}0045 = 4{,}5 \\cdot 10^{-3}$",
      },
      {
        title: "Mnożenie i dzielenie",
        formula: "$(a\\cdot10^m)(b\\cdot10^n)=ab\\cdot10^{m+n}$",
      },
    ],
    footer: "Przy dzieleniu odejmujemy wykładniki: $\\frac{a\\cdot10^m}{b\\cdot10^n}=\\frac{a}{b}\\cdot10^{m-n}$.",
  },

  "8_klasa:obliczenia_praktyczne:czas_droga_predkosc": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Czas, droga i prędkość",
    intro: "Jeden wzór i trzy przekształcenia.",
    items: [
      {
        title: "Droga",
        note: "gdy znasz prędkość i czas",
        formula: "$s = v \\cdot t$",
      },
      {
        title: "Prędkość",
        note: "gdy znasz drogę i czas",
        formula: "$v = \\frac{s}{t}$",
      },
      {
        title: "Czas",
        note: "gdy znasz drogę i prędkość",
        formula: "$t = \\frac{s}{v}$",
      },
      {
        title: "Jednostki",
        note: "km/h na m/s dzielimy przez 3,6",
        formula: "$1\\,\\text{km/h} = \\frac{1}{3{,}6}\\,\\text{m/s}$",
      },
    ],
    footer: "Nie mieszaj godzin i minut w jednym obliczeniu. Prędkość średnia to cała droga przez cały czas.",
  },

  "8_klasa:obliczenia_praktyczne:jednostki_i_pieniadze": {
    variant: "table",
    eyebrow: "TABELA",
    title: "Jednostki i pieniądze",
    intro: "Najczęstsze zamiany w zadaniach praktycznych.",
    columns: ["Wielkość", "Jednostki", "Przykład"],
    rows: [
      ["Długość", "km, m, cm, mm", "$1$ m $=100$ cm"],
      ["Masa", "t, kg, g", "$1$ kg $=1000$ g"],
      ["Czas", "h, min, s", "$1$ h $=60$ min"],
      ["Pieniądze", "zł, gr", "$1$ zł $=100$ gr"],
    ],
    footer: "Koszt to cena jednostkowa razy liczba jednostek. Reszta to zapłata minus koszt.",
  },

  "8_klasa:zadania_tekstowe:zadania_tekstowe": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Zadanie tekstowe",
    intro: "Pięć kroków, które porządkują rozwiązanie.",
    items: [
      {
        title: "Wypisz dane",
        note: "z jednostkami",
        formula: "$...$",
      },
      {
        title: "Ustal szukane",
        note: "co trzeba obliczyć",
        formula: "$x = ?$",
      },
      {
        title: "Ułóż plan",
        note: "wzór, równanie albo działania",
        formula: "$...$",
      },
      {
        title: "Wykonaj obliczenia",
        note: "krok po kroku, zapisuj wyniki pośrednie",
        formula: "$...$",
      },
      {
        title: "Sprawdź odpowiedź",
        note: "czy wynik ma sens i właściwą jednostkę",
        formula: "$...$",
      },
    ],
    footer: "Za obliczenia pośrednie też są punkty. Nie odpowiadaj samą liczbą, jeśli polecenie wymaga rozwiązania.",
  },

  "8_klasa:geometria:symetralna_i_dwusieczna": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Symetralna i dwusieczna",
    intro: "Dwie konstrukcje i ich własności.",
    items: [
      {
        title: "Symetralna odcinka",
        formula: "$|PA| = |PB|$",
        note: "prostopadła przez środek odcinka",
      },
      {
        title: "Dwusieczna kąta",
        formula: "$\\alpha_1 = \\alpha_2$",
        note: "dzieli kąt na połowy",
      },
      {
        title: "Okrąg opisany",
        formula: "przecięcie symetralnych",
      },
      {
        title: "Okrąg wpisany",
        formula: "przecięcie dwusiecznych",
      },
    ],
    footer: "Punkty symetralnej są jednakowo odległe od końców odcinka. Punkty dwusiecznej są jednakowo odległe od ramion kąta.",
  },

  "8_klasa:geometria:wielokaty": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Wielokąty",
    intro: "Kąty, przekątne i pola.",
    items: [
      {
        title: "Suma kątów",
        formula: "$(n-2)\\cdot180^\\circ$",
      },
      {
        title: "Kąt foremny",
        formula: "$\\frac{(n-2)\\cdot180^\\circ}{n}$",
      },
      {
        title: "Liczba przekątnych",
        formula: "$\\frac{n(n-3)}{2}$",
      },
      {
        title: "Pole trapezu",
        formula: "$\\frac12(a+b)h$",
      },
    ],
    footer: "Wielokąt foremny ma wszystkie boki i wszystkie kąty równe. Pole rombu to $\\frac12 d_1 d_2$.",
  },

  "8_klasa:geometria:proste_i_odcinki": {
    variant: "cheatsheet",
    eyebrow: "ŚCIĄGAWKA",
    title: "Proste, półproste i odcinki",
    intro: "Cztery pojęcia, które warto odróżniać.",
    items: [
      {
        title: "Prosta",
        formula: "brak początku i końca",
      },
      {
        title: "Półprosta",
        formula: "jeden początek, brak końca",
      },
      {
        title: "Odcinek",
        formula: "dwa końce",
      },
      {
        title: "Odległość punktu od prostej",
        formula: "najkrótszy odcinek prostopadły",
      },
    ],
    footer: "Proste prostopadłe tworzą kąt $90^\\circ$. Proste równoległe nie mają punktów wspólnych.",
  },

  "8_klasa:uklad_wspolrzednych:os_liczbowa": {
    variant: "steps",
    eyebrow: "KROKI",
    title: "Oś liczbowa",
    intro: "Zaznaczanie, porównywanie i odległość.",
    items: [
      {
        title: "Zaznacz liczbę",
        note: "ujemne na lewo od zera",
        formula: "$-3 < 0 < 5$",
      },
      {
        title: "Porównaj liczby",
        note: "większa leży bardziej po prawej",
        formula: "$-2 > -5$",
      },
      {
        title: "Oblicz odległość",
        note: "między dwiema liczbami",
        formula: "$|a-b|$",
      },
      {
        title: "Znajdź środek",
        note: "średnia końców",
        formula: "$\\frac{a+b}{2}$",
      },
    ],
    footer: "Liczba przeciwna do $a$ to $-a$. Leży po drugiej stronie zera w tej samej odległości.",
  },

  "8_klasa:liczby:system_rzymski": {
    variant: "table",
    eyebrow: "TABELA",
    title: "System rzymski",
    intro: "Siedem symboli i zasada odejmowania.",
    columns: ["Symbol", "Wartość", "Uwaga"],
    rows: [
      ["I", "1", "można powtórzyć do 3 razy"],
      ["V", "5", "nie powtarza się"],
      ["X", "10", "można powtórzyć do 3 razy"],
      ["L", "50", "nie powtarza się"],
      ["C", "100", "można powtórzyć do 3 razy"],
      ["D", "500", "nie powtarza się"],
      ["M", "1000", "można powtarzać"],
    ],
    footer: "Mniejszy symbol przed większym odejmujemy: $IV=4$, $IX=9$, $XL=40$, $XC=90$, $CD=400$, $CM=900$.",
  },
};

export { TOPIC_SUMMARIES };

export function topicSummaryKey(
  examType: ExamType,
  category: string,
  topic: string,
): string {
  return `${examType}:${category}:${topic}`;
}

export function getTopicSummary(
  examType: ExamType,
  category: string,
  topic: string,
): TopicSummary | null {
  return TOPIC_SUMMARIES[topicSummaryKey(examType, category, topic)] ?? null;
}
