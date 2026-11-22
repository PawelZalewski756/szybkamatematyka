import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Crown,
  FileText,
  Flame,
  Lock,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

import { CONTACT_EMAIL } from "@/lib/brand/constants";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription/plans";

const RANKING_ENTRIES = [
  { rank: 1, nick: "Kasia", level: 24, xp: "18 420", initials: "K" },
  { rank: 2, nick: "Michał", level: 22, xp: "16 980", initials: "M" },
  { rank: 3, nick: "Ola", level: 21, xp: "15 740", initials: "O" },
  { rank: 4, nick: "Bartek", level: 19, xp: "13 560", initials: "B" },
  { rank: 5, nick: "Zosia", level: 18, xp: "12 200", initials: "Z" },
] as const;

const FAQ_ITEMS = [
  {
    question: "Czy Szybka Matematyka jest darmowa?",
    answer:
      "Tak. Start jest darmowy na zawsze: minigry, podgląd bazy i arkuszy, wyzwania i powtórki. Pro odblokowuje pełne rozwiązania, AI i sprawdziany z oceną.",
  },
  {
    question: "Czy muszę mieć konto?",
    answer:
      "Nie, żeby zacząć. Konto jest darmowe i zapisuje postęp, serię i osiągnięcia, więc możesz uczyć się na kilku urządzeniach. Założysz je w 30 sekund - bez karty.",
  },
  {
    question: "Skąd są arkusze?",
    answer:
      "Z oficjalnych arkuszy CKE. Nie jesteśmy oficjalnym serwisem CKE i nie publikujemy przecieków.",
  },
  {
    question: "Czy to zastąpi korepetytora?",
    answer:
      "Nie. To narzędzie do regularnej pracy. Rozwiązania i AI pomagają, gdy utkniesz, ale nie odrabiają zadań za Ciebie.",
  },
  {
    question: "Czy mogę uczyć się na telefonie?",
    answer:
      "Tak. Strona działa w przeglądarce na telefonie i komputerze.",
  },
  {
    question: "Czy matura rozszerzona jest gotowa?",
    answer:
      "Mamy 12 oficjalnych arkuszy i mapę zakresu. Pełna ścieżka z teorią i zadaniami jest w przygotowaniu - nie udajemy, że jest skończona.",
  },
] as const;

function Overline({ children }: { children: React.ReactNode }) {
  return <p className="text-overline">{children}</p>;
}

function PodiumCard({
  entry,
  place,
}: {
  entry: (typeof RANKING_ENTRIES)[number];
  place: 1 | 2 | 3;
}) {
  const first = place === 1;
  return (
    <div className={`flex flex-col items-center ${first ? "-mt-3" : ""}`}>
      {first ? (
        <Crown className="mb-1 h-4 w-4 text-accent" aria-hidden />
      ) : (
        <Medal className="mb-1 h-3.5 w-3.5 text-muted" aria-hidden />
      )}
      <div
        className={`flex items-center justify-center rounded-full border-2 ${
          first
            ? "h-16 w-16 border-accent bg-accent text-on-accent"
            : "h-12 w-12 border-surface-border bg-surface text-foreground"
        }`}
      >
        <span className={first ? "text-xl font-black" : "text-base font-black"}>
          {entry.initials}
        </span>
      </div>
      <p className="mt-2 max-w-full truncate text-xs font-bold text-foreground">
        {entry.nick}
      </p>
      <p className="text-[10px] text-muted">poz. {entry.level}</p>
      <p className="text-[10px] font-bold text-accent">{entry.xp} XP</p>
    </div>
  );
}

export function RankingSection() {
  return (
    <section
      id="ranking"
      className="border-b border-surface-border py-14 sm:py-20"
      aria-labelledby="ranking-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:gap-16">
          <div>
            <Overline>RANKING</Overline>
            <h2
              id="ranking-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              Rywalizacja, która motywuje
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              Top 20 w trzech kategoriach: łączne XP, minigry i pojedynki.
              Zobacz, gdzie jesteś, i sprawdź, ile brakuje Ci do podium.
            </p>

            <div
              className="mt-5 flex flex-wrap gap-1 rounded-full border border-surface-border bg-surface p-1"
              role="group"
              aria-label="Kategoria rankingu"
            >
              {["Wszyscy", "Minigry", "Pojedynki", "Ten tydzień"].map(
                (tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={index === 0}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold transition ${
                      index === 0
                        ? "bg-accent text-on-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {tab === "Ten tydzień" ? (
                      <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent-strong">
                        Nowe
                      </span>
                    ) : null}
                  </button>
                ),
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/rankingi"
                className="btn-chunky px-5 py-3 text-sm"
              >
                Zobacz pełny ranking
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Flame className="h-4 w-4 text-accent" aria-hidden />
                Nowy sezon w każdy poniedziałek
              </span>
            </div>
          </div>

          <div className="card-raised p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" aria-hidden />
                <span className="text-sm font-extrabold text-foreground">
                  Top 3 · ten tydzień
                </span>
              </div>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                Podgląd
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 items-end gap-2">
              <PodiumCard entry={RANKING_ENTRIES[1]} place={2} />
              <PodiumCard entry={RANKING_ENTRIES[0]} place={1} />
              <PodiumCard entry={RANKING_ENTRIES[2]} place={3} />
            </div>

            <ul className="mt-5 divide-y divide-surface-border border-t border-surface-border">
              {RANKING_ENTRIES.slice(3).map((entry) => (
                <li
                  key={entry.rank}
                  className="flex items-center gap-2 py-2.5 text-sm sm:gap-3"
                >
                  <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-muted">
                    {entry.rank}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-black text-foreground">
                    {entry.initials}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                    {entry.nick}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted sm:block">
                    poz. {entry.level}
                  </span>
                  <span className="w-16 shrink-0 text-right text-xs font-bold tabular-nums text-foreground sm:w-20">
                    {entry.xp}
                    <span className="hidden sm:inline"> XP</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-surface-border bg-background/60 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Twoja pozycja
              </span>
              <Link
                href="/login"
                className="text-xs font-bold text-accent hover:underline"
              >
                Zaloguj się
              </Link>
            </div>

            <p className="mt-3 text-[10px] text-muted">
              Podgląd wyglądu - dane przykładowe. Po podłączeniu bazy ranking
              pokaże realne wyniki.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AiSection() {
  return (
    <section
      id="ai"
      className="border-b border-surface-border bg-accent-soft/35 py-14 sm:py-20"
      aria-labelledby="ai-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:gap-16">
          <div>
            <Overline>ASYSTENT AI</Overline>
            <h2
              id="ai-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              Podpowiedź, nie gotowiec
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              Gdy utkniesz, AI wskazuje następny krok. Gdy piszesz zadanie
              otwarte, sprawdza tok rozumowania - nie tylko wynik.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>
                  <strong className="font-bold">Podpowiedź krok po kroku</strong>{" "}
                  - bez podawania wyniku.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>
                  <strong className="font-bold">Ocena zadania otwartego</strong>{" "}
                  - punkty i uwagi, co poprawić (Pro).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>
                  <strong className="font-bold">Pytania do treści</strong> - „dlaczego
                  tutaj jest delta?”.
                </span>
              </li>
            </ul>

            <Link
              href="/trening"
              className="btn-chunky mt-7 px-5 py-3 text-sm"
            >
              Wypróbuj w treningu
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="card-raised p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="icon-chip h-9 w-9">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-extrabold text-foreground">
                  Asystent AI
                </span>
              </div>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                Pro
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent">
                Nie wiem, od czego zacząć to zadanie.
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-surface-border bg-background/80 px-4 py-3 text-sm text-muted">
                <p className="font-semibold text-foreground">
                  Zacznij od delty.
                </p>
                <p className="mt-1 leading-relaxed">
                  Zapisz, ile wynoszą a, b i c, a potem podstaw je do wzoru. Nie
                  licz jeszcze miejsc zerowych.
                </p>
                <Link
                  href="/trening"
                  className="mt-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent hover:bg-accent/20"
                >
                  Pokaż kolejną podpowiedź
                </Link>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              AI może się mylić. Klucz i rozwiązanie krok po kroku zostają
              źródłem prawdy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestsSection() {
  return (
    <section
      id="sprawdziany"
      className="border-b border-surface-border py-14 sm:py-20"
      aria-labelledby="sprawdziany-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="max-w-2xl">
          <Overline>SPRAWDZIANY</Overline>
          <h2
            id="sprawdziany-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Klasówka w minutę - dla nauczyciela i dla siebie
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Wybierasz klasę i dział, generujesz grupy A i B, drukujesz z kluczem
            i punktacją. Albo rozdajesz link i zbierasz wyniki online.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="card-raised flex flex-col p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="icon-chip h-10 w-10">
                <ClipboardCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                  Dla nauczyciela
                </p>
                <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                  Grupy A/B, klucz i PDF
                </h3>
              </div>
            </div>

            <ol className="mt-5 space-y-2.5 text-sm text-muted">
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-black text-accent">
                  1
                </span>
                Wybierz klasę i dział.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-black text-accent">
                  2
                </span>
                Ustaw grupę A/B i przelosuj liczby.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-black text-accent">
                  3
                </span>
                Drukuj z kluczem albo rozdaj link.
              </li>
            </ol>

            <div className="mt-5 rounded-xl border border-surface-border bg-background/60 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">
                  Sprawdzian · klasa 8
                </span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent-strong">
                  Grupa A
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                8 zadań · 20 pkt · 45 min
              </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <Link
                href="/sprawdziany"
                className="btn-chunky px-4 py-2.5 text-sm"
              >
                Wypróbuj generator
              </Link>
              <Link
                href="/dla-szkol"
                className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
              >
                Dla szkół
              </Link>
            </div>
          </div>

          <div className="card-raised flex flex-col p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="icon-chip h-10 w-10">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                  Dla ucznia
                </p>
                <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                  Sprawdź się online
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">
              Rozwiąż sprawdzian online, zobacz punktację od razu i ocenę zadań
              otwartych. Do każdego zadania jest miejsce na obliczenia.
            </p>

            <div className="mt-5 rounded-xl border border-accent/25 bg-accent-soft/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Twój wynik
                </span>
                <span className="text-xs font-bold text-accent">80%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full w-4/5 rounded-full bg-accent" />
              </div>
              <p className="mt-2 text-xs text-muted">16/20 pkt · 4 zadania otwarte</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-2.5 py-1">
                <Check className="h-3.5 w-3.5 text-accent" aria-hidden />
                Ocena per zadanie
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
                AI ocenia otwarte (Pro)
              </span>
            </div>

            <div className="mt-auto pt-5">
              <Link
                href="/sprawdziany"
                className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
              >
                Zobacz sprawdziany
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeacherBand() {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Pakiet szkolny - Szybka Matematyka",
  )}`;

  return (
    <section className="border-b border-surface-border py-10">
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex flex-col gap-5 rounded-2xl border border-accent/30 bg-accent-soft/35 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-overline">PAKIET SZKOLNY</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              Cała szkoła? Faktura, wsparcie, wiele klas.
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Generator, baza zadań i arkusze CKE dla nauczycieli. Napisz,
              ustalimy zakres i warunki.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dla-szkol" className="btn-chunky px-4 py-2.5 text-sm">
              Dla szkół
            </Link>
            <a
              href={mailto}
              className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
            >
              Napisz do nas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-b border-surface-border py-14 sm:py-20"
      aria-labelledby="faq-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="max-w-2xl">
          <Overline>FAQ</Overline>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Pytania, które warto zadać przed startem
          </h2>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-surface-border bg-surface p-4 transition open:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="text-lg leading-none text-accent transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingTeaser() {
  return (
    <section
      id="cennik"
      className="border-b border-surface-border bg-surface/35 py-14 sm:py-20"
      aria-labelledby="cennik-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="max-w-2xl">
          <Overline>CENNIK</Overline>
          <h2
            id="cennik-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Zacznij za darmo. Pro, kiedy chcesz więcej.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Start zostaje darmowy na zawsze. Pro odblokowuje pełne rozwiązania,
            AI i wszystkie arkusze.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const highlighted = Boolean(plan.highlighted);
            const ctaHref =
              plan.id === "start" ? "/login?mode=signup" : "/cennik";
            const ctaLabel =
              plan.id === "start"
                ? "Załóż darmowe konto"
                : plan.id === "pro"
                  ? "Wybierz Pro"
                  : "Wybierz roczny";

            return (
              <div
                key={plan.id}
                className={`card-raised flex flex-col p-5 sm:p-6 ${
                  highlighted
                    ? "border-accent/45 bg-accent-soft/35"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-foreground">
                      {plan.name}
                    </p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </p>
                    <p className="text-xs text-muted">{plan.period}</p>
                  </div>
                  {plan.badge ? (
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {plan.description}
                </p>

                <ul className="mt-5 space-y-2 text-sm text-foreground">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={ctaHref}
                  className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    highlighted
                      ? "btn-chunky"
                      : "border border-surface-border bg-surface text-foreground hover:border-accent/50 hover:text-accent"
                  }`}
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" aria-hidden />
            Płatności obsługuje Stripe. Anulujesz kiedy chcesz.
          </p>
          <Link
            href="/polecenia"
            className="font-bold text-accent hover:underline"
          >
            Zaproś 2 znajomych - 30 dni Pro →
          </Link>
        </div>
      </div>
    </section>
  );
}
