import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export function HomeGamingFooter() {
  return (
    <footer className="mt-8 border-t border-surface-border pt-8 pb-4">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <BrandLogo asLink={false} className="justify-center sm:justify-start" />
          <p className="mt-2 text-xs text-muted">
            © {new Date().getFullYear()} Szybka Matematyka · szybkamatematyka.pl
          </p>
        </div>
        <nav
          aria-label="Stopka"
          className="flex flex-wrap justify-center gap-4 sm:justify-end"
        >
          <Link href="/baza-zadan" className="link-plain text-xs">
            Baza zadań
          </Link>
          <Link href="/admin" className="link-plain text-xs">
            Panel Admina
          </Link>
        </nav>
      </div>
    </footer>
  );
}
