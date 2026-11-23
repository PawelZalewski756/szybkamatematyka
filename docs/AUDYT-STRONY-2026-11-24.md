# Audyt strony — 24.11.2026

**Zakres:** cała strona publiczna, nie tylko homepage.
**Metoda:** crawl 21 tras statycznych z sitemapy (1 267 URL-i), 16 stron kluczowych
w Playwright (błędy konsoli, puste stany), 12 losowych tematów i 12 zadań,
kontrola przepełnienia na 390 px, metadata SEO, porównanie z backlogiem
z [`AI-HANDOFF.md`](../AI-HANDOFF.md) i [`PLAN-ROZWOJU.md`](PLAN-ROZWOJU.md).

---

## 1. Co działa (żeby nie naprawiać na siłę)

- Wszystkie 21 tras statycznych: **HTTP 200**, `index, follow`, poprawne H1.
- **Mobile:** brak poziomego przewijania na 10 sprawdzonych stronach.
- **Treść:** 12/12 losowych tematów ma teorię (brak „Teoria w przygotowaniu”),
  12/12 losowych zadań ma rozwiązanie (brak „Wkrótce”).
- **Rejestracja:** pełny przepływ działa (konto, mail potwierdzający, ekran sukcesu).
- **Telegram:** powiadomienia o nowych kontach działają po fixie z 24.11.
- **Jakość:** 688 testów jednostkowych, 96 scenariuszy E2E, CI z bramkami.

---

## 2. Blokery biznesowe (P0)

| Problem | Dowód | Co zrobić |
|---|---|---|
| **Brak danych operatora w regulaminie** | Na `/regulamin` nie ma sekcji „Dane operatora”, NIP-u ani adresu (env `NEXT_PUBLIC_OPERATOR_*` puste) | Podaj nazwę, adres i NIP — dodam sekcję. Bez tego rodzic nie zapłaci, a to wymóg formalny |
| **Płatności Stripe mogą nie aktywować subskrypcji** | `docs/PRODUCTION-CHECK-2026-11-18.md`: endpoint webhooka na apex `szybkamatematyka.pl` dostaje 308 na `www` i Stripe zgłasza błędy | Sprawdź w Stripe → Webhooks, czy URL to `https://www.szybkamatematyka.pl/api/stripe/webhook`; jeśli nie — popraw |
| **Welcome mail nie dochodzi** | W teście rejestracji przyszedł tylko mail Supabase; mail z Resenda nie | Zweryfikuj domenę w Resend (SPF/DKIM) i nadawcę `WELCOME_EMAIL_FROM` |
| **Potwierdzanie e-maila blokuje wejście** | Rejestracja wymaga kliknięcia w mail, zanim uczeń się zaloguje; część maili trafia do spamu | Decyzja: zostawić (bezpieczniej) czy wyłączyć „Confirm email” w Supabase (większa konwersja) |
| **Strona główna wciąż stara** | Na produkcji „PEŁNA MAPA SERWISU”; uproszczona wersja leży na branchu `feat/prosta-strona-glowna` | Wdrożyć (PR → merge), potem mierzyć 3–5 dni |

---

## 3. Niedokończone funkcje (P1)

| Funkcja | Stan | Uwagi |
|---|---|---|
| **Matura rozszerzona** | tylko arkusze + mapa zakresu; strona mówi „w przygotowaniu” | Brak planu tematycznego i zadań rozszerzonych — duży segment uczniów |
| **Panel nauczyciela / B2B** | „klasy, uczniowie i wyniki w przygotowaniu” | Brak klas, przypisań, wyników i faktur; na razie nie obiecywać tego na home |
| **Plan tygodnia** | ukryty MVP (trasa działa, `noindex`) | Dokończyć (realne zadania + przypomnienia) albo usunąć na stałe |
| **E-maile przypominające** | przypomnienia tylko w przeglądarce | Bez maili retencja jest słaba |
| **Raport dla rodzica** | wydruk profilu bez podziału na działy i historii | Rozbudować wydruk |
| **Brak trybu egzaminu na czas, zeszytu błędów, wyszukiwarki, fiszek, wideo** | z backlogu | Wybierać pojedynczo, nie wszystko naraz |

---

## 4. Konwersja i UX (P1)

- **Rejestracja jest opcjonalna w całym produkcie** — można trenować bez konta.
  To główna przyczyna niskiej liczby kont, niezależna od wyglądu strony.
- **Formularz:** nick, e-mail, hasło, powtórzenie hasła, 2 checkboxy (7 pól).
- **Brak dowodu społecznego** (opinie, wyniki, „X uczniów dziś”).
- **Ranking na home** usunięty (był z danymi przykładowymi); prawdziwy `/rankingi` działa.
- **Propozycje:** ściana „zapisz postęp” po pierwszym temacie, krótszy formularz,
  pierwsze opinie, ewentualnie logowanie Google.

---

## 5. Jakość techniczna (P2)

| Problem | Dowód | Wpływ |
|---|---|---|
| **Hydration error #418** | `/cennik`, `/dla-szkol`, `/rankingi`, `/login/sukces` | React odtwarza drzewo po stronie klienta; możliwe migotanie, gorszy TTI |
| **Zduplikowana marka w `<title>`** | `/powtorki`, `/zglos-blad`: „… - Szybka Matematyka · Szybka Matematyka” | SEO/social |
| **`og:url` zawsze wskazuje stronę główną** | na `/trening`, `/cennik`, `/baza-zadan/st-001` | Udostępnienia i SEO wskazują zły adres |
| **Niespójne tytuły** | część stron bez marki (np. `/baza-zadan/st-001`), część z marką | SEO |
| **Brak pełnego audytu a11y na produkcji** | w repo są testy axe, ale nie były uruchamiane na live po zmianach | Dostępność |
| **Powtórki ciągną katalog do klienta** | backlog `AI-HANDOFF` P2 | Rozmiar bundla |

---

## 6. Kolejność pracy

1. **Wdrożyć uproszczoną stronę główną** i zmierzyć 3–5 dni (`/users`, `/stats`).
2. **Dane operatora** (od Ciebie: nazwa, adres, NIP).
3. **Stripe webhook** — sprawdzić i poprawić URL na `www`.
4. **Resend** — zweryfikować domenę, żeby welcome mail dochodził.
5. **Decyzja o potwierdzaniu e-maila** (wyłączyć / zostawić).
6. **Matura rozszerzona** — następny duży kawałek produktu.
7. **Hydration #418 + SEO** (tytuły, `og:url`) — szybkie poprawki jakościowe.
8. **B2B** — dopiero gdy będą płacący klienci B2C.

---

## 7. Czego nie ruszać teraz

- Nowych funkcji (egzamin na czas, fiszki, wideo) — najpierw rejestracje i płatności.
- Przebudowy cennika.
- Kolejnych sekcji marketingowych na home.
- Refactoru powtórek — to techniczne, nie blokuje sprzedaży.
