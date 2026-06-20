"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="mt-auto w-full border-t border-white/5 py-6">
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-zinc-500 md:px-8">
        <p>© {new Date().getFullYear()} Szybka Matma</p>
        <nav
          aria-label="Stopka"
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            href="/baza-zadan"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Baza zadań
          </Link>
          <Link
            href="/admin"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Panel Admina
          </Link>
          <Link
            href="/admin/materialy"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Materiały
          </Link>
        </nav>
      </div>
    </footer>
  );
}
