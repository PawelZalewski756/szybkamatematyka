/** Rozbudowane lekcje (pełny kurs) — nadpisują wpisy w SEED_MATERIALS. */
export type ExpandedTheoryEntry = {
  title: string;
  content: string;
};

const ROWNANIA_LINIOWE_CONTENT = `## Na egzaminie

Równania liniowe to **fundament matury podstawowej** — pojawiają się w prawie każdym arkuszu: jako samodzielne zadanie otwarte (2–3 pkt), element układu równań albo krok w zadaniu tekstowym. CKE sprawdza: przekształcanie, ułamki, nawiasy, interpretację wyniku (brak / jeden / nieskończenie wiele rozwiązań).

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Postać równania** i pojęcie rozwiązania
2. **Zasady równoważności** (co wolno robić z obiema stronami)
3. **Równania z ułamkami** i nawiasami
4. **Interpretację wyniku** (sprzeczne / tożsamościowe)
5. **Zadania maturalne** krok po kroku
6. **Ćwiczenia** z odpowiedziami

## Definicje i wzory

**Równanie liniowe** z jedną niewiadomą:

$$
ax + b = 0, \\quad a \\neq 0
$$

**Rozwiązanie** to liczba $x_0$, która po podstawieniu daje prawdziwą równość.

Wzór (gdy $a \\neq 0$):

$$
x = -\\frac{b}{a}
$$

**Zasady równoważności:**
- dodaj lub odejmij tę samą liczbę po obu stronach
- pomnóż lub podziel obie strony przez tę samą liczbę $\\neq 0$
- rozwijaj nawiasy przed przenoszeniem wyrazów

**Typy równań po uproszczeniu:**
| Postać | Rozwiązań |
|--------|-----------|
| $x = \\text{liczba}$ | dokładnie jedno |
| $0 = 0$ | nieskończenie wiele |
| $0 = 5$ | brak |

## Przykład 1 — podstawowy

Rozwiąż: $5x - 3 = 2x + 9$

**Krok 1.** Przenieś wyrazy z $x$ na lewą: $5x - 2x = 9 + 3$

**Krok 2.** Redukuj: $3x = 12$

**Krok 3.** Dziel przez 3: $x = 4$

**Sprawdzenie:** L: $5 \\cdot 4 - 3 = 17$, P: $2 \\cdot 4 + 9 = 17$ ✓

## Przykład 2 — ułamki

Rozwiąż: $\\dfrac{2x - 1}{3} = \\dfrac{x + 4}{2}$

**Krok 1.** NWW(3, 2) = 6. Mnożymy obie strony przez 6:

$$2(2x - 1) = 3(x + 4)$$

**Krok 2.** $4x - 2 = 3x + 12$

**Krok 3.** $x = 14$

**Sprawdzenie:** $\\dfrac{27}{3} = 9$, $\\dfrac{18}{2} = 9$ ✓

## Przykład 3 — nawiasy

Rozwiąż: $3(x - 2) + 5 = 2(x + 1) - 1$

**Krok 1.** $3x - 6 + 5 = 2x + 2 - 1$

**Krok 2.** $3x - 1 = 2x + 1$

**Krok 3.** $x = 2$

## Przykład 4 — zadanie maturalne (tekst)

Pierwsza liczba jest o 12 większa od drugiej. Ich suma wynosi 48. Znajdź obie liczby.

**Krok 1.** Niech $x$ — mniejsza liczba. Większa: $x + 12$.

**Krok 2.** Równanie: $x + (x + 12) = 48$

**Krok 3.** $2x + 12 = 48 \\Rightarrow 2x = 36 \\Rightarrow x = 18$

**Odpowiedź:** liczby **18** i **30**.

## Pułapki

- **Znak przy przenoszeniu** — $-3x$ na drugą stronę daje $+3x$, nie $-3x$
- **Dzielenie przez wyrażenie z $x$** — możesz stracić rozwiązanie; bezpieczniej przekształcaj algebraicznie
- **Ułamki** — mnoż przez NWW **całego** równania, nie pojedynczych wyrazów
- **$0 = 0$** — to nie „$x = 0$”, tylko nieskończenie wiele rozwiązań
- **Sprawdzenie** — 10 sekund i unikasz utraty punktów za literówkę

## Ćwiczenia do samodzielnego rozwiązania

1. $7x + 5 = 26$
2. $4x - 3 = 2x + 11$
3. $\\dfrac{x}{2} + 3 = \\dfrac{x}{3} + 5$
4. $2(x + 4) = 3(x - 1)$
5. Cena $x$ zł po podwyżce o 15% wynosi 230 zł. Zapisz równanie i znajdź $x$.
6. Czy $x = 3$ spełnia $2(x - 1) = x + 2$? (L: 4, P: 5)
7. Ile rozwiązań ma $2x + 4 = 2(x + 2)$?

## Odpowiedzi

1. $x = 3$
2. $x = 7$
3. Pomnóż przez 6: $3x + 18 = 2x + 30 \\Rightarrow x = 12$
4. $2x + 8 = 3x - 3 \\Rightarrow x = 11$
5. $1{,}15x = 230 \\Rightarrow x = 200$ zł
6. **Nie** — po podstawieniu L = 4, P = 5
7. Nieskończenie wiele ($0 = 0$ po uproszczeniu)

## Szybka powtórka

1. Wymień dwie zasady równoważności.
2. Jak rozpoznać równanie sprzeczne?
3. Dlaczego warto sprawdzać wynik podstawieniem?
4. Co zrobić, gdy w równaniu są ułamki?
5. Jaka jest postać ogólna równania liniowego?`;

export const EXPANDED_THEORY: Record<string, ExpandedTheoryEntry> = {
  "matura_podstawowa:algebra:rownania_liniowe": {
    title: "Równania liniowe — pełny kurs",
    content: ROWNANIA_LINIOWE_CONTENT,
  },
};
