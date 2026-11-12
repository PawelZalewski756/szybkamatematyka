"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { QuickTrial } from "@/components/home/QuickTrial";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLatestSolvedTopic } from "@/lib/supabase/solved-tasks";
import type { RecentTrainingTopic } from "@/lib/trening/recent-topic";
import { buildTopicHref } from "@/lib/trening/slugs";
import { topicDisplayName } from "@/lib/trening/slugs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Library,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

const ENTRY_PATHS = [
  {
    href: "/trening",
    eyebrow: "NAJLEPSZY START",
    label: "Trening tematów",
    text: "Krótka teoria, potem zadania. Budujesz pewność bez skakania po przypadkowych materiałach.",
    action: "Zacznij od podstaw",
    icon: BookOpen,
    featured: true,
  },
  {
    href: "/baza-zadan",
    eyebrow: "KONKRETNE ZADANIE",
    label: "Baza zadań",
    text: "Wybierz dział, poziom i zadanie. Gdy utkniesz, dostajesz rozwiązanie krok po kroku.",
    action: "Przeglądaj bazę",
    icon: Library,
    featured: false,
  },
  {
    href: "/trening/arkusze",
    eyebrow: "PRÓBA GENERALNA",
    label: "Arkusze CKE",
    text: "Sprawdź się na oficjalnych arkuszach maturalnych i egzaminie ósmoklasisty.",
    action: "Otwórz arkusze",
    icon: FileText,
    featured: false,
  },
] as const;

function Frac({ n, d }: { n: ReactNode; d: ReactNode }) {
  return (
    <span className="mx-1 inline-flex flex-col items-center align-middle text-[0.85em] leading-tight">
      <span className="border-b-2 border-current px-1">{n}</span>
      <span className="px-1">{d}</span>
    </span>
  );
}

type Formula = { name: string; formula: ReactNode; example: string };

const FORMULAS: Record<"osmoklasista" | "matura", readonly Formula[]> = {
  osmoklasista: [
    {
      name: "POLE TRÓJKĄTA",
      formula: (
        <>
          P = <Frac n="a · h" d="2" />
        </>
      ),
      example: "a = 6, h = 4: P = 12",
    },
    {
      name: "POLE KOŁA",
      formula: <>P = π · r²</>,
      example: "r = 3: P = 9π",
    },
    {
      name: "TWIERDZENIE PITAGORASA",
      formula: <>a² + b² = c²</>,
      example: "3² + 4² = 5²",
    },
    {
      name: "PROCENT Z LICZBY",
      formula: (
        <>
          x · <Frac n="p" d="100" />
        </>
      ),
      example: "25% z 80 = 80 · 25/100 = 20",
    },
    {
      name: "PRĘDKOŚĆ",
      formula: (
        <>
          v = <Frac n="s" d="t" />
        </>
      ),
      example: "120 km w 2 h: v = 60 km/h",
    },
    {
      name: "ŚREDNIA ARYTMETYCZNA",
      formula: (
        <>
          <Frac n="suma liczb" d="ile ich jest" />
        </>
      ),
      example: "(2 + 4 + 9) : 3 = 5",
    },
  ],
  matura: [
    {
      name: "KWADRAT SUMY",
      formula: <>(a + b)² = a² + 2ab + b²</>,
      example: "(x + 3)² = x² + 6x + 9",
    },
    {
      name: "RÓŻNICA KWADRATÓW",
      formula: <>a² - b² = (a - b)(a + b)</>,
      example: "x² - 16 = (x - 4)(x + 4)",
    },
    {
      name: "DELTA",
      formula: <>Δ = b² - 4ac</>,
      example: "x² - 5x + 6: Δ = 1",
    },
    {
      name: "MIEJSCA ZEROWE",
      formula: (
        <>
          x = <Frac n="-b ± √Δ" d="2a" />
        </>
      ),
      example: "x² - 5x + 6: x = 2 lub x = 3",
    },
    {
      name: "CIĄG ARYTMETYCZNY",
      formula: (
        <>
          a<sub>n</sub> = a<sub>1</sub> + (n - 1) · r
        </>
      ),
      example: "a1 = 2, r = 3: a10 = 29",
    },
    {
      name: "PRAWDOPODOBIEŃSTWO",
      formula: (
        <>
          P(A) = <Frac n="|A|" d="|Ω|" />
        </>
      ),
      example: "parzysta na kostce: 3/6 = 1/2",
    },
  ],
};

function FormulaSheet() {
  const [track, setTrack] = useState<"osmoklasista" | "matura">(
    "osmoklasista",
  );

  return (
    <>
      <div
        role="tablist"
        aria-label="Poziom"
        className="mt-6 inline-flex gap-1 rounded-full bg-surface p-1 text-sm font-bold"
      >
        {(
          [
            ["osmoklasista", "Ósmoklasista"],
            ["matura", "Matura"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={track === key}
            onClick={() => setTrack(key)}
            className={`rounded-full px-4 py-2 transition ${
              track === key
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {FORMULAS[track].map((item) => (
          <li key={item.name} className="card-raised p-4 sm:p-5">
            <p className="text-overline">{item.name}</p>
            <p className="mt-3 min-h-10 text-xl font-extrabold tracking-tight text-foreground">
              {item.formula}
            </p>
            <p className="mt-2 text-sm text-muted">{item.example}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

const PUZZLES = [
  {
    q: "Długopis i zeszyt kosztują razem 11 zł. Zeszyt jest o 10 zł droższy od długopisu. Ile kosztuje długopis?",
    a: "50 groszy. Długopis x, zeszyt x + 10, razem 2x + 10 = 11, więc x = 0,5.",
  },
  {
    q: "Ile to jest 1 + 2 + 3 + ... + 100?",
    a: "5050. Parujesz 1 z 100, 2 z 99 itd. Wychodzi 50 par po 101.",
  },
  {
    q: "Cena spadła o 20%, potem wzrosła o 20%. Czy wróciła do początkowej?",
    a: "Nie. 0,8 · 1,2 = 0,96, więc jest o 4% niższa niż na początku.",
  },
  {
    q: "Jaka jest ostatnia cyfra liczby 7 do potęgi 2025?",
    a: "7. Ostatnie cyfry potęg siódemki powtarzają się co 4: 7, 9, 3, 1. Reszta z 2025 : 4 to 1.",
  },
  {
    q: "W klasie jest 30 osób. Ile uścisków dłoni, jeśli każdy wita się z każdym raz?",
    a: "435. To 30 · 29 : 2.",
  },
  {
    q: "Ile procent liczby 50 to liczba 8?",
    a: "16%. 8 : 50 = 0,16.",
  },
  {
    q: "Prostokąt ma obwód 20 cm. Jakie pole może mieć co najwyżej?",
    a: "25 cm². Największe pole ma kwadrat 5 cm na 5 cm.",
  },
  {
    q: "Ile to jest 15% z 200?",
    a: "30. 10% to 20, a 5% to 10, razem 30.",
  },
  {
    q: "Kąty trójkąta mają się do siebie jak 2 : 3 : 4. Ile stopni ma największy?",
    a: "80°. Suma to 180°, a 2 + 3 + 4 = 9 części, więc jedna część to 20°, a 4 · 20° = 80°.",
  },
  {
    q: "Pomyśl liczbę, pomnóż ją przez 3, dodaj 6, podziel przez 3 i odejmij pomyślaną liczbę. Co wyszło?",
    a: "2. (3x + 6) : 3 = x + 2, a po odjęciu x zostaje 2, niezależnie od liczby.",
  },
  {
    q: "Na ile zer kończy się liczba 100! (iloczyn od 1 do 100)?",
    a: "24. Każde zero daje para 2 i 5, a piątek jest mniej niż dwójek: 100 : 5 = 20 oraz 100 : 25 = 4, razem 24.",
  },
  {
    q: "Pociąg jedzie ze stałą prędkością 60 km/h. Ile kilometrów przejedzie w 90 minut?",
    a: "90 km. 90 minut to 1,5 godziny, a 60 · 1,5 = 90.",
  },
  {
    q: "Średnia trzech liczb to 10. Dwie z nich to 8 i 12. Jaka jest trzecia?",
    a: "10. Suma wszystkich to 30, a 30 - 8 - 12 = 10.",
  },
  {
    q: "Ile przekątnych ma sześciokąt wypukły?",
    a: "9. Wzór n(n - 3) : 2 daje 6 · 3 : 2 = 9.",
  },
  {
    q: "Ile wynosi suma wszystkich liczb nieparzystych od 1 do 19?",
    a: "100. Suma pierwszych n liczb nieparzystych to n², a tu jest ich 10.",
  },
  {
    q: "Kolarz przejechał 2/5 trasy i zostało mu 18 km. Jak długa jest cała trasa?",
    a: "30 km. Zostało 3/5 trasy, czyli 18 km, więc 1/5 to 6 km, a cała trasa to 30 km.",
  },
  {
    q: "Ile jest liczb dwucyfrowych podzielnych przez 7?",
    a: "13. Są to wielokrotności 7 od 7 · 2 = 14 do 7 · 14 = 98, czyli 13 liczb.",
  },
  {
    q: "Suma trzech kolejnych liczb całkowitych to 72. Jaka jest najmniejsza z nich?",
    a: "23. Środkowa to 72 : 3 = 24, więc liczby to 23, 24 i 25.",
  },
  {
    q: "Wiadomo, że x + 1/x = 3. Ile wynosi x² + 1/x²?",
    a: "7. Podnieś równanie do kwadratu: x² + 2 + 1/x² = 9, więc x² + 1/x² = 7.",
  },
  {
    q: "Długość prostokąta jest dwa razy większa od szerokości, a obwód to 36 cm. Ile wynosi pole?",
    a: "72 cm². Szerokość b, długość 2b, obwód 6b = 36, więc b = 6, a pole to 6 · 12 = 72.",
  },
  {
    q: "Ile jest różnych liczb trzycyfrowych z cyfr 1, 2, 3, jeśli cyfry się nie powtarzają?",
    a: "6. Jest 3 · 2 · 1 = 6 ustawień: 123, 132, 213, 231, 312, 321.",
  },
  {
    q: "Po obniżce o 25% kurtka kosztuje 60 zł. Ile kosztowała przed obniżką?",
    a: "80 zł. 60 zł to 75% ceny, więc cena to 60 : 0,75 = 80.",
  },
  {
    q: "Rzucasz dwiema kostkami. Jakie jest prawdopodobieństwo, że suma oczek to 7?",
    a: "1/6. Sprzyja 6 par (1+6, 2+5, 3+4 i odwrotnie) z 36 możliwych.",
  },
  {
    q: "Ile to jest 2 do potęgi 10?",
    a: "1024. 2⁵ = 32, a 32 · 32 = 1024.",
  },
  {
    q: "Jaki kąt tworzą wskazówki zegara o godzinie 4:00?",
    a: "120°. Każda godzina na tarczy to 30°, a 4 · 30° = 120°.",
  },
  {
    q: "Czy liczba 123456 dzieli się przez 9?",
    a: "Nie. Suma cyfr to 21, co dzieli się przez 3, ale nie przez 9, więc liczba dzieli się przez 3, ale nie przez 9.",
  },
  {
    q: "Rozwiąż równanie |x - 3| = 5.",
    a: "x = 8 lub x = -2. Odległość x od 3 ma wynosić 5, więc 3 + 5 albo 3 - 5.",
  },
  {
    q: "Bok kwadratu powiększono o 3 i pole wzrosło o 39. Jaki był bok początkowy?",
    a: "5. (a + 3)² - a² = 6a + 9 = 39, więc a = 5.",
  },
  {
    q: "Oblicz w pamięci 99 · 101.",
    a: "9999. To (100 - 1)(100 + 1) = 100² - 1.",
  },
  {
    q: "Rozwiąż równanie x² - 9x + 20 = 0.",
    a: "x = 4 lub x = 5. Szukasz dwóch liczb o sumie 9 i iloczynie 20, albo Δ = 1.",
  },
] as const;

const subscribeNoop = () => () => {};
const getDayIndex = () => {
  const now = new Date();
  const localDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(localDay / 86_400_000) % PUZZLES.length;
};

function DailyPuzzle() {
  const index = useSyncExternalStore(subscribeNoop, getDayIndex, () => 0);
  const [revealed, setRevealed] = useState(false);

  const puzzle = PUZZLES[index];

  return (
    <div className="card-raised flex flex-col justify-between gap-5 p-5 sm:p-6">
      <div>
        <p className="text-overline">ZAGADKA DNIA</p>
        <h3 className="mt-2 text-xl font-extrabold tracking-tight text-foreground">
          {puzzle.q}
        </h3>
      </div>
      {revealed ? (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold leading-relaxed text-accent">
          {puzzle.a}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="self-start rounded-full bg-accent-soft px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent/20"
        >
          Pokaż rozwiązanie
        </button>
      )}
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function ProductPreview() {
  const [recentTopic, setRecentTopic] =
    useState<RecentTrainingTopic | null>(null);

  useEffect(() => {
    let cancelled = false;
    let authRevision = 0;
    const hasSupabaseConfig = isSupabaseConfigured();
    let supabase: ReturnType<typeof getSupabase> | null = null;
    if (hasSupabaseConfig) {
      try {
        supabase = getSupabase();
      } catch (error) {
        console.warn("[szybka-matma] dashboard client:", error);
      }
    }

    const loadRecentTopic = async () => {
      const revision = authRevision;
      if (hasSupabaseConfig && !supabase) return;
      let userId: string | null = null;

      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          userId = data.session?.user?.id ?? null;
        } catch (error) {
          if (revision === authRevision) {
            console.warn("[szybka-matma] dashboard session:", error);
          }
          return;
        }
      }

      if (cancelled || revision !== authRevision) return;
      if (!userId || !supabase) {
        setRecentTopic(null);
        return;
      }

      const latestSolved = await fetchLatestSolvedTopic(userId);
      if (cancelled || revision !== authRevision) return;

      if (
        latestSolved?.examType === "matura_podstawowa" ||
        latestSolved?.examType === "8_klasa"
      ) {
        setRecentTopic({
          examKey: latestSolved.examType,
          category: latestSolved.category,
          topic: latestSolved.topic,
          visitedAt: Date.parse(latestSolved.solvedAt) || Date.now(),
        });
      } else {
        setRecentTopic(null);
      }
    };

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      authRevision += 1;
      const userId = session?.user?.id ?? null;
      if (!userId) {
        setRecentTopic(null);
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) void loadRecentTopic();
      }, 0);
    }).data.subscription;

    void loadRecentTopic();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  if (!recentTopic) return <QuickTrial />;

  const topicLabel = topicDisplayName(
    recentTopic.examKey,
    recentTopic.category,
    recentTopic.topic,
  );
  const levelLabel =
    recentTopic.examKey === "8_klasa"
      ? "egzamin ósmoklasisty"
      : "poziom podstawowy";
  const topicHref = buildTopicHref(
    recentTopic.examKey,
    recentTopic.category,
    recentTopic.topic,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="card-raised relative overflow-hidden p-4 sm:p-6"
      aria-label="Ostatni temat"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <p className="text-overline">Ostatni temat</p>
          <span className="icon-chip h-11 w-11 shrink-0">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <Link
          href={topicHref}
          className="group mt-6 block rounded-2xl border border-surface-border bg-background/70 p-4 transition-colors hover:border-accent/60 hover:bg-background sm:p-5"
          aria-label={`Wróć do tematu ${topicLabel}`}
        >
          <p className="text-overline">KONTYNUUJ NAUKĘ</p>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-2xl">
            {topicLabel}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Wróć do ostatnio otwartego tematu · {levelLabel}
          </p>
          <p className="mt-5 rounded-xl bg-accent-soft/60 px-3 py-2.5 text-sm font-semibold text-accent">
            Otwórz temat i kontynuuj od miejsca, w którym skończyłeś.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm font-bold text-accent">
            <span>Wróć do tematu</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

function EntryPathCard({
  href,
  eyebrow,
  label,
  text,
  action,
  icon: Icon,
  featured,
}: (typeof ENTRY_PATHS)[number]) {
  return (
    <Link
      href={href}
      className={`group card-raised flex min-h-64 flex-col p-5 sm:p-6 ${
        featured
          ? "border-accent/45 bg-accent-soft/35 hover:border-accent/70"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="icon-chip h-12 w-12 shrink-0">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight
          className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-accent"
          aria-hidden
        />
      </div>
      <p className="mt-6 text-overline">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-extrabold tracking-tight text-foreground group-hover:text-accent">
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
      <span className="mt-auto pt-6 text-sm font-bold text-foreground group-hover:text-accent">
        {action} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export function HomeDashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate -mx-4 overflow-hidden border-b border-surface-border sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16">
        <GamingBackground variant="hero" />
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        >
          <div className="home-grid-bg absolute inset-0" />
        </div>

        <div className="page-container relative z-10">
          <div className="grid items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 md:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,0.82fr)] lg:gap-14 lg:px-10 lg:py-24 xl:px-12 2xl:px-16">
            <div>
              <motion.h1
                className="max-w-2xl text-[clamp(2.65rem,6.5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.055em]"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                <span className="text-foreground">Przygotuj się do</span>
                <br />
                <span className="text-accent">egzaminu z matematyki.</span>
              </motion.h1>

              <motion.p
                className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.14 }}
              >
                Wybierz temat, rozwiązuj zadania i sprawdzaj się na arkuszach
                CKE - wszystko w jednym miejscu.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="/trening"
                  className="btn-chunky px-7 py-4 text-base sm:px-8"
                >
                  Zacznij trening
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/trening/arkusze"
                  className="text-sm font-bold text-foreground underline decoration-surface-border underline-offset-4 transition hover:text-accent hover:decoration-accent"
                >
                  Zobacz arkusze CKE
                </Link>
              </motion.div>

              <motion.div
                className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.26 }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  Teoria i zadania krok po kroku
                </span>
                <span className="text-surface-border" aria-hidden>
                  •
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  Matura i egzamin ósmoklasisty
                </span>
              </motion.div>
            </div>

            <ProductPreview />
          </div>

          <div className="border-t border-surface-border px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-muted">
                Wszystko, czego potrzebujesz do regularnej nauki
              </p>
              <PlatformStatus variant="inline" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border py-14 sm:py-20">
        <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="max-w-2xl">
            <p className="text-overline">TRZY DROGI, JEDEN CEL</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Wybierz swój pierwszy krok
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Nie musisz wiedzieć, od czego zacząć. Wybierz tryb, który pasuje
              do tego, czego potrzebujesz dzisiaj.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ENTRY_PATHS.map((item) => (
              <EntryPathCard key={item.href} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border bg-surface/35 py-14 sm:py-20">
        <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="text-overline">MATERIAŁY W ŚRODKU</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Nie zaczynasz od pustej kartki
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                Masz gotową bazę do pracy: zadania, minigry i oficjalne arkusze.
                Wchodzisz, wybierasz cel i robisz następny krok.
              </p>
            </div>
            <PlatformStatus variant="cards" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div className="page-container relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="max-w-2xl">
            <p className="text-overline">ŚCIĄGA</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Wzory, które warto znać na pamięć
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Sześć najważniejszych dla Twojego poziomu, z krótkim przykładem.
            </p>
          </div>

          <FormulaSheet />

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
            <DailyPuzzle />

            <Link
              href="/trening"
              className="card-raised group flex items-center justify-between gap-4 p-5 sm:p-6"
            >
              <span>
                <span className="block text-sm font-bold text-muted">
                  Gotowy?
                </span>
                <span className="mt-1 block text-lg font-extrabold tracking-tight text-foreground group-hover:text-accent">
                  Przejdź do treningu
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-accent transition group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
