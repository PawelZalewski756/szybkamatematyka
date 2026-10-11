# Szybka Matematyka — [szybkamatematyka.pl](https://szybkamatematyka.pl)

**Pełna aplikacja webowa do nauki matematyki przed maturą i egzaminem
ósmoklasisty.** Łączy teorię, zadania, arkusze CKE i krótkie gry w jednym
miejscu.

## Co robi aplikacja?

Uczeń wybiera swój egzamin i temat, a następnie:

1. poznaje teorię,
2. rozwiązuje zadania krok po kroku,
3. zapisuje postęp,
4. sprawdza wiedzę na arkuszach CKE,
5. utrwala materiał przez minigry i powtórki.

## Najważniejsze funkcje

- osobne ścieżki dla matury podstawowej i egzaminu ósmoklasisty,
- tematyczny trening z rozwiązaniami i śledzeniem postępu,
- baza zadań oraz archiwum arkuszy CKE,
- konta użytkowników, profile, osiągnięcia, rankingi i serie nauki,
- minigry matematyczne, codzienne wyzwania i pojedynki,
- system inteligentnych powtórek,
- asysta AI oparta na Gemini,
- płatności i plan PRO obsługiwane przez Stripe,
- responsywny interfejs działający na komputerze i telefonie,
- panel administratora do zarządzania treścią.

## Projekt od strony technicznej

To nie jest statyczna strona. Aplikacja obejmuje frontend, backend, bazę danych,
logowanie, płatności, integrację AI, testy i wdrożenie produkcyjne.

| Obszar | Rozwiązanie |
| --- | --- |
| Interfejs | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js Route Handlers |
| Dane i logowanie | Supabase, PostgreSQL, Row Level Security |
| AI | Google Gemini |
| Płatności | Stripe + webhooki |
| Testy | Vitest, Playwright |
| Wdrożenie | Vercel, GitHub Actions |

Najważniejsze decyzje techniczne:

- dane użytkownika są chronione politykami dostępu w bazie (RLS),
- postęp może działać lokalnie, a po zalogowaniu synchronizuje się z chmurą,
- treści matematyczne mają własne skrypty do generowania, importu i kontroli
  jakości,
- CI automatycznie sprawdza lint, typy, testy i build aplikacji.

## Uruchomienie lokalne

Wymagany jest Node.js 20.9 lub nowszy.

```bash
git clone https://github.com/PawelZalewski756/szybkamatematyka.git
cd szybkamatematyka
npm ci
cp .env.example .env.local
npm run dev
```

Po uzupełnieniu danych Supabase w `.env.local` otwórz
[http://localhost:3000](http://localhost:3000).

Gemini i Stripe są opcjonalne — bez ich kluczy można uruchomić podstawową część
aplikacji. Przykładowe zmienne znajdują się w [`.env.example`](.env.example).

## Jakość kodu

```bash
npm run lint        # ESLint
npm test            # testy jednostkowe
npm run test:e2e    # testy przeglądarkowe
npm run build       # build produkcyjny
```

Repozytorium zawiera również testy logiki nauki, naliczania punktów, serii,
subskrypcji, integracji z Supabase i formatowania treści matematycznych.

## Struktura projektu

- `app/` — widoki i endpointy API,
- `components/` — komponenty interfejsu,
- `lib/` — logika biznesowa i integracje,
- `data/` — zadania, teoria i dane arkuszy,
- `supabase/` — schemat bazy, migracje i polityki bezpieczeństwa,
- `tests/` — testy automatyczne,
- `scripts/` — import, generowanie i kontrola jakości treści.

Szczegóły konfiguracji produkcyjnej znajdują się w
[`docs/DEPLOY.md`](docs/DEPLOY.md).

---

Szybka Matematyka jest niezależnym projektem edukacyjnym i nie jest oficjalnym
serwisem Centralnej Komisji Egzaminacyjnej.
