import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export function HomeGamingFooter() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] pt-10 pb-4">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <BrandLogo asLink={false} className="justify-center sm:justify-start" />
          <p className="mt-2 text-xs text-slate-500">
            © {new Date().getFullYear()} Szybka Matematyka · szybkamatematyka.pl
          </p>
        </div>
        <nav
          aria-label="Stopka"
          className="flex flex-wrap justify-center gap-4 sm:justify-end"
        >
          <Link
            href="/baza-zadan"
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-teal-300"
          >
            Baza zadań
          </Link>
          <Link
            href="/admin"
            className="text-xs font-semibold text-slate-500 transition-colors hover:text-teal-300"
          >
            Panel Admina
          </Link>
        </nav>
      </div>
    </footer>
  );
}
