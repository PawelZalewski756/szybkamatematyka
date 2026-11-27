import { BugReportForm } from "@/components/feedback/BugReportForm";
import { CONTACT_EMAIL } from "@/lib/brand/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zgłoś błąd",
  description:
    "Zgłoś błąd w zadaniu, treści lub działaniu aplikacji. Bez konta, wystarczy adres e-mail.",
  alternates: { canonical: "/zglos-blad" },
};

export default async function ZglosBladPage({
  searchParams,
}: {
  searchParams: Promise<{ zadanie?: string; temat?: string }>;
}) {
  const params = await searchParams;
  const taskId =
    typeof params.zadanie === "string" ? params.zadanie.slice(0, 160) : "";
  const topic =
    typeof params.temat === "string" ? params.temat.slice(0, 160) : "";
  const initialTitle = taskId ? `Błąd w zadaniu ${taskId}` : "";
  const initialDescription = taskId
    ? [
        `Zadanie: ${taskId}`,
        topic ? `Temat: ${topic}` : "",
        "Co jest nie tak: ",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <div className="page-container w-full py-10 sm:py-14">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← Wróć do bazy zadań
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-overline">Pomoc</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Zgłoś błąd
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Napisz, co nie zadziałało. Nie musisz mieć konta - wystarczy adres
            e-mail, żebyśmy mogli odpowiedzieć.
          </p>

          <ul className="mt-6 space-y-2 text-sm leading-relaxed text-muted">
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">
                1.
              </span>
              Skopiuj adres strony, na której był problem.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">
                2.
              </span>
              Opisz krok po kroku, co się stało.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-accent">
                3.
              </span>
              Dodaj zrzut ekranu, jeśli pomoże.
            </li>
          </ul>

          <div className="mt-8 border-t border-surface-border pt-4">
            <p className="text-sm text-muted">Wolisz zwykły e-mail?</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm font-semibold text-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div>
          <BugReportForm
            initialTitle={initialTitle}
            initialDescription={initialDescription}
          />
        </div>
      </div>
    </div>
  );
}
