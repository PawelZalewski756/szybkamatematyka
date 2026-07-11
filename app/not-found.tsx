import { GamingBackground } from "@/components/gaming/GamingBackground";
import { Compass, Home, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strona nie znaleziona (404)",
  robots: { index: false, follow: false },
};

const quickLinks = [
  { href: "/", label: "Strona główna", icon: Home },
  { href: "/trening", label: "Trening", icon: Swords },
  { href: "/rankingi", label: "Rankingi", icon: Trophy },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <span className="icon-chip mb-6 h-16 w-16 rounded-2xl">
          <Compass className="h-8 w-8" aria-hidden />
        </span>

        <p className="text-overline text-accent/90">Błąd 404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Tej strony nie ma na mapie
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted">
          Strona, której szukasz, nie istnieje lub została przeniesiona. Wróć na
          znaną ścieżkę i graj dalej.
        </p>

        <nav
          aria-label="Szybkie linki"
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="chip-link">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
