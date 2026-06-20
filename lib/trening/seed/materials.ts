import type { ExamType } from "@/types/database";

export type MaterialDraft = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

export const SEED_MATERIALS: MaterialDraft[] = [
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "potegi",
    title: "Potęgi o wykładniku naturalnym",
    content: `## Definicja

Dla $a \\neq 0$ i $n \\in \\mathbb{N}$:

$$
a^n = \\underbrace{a \\cdot a \\cdots a}_{n\\text{ razy}}
$$

## Działania

- $a^m \\cdot a^n = a^{m+n}$
- $\\dfrac{a^m}{a^n} = a^{m-n}$ (gdy $a \\neq 0$)
- $(a^m)^n = a^{mn}$

## Pierwiastek

$\\sqrt[n]{a} = a^{1/n}$ dla $a \\geq 0$.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "logarytmy",
    title: "Logarytmy — podstawy",
    content: `## Definicja

$\\log_a b = c$ wtedy i tylko wtedy, gdy $a^c = b$, przy $a>0$, $a \\neq 1$, $b>0$.

## Własności

- $\\log_a (xy) = \\log_a x + \\log_a y$
- $\\log_a \\dfrac{x}{y} = \\log_a x - \\log_a y$
- $\\log_a x^r = r \\log_a x$

## Zmiana podstawy

$$
\\log_a b = \\frac{\\log_c b}{\\log_c a}
$$`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "procenty",
    title: "Procenty i proporcje",
    content: `## Procent

$p\\%$ liczby $N$ to $\\dfrac{p}{100} \\cdot N$.

## Wzrost i spadek

- Wzrost o $p\\%$: $N \\cdot (1 + \\dfrac{p}{100})$
- Spadek o $p\\%$: $N \\cdot (1 - \\dfrac{p}{100})$

## Proporcja

Jeśli $\\dfrac{a}{b} = \\dfrac{c}{d}$, to $ad = bc$.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "wyrazenia_algebraiczne",
    title: "Wyrażenia algebraiczne",
    content: `## Skrócone mnożenie

- $(a+b)^2 = a^2 + 2ab + b^2$
- $(a-b)^2 = a^2 - 2ab + b^2$
- $a^2 - b^2 = (a-b)(a+b)$

## Redukcja wyrazów podobnych

Łączymy wyrazy o tej samej części literowej, np. $3x + 5x = 8x$.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "rownania_liniowe",
    title: "Równania liniowe",
    content: `## Postać

$ax + b = 0$, $a \\neq 0$.

## Rozwiązanie

$$
x = -\\frac{b}{a}
$$

## Równania z ułamkami

Sprowadź do wspólnego mianownika lub pomnóż obie strony przez NWD mianowników.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "uklady_rownan",
    title: "Układy równań liniowych",
    content: `## Metoda podstawiania

Wyraż jedną niewiadomą i podstaw do drugiego równania.

## Metoda przeciwnych współczynników

Dodaj lub odejmij równania tak, by wyeliminować jedną niewiadomą.

## Interpretacja

Każde rozwiązanie $(x,y)$ to punkt przecięcia prostych na płaszczyźnie.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_liniowa",
    title: "Funkcja liniowa",
    content: `## Wzór

$f(x) = ax + b$, gdzie $a$ to nachylenie, $b$ to wyraz wolny.

## Wykres

Prosta na płaszczyźnie; im większe $|a|$, tym stromiej.

## Monotoniczność

- $a > 0$ — funkcja rosnąca
- $a < 0$ — funkcja malejąca`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_kwadratowa",
    title: "Funkcja kwadratowa",
    content: `## Postać ogólna

$f(x) = ax^2 + bx + c$, $a \\neq 0$.

## Wzór na pierwiastki

$$
x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}, \\quad \\Delta = b^2 - 4ac
$$

## Wierzchołek paraboli

$$
W = \\left(-\\frac{b}{2a},\\; f\\left(-\\frac{b}{2a}\\right)\\right)
$$`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "planimetria",
    title: "Planimetria — wzory",
    content: `## Trójkąt

- Pole: $P = \\dfrac{ah}{2}$
- Twierdzenie Pitagorasa: $c^2 = a^2 + b^2$ (trójkąt prostokątny)

## Koło

- Pole: $P = \\pi r^2$
- Obwód: $L = 2\\pi r$`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "stereometria",
    title: "Stereometria — bryły",
    content: `## Prostopadłościan

$V = abc$, $S = 2(ab + bc + ac)$

## Sześcian

$V = a^3$, $S = 6a^2$

## Walec

$V = \\pi r^2 h$, $S_{\\text{całk}} = 2\\pi r^2 + 2\\pi r h$`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "geometria_analityczna",
    title: "Geometria analityczna",
    content: `## Odległość punktów

$$
|AB| = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}
$$

## Środek odcinka

$$
S = \\left(\\frac{x_A+x_B}{2},\\; \\frac{y_A+y_B}{2}\\right)
$$`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "prawdopodobienstwo",
    title: "Prawdopodobieństwo klasyczne",
    content: `## Wzór

$$
P(A) = \\frac{\\text{liczba zdarzeń sprzyjających}}{\\text{liczba wszystkich zdarzeń}}
$$

przy założeniu, że wszystkie wyniki są jednakowo prawdopodobne.

## Zdarzenia

- $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ (gdy nie są rozłączne — ostrożnie).`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "statystyka",
    title: "Statystyka opisowa",
    content: `## Średnia

$\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}$

## Mediana

Wartość środkowa po uporządkowaniu danych.

## Dominanta

Najczęściej występująca wartość.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "ulamki",
    title: "Działania na ułamkach",
    content: `## Dodawanie

Wspólny mianownik: $\\dfrac{a}{b} + \\dfrac{c}{d} = \\dfrac{ad + bc}{bd}$.

## Mnożenie

$\\dfrac{a}{b} \\cdot \\dfrac{c}{d} = \\dfrac{ac}{bd}$.

## Dzielenie

$\\dfrac{a}{b} : \\dfrac{c}{d} = \\dfrac{a}{b} \\cdot \\dfrac{d}{c}$.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "procenty",
    title: "Procenty w zadaniach",
    content: `## Obliczanie procentu

$p\\%$ z $N$: $\\dfrac{p}{100} \\cdot N$.

## Jaki procent?

$\\dfrac{\\text{część}}{\\text{całość}} \\cdot 100\\%$.

## Zadania tekstowe

Rysuj schemat: całość = 100%.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "rownania",
    title: "Równania w 8 klasie",
    content: `## Równania liniowe

Przenoś wyrazy z $x$ na jedną stronę, liczby na drugą.

## Sprawdzenie

Podstaw wynik do równania — obie strony muszą być równe.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "pola_figur",
    title: "Pola figur płaskich",
    content: `## Prostokąt

$P = ab$

## Trójkąt

$P = \\dfrac{ah}{2}$

## Trapez

$P = \\dfrac{(a+b)h}{2}$`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "katy",
    title: "Kąty w figurach",
    content: `## Trójkąt

Suma kątów wewnętrznych = $180°$.

## Trójkąt prostokątny

Kąt prosty $90°$; dwa pozostałe są ostre i sumują się do $90°$.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "srednia",
    title: "Średnia arytmetyczna",
    content: `## Wzór

$\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}$

## Interpretacja

„Typowy” wynik zbioru — przydatny przy ocenach i pomiarach.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "kombinatoryka",
    topic: "prawdopodobienstwo",
    title: "Prawdopodobieństwo — start",
    content: `## Pojęcie

Liczba od 0 do 1 (lub ułamek, np. $\\dfrac{1}{4}$).

## Przykład

Rzut monetą: $P(\\text{orzeł}) = \\dfrac{1}{2}$ przy symetrycznej monecie.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "funkcje",
    topic: "wykresy",
    title: "Odczyt wykresu",
    content: `## Oś pozioma i pionowa

Zwykle $x$ — argument, $y$ — wartość funkcji.

## Punkt na wykresie

Współrzędne $(x, f(x))$ spełniają równanie wykresu.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "potegi",
    title: "Potęgi (klasa 8)",
    content: `## Definicja

$a^n$ — $n$-krotne mnożenie liczby $a$.

## Działania

- $a^m \\cdot a^n = a^{m+n}$
- $(a^m)^n = a^{mn}$`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "wyrazenia_algebraiczne",
    title: "Wyrażenia z jedną zmienną",
    content: `## Podstawianie

W miejsce $x$ wstaw podaną liczbę i oblicz.

## Porządek działań

Nawiasy → potęgi → mnożenie/dzielenie → dodawanie/odejmowanie.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "obwody",
    title: "Obwód figury",
    content: `## Definicja

Suma długości wszystkich boków.

## Kwadrat

$O = 4a$; prostokąt: $O = 2a + 2b$.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "diagramy",
    title: "Diagramy słupkowe i kołowe",
    content: `## Diagram słupkowy

Wysokość słupka odpowiada wartości.

## Diagram kołowy

Kąt (lub procent) wycinka = udział kategorii w całości.`,
    video_url: null,
  },
];

export function materialKey(m: MaterialDraft): string {
  return `${m.exam_type}:${m.category}:${m.topic}`;
}
