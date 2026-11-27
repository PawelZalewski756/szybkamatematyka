import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo";
import { CONTACT_EMAIL } from "@/lib/brand/constants";

const FOOTER_GROUPS = [
  {
    label: "Nauka",
    links: [
      { href: "/trening", label: "Trening" },
      { href: "/baza-zadan", label: "Baza zadań" },
      { href: "/powtorki", label: "Powtórki" },
      { href: "/plan-klasy", label: "Plan klasy" },
    ],
  },
  {
    label: "Egzaminy",
    links: [
      { href: "/trening/arkusze", label: "Arkusze CKE" },
      { href: "/sprawdziany", label: "Sprawdziany" },
      { href: "/diagnostyka", label: "Diagnoza" },
      { href: "/matura-rozszerzona", label: "Matura rozszerzona" },
    ],
  },
  {
    label: "Gry",
    links: [
      { href: "/minigry", label: "Minigry" },
      { href: "/wyzwania", label: "Wyzwania" },
      { href: "/pojedynki", label: "Pojedynki" },
      { href: "/rankingi", label: "Rankingi" },
      { href: "/osiagniecia", label: "Osiągnięcia" },
    ],
  },
  {
    label: "Konto",
    links: [
      { href: "/profil", label: "Profil" },
      { href: "/cennik", label: "Cennik" },
      { href: "/polecenia", label: "Program poleceń" },
      { href: "/#wszystko", label: "Wszystkie funkcje" },
    ],
  },
  {
    label: "Szkoła i informacje",
    links: [
      { href: "/dla-szkol", label: "Dla szkół" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/regulamin", label: "Regulamin" },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/zglos-blad", label: "Zgłoś błąd" },
    ],
  },
] as const;

export function HomeFooterV2() {
  return (
    <footer className="border-t border-surface-border pt-10 pb-6" data-print-hide>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <BrandLogo asLink={false} className="justify-start" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Nauka matematyki do matury i egzaminu ósmoklasisty: teoria, zadania
            z rozwiązaniami, arkusze CKE, powtórki i gry.
          </p>
          <p className="mt-3 text-sm text-muted">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-3 text-xs text-muted">
            © {new Date().getFullYear()} Szybka Matematyka · szybkamatematyka.pl
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            Niezależny projekt edukacyjny. Nie jesteśmy oficjalnym serwisem CKE.
          </p>
        </div>

        <nav
          aria-label="Mapa serwisu"
          className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm sm:grid-cols-3 lg:grid-cols-5"
        >
          {FOOTER_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                {group.label}
              </p>
              {group.links.map((link) => (
                <Link
                  key={`${group.label}-${link.href}`}
                  href={link.href}
                  className="text-muted hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
