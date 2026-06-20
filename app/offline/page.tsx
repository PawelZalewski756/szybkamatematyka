"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { Home, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/15 ring-1 ring-white/10">
          <WifiOff className="h-8 w-8 text-fuchsia-300" aria-hidden />
        </span>

        <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-400/90">
          Tryb offline
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Brak połączenia z siecią
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-zinc-400">
          Nie możemy teraz załadować tej strony. Sprawdź internet i spróbuj
          ponownie — zapisana powłoka aplikacji i strona główna mogą być
          dostępne bez sieci.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Odśwież
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"
          >
            <Home className="h-4 w-4" aria-hidden />
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}
