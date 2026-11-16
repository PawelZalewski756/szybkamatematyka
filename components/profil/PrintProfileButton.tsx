"use client";

import { Printer } from "lucide-react";

export function PrintProfileButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent print:hidden"
    >
      <Printer className="h-4 w-4" aria-hidden />
      Drukuj raport
    </button>
  );
}
