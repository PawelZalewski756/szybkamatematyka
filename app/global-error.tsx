"use client";

import "./globals.css";
import { ErrorView } from "@/components/feedback/ErrorView";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pl" className="dark">
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <ErrorView
          title="Krytyczny błąd aplikacji"
          description="Aplikacja napotkała nieoczekiwany problem. Odśwież stronę, aby spróbować ponownie."
          reset={reset}
        />
      </body>
    </html>
  );
}
