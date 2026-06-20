import Link from "next/link";

export function HomeGamingFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 pt-10 pb-4">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-xl font-black text-transparent">
            Szybka Matma
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            © {new Date().getFullYear()} Szybka Matma. Wszelkie prawa zastrzeżone.
          </p>
        </div>
        <nav
          aria-label="Stopka"
          className="flex flex-wrap justify-center gap-4 sm:justify-end"
        >
          <Link
            href="/baza-zadan"
            className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Baza zadań
          </Link>
          <Link
            href="/admin"
            className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Panel Admina
          </Link>
        </nav>
      </div>
    </footer>
  );
}
