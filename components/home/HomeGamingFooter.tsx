import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export function HomeGamingFooter() {
  return (
    <footer className="border-t border-surface-border pt-10 pb-6">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BrandLogo asLink={false} className="justify-start" />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Nauka matematyki do matury i egzaminu ósmoklasisty: teoria, zadania
            z rozwiązaniami i arkusze CKE.
          </p>
          <p className="mt-3 text-xs text-muted">
            © {new Date().getFullYear()} Szybka Matematyka · szybkamatematyka.pl
          </p>
        </div>
        <nav
          aria-label="Stopka"
          className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:text-right"
        >
          <Link href="/trening" className="text-muted hover:text-accent">
            Trening
          </Link>
          <Link href="/baza-zadan" className="text-muted hover:text-accent">
            Baza zadań
          </Link>
          <Link href="/trening/arkusze" className="text-muted hover:text-accent">
            Arkusze CKE
          </Link>
          <Link href="/minigry" className="text-muted hover:text-accent">
            Minigry
          </Link>
          <Link href="/wyzwania" className="text-muted hover:text-accent">
            Wyzwania
          </Link>
          <Link href="/cennik" className="text-muted hover:text-accent">
            Cennik
          </Link>
        </nav>
      </div>
    </footer>
  );
}
