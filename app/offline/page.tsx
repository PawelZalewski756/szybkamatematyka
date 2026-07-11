"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { Home, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <span className="icon-chip mb-6 h-16 w-16 rounded-2xl">
          <WifiOff className="h-8 w-8" aria-hidden />
        </span>

        <p className="text-overline text-accent/90">Tryb offline</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Brak połączenia z siecią
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted">
          Nie możemy teraz załadować tej strony. Sprawdź internet i spróbuj
          ponownie — zapisana powłoka aplikacji i strona główna mogą być
          dostępne bez sieci.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="chip-link"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Odśwież
          </button>
          <Link href="/" className="chip-link">
            <Home className="h-4 w-4" aria-hidden />
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}
