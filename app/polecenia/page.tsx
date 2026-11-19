import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  Gift,
  MailCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Program poleceń - 30 dni Pro za 2 znajomych",
  description:
    "Zaproś 2 znajomych do Szybkiej Matematyki. Gdy potwierdzą e-mail i rozwiążą po 3 zadania, dostajesz 30 dni Pro. Zasady, limity i odpowiedzi.",
  alternates: { canonical: "/polecenia" },
};

const STEPS = [
  {
    icon: UserPlus,
    title: "1. Wyślij link",
    text: "Skopiuj swój link z profilu i wyślij go znajomym.",
  },
  {
    icon: MailCheck,
    title: "2. Znajomy się uczy",
    text: "Potwierdza e-mail, rozwiązuje 3 zadania i mija 7 dni od rejestracji.",
  },
  {
    icon: Gift,
    title: "3. Odbierz 30 dni Pro",
    text: "Za 2 takie osoby dostajesz 30 dni Pro. Raz na konto.",
  },
];

export default function PoleceniaPage() {
  return (
    <div className="page-container flex flex-1 flex-col py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← Strona główna
      </Link>

      <header className="mt-4 max-w-3xl">
        <p className="text-overline text-accent">Program poleceń</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Zaproś 2 znajomych, dostań 30 dni Pro
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Bez karty i bez haczyków. Liczy się tylko to, czy zaproszona osoba
          naprawdę zacznie ćwiczyć - nie sam e-mail.
        </p>
      </header>

      <section
        className="mt-8 grid gap-3 sm:grid-cols-3"
        aria-label="Jak działa program poleceń"
      >
        {STEPS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-surface-border bg-surface p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-3 text-sm font-extrabold text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </section>

      <section
        className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/30 p-5 sm:p-6"
        aria-labelledby="zasady-polecen"
      >
        <h2
          id="zasady-polecen"
          className="text-lg font-extrabold text-foreground"
        >
          Co dokładnie się liczy
        </h2>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted sm:grid-cols-2">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Potwierdzony e-mail (bez jednorazowych skrzynek).
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Konto ma co najmniej 7 dni.
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Znajomy rozwiązał co najmniej 3 zadania.
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            2 takie osoby = 30 dni Pro, raz na konto.
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Jeśli masz już Pro z prezentu lub poleceń, nowe 30 dni dopisuje się do
          końca okresu. Aktywne Pro ze Stripe nie jest nadpisywane - nagroda
          poczeka, aż subskrypcja przestanie być aktywna.
        </p>
      </section>

      <section className="mt-8 max-w-3xl" aria-labelledby="gdzie-link">
        <h2 id="gdzie-link" className="text-lg font-extrabold text-foreground">
          Gdzie znajdę swój link?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          W profilu, w sekcji „Program poleceń”. Zobaczysz tam też licznik
          zakwalifikowanych osób i datę końca Pro.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/profil#program-polecen" className="btn-chunky px-4 py-2.5 text-sm">
            Otwórz mój profil
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/login"
            className="btn-chunky-soft px-4 py-2.5 text-sm"
          >
            Nie mam konta - załóż
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted">
          Nagroda jest przyznawana raz dziennie przez system, po spełnieniu
          warunków. Nie trzeba nic klikać.
        </p>
      </section>
    </div>
  );
}
