"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDesktopNav } from "@/components/useDesktopNav";
import { SITE_NAME } from "@/lib/seo/site";

export function Footer() {
  const pathname = usePathname();
  const isDesktopNav = useDesktopNav();

  if (pathname === "/" || !isDesktopNav) return null;

  return (
    <footer className="mt-auto w-full border-t border-white/[0.06] py-6">
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-slate-500 md:px-8">
        <p>© {new Date().getFullYear()} {SITE_NAME}</p>
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
