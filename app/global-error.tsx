"use client";

import "./globals.css";
import { ErrorView } from "@/components/feedback/ErrorView";
import { reportClientError } from "@/lib/observability/client-report";
import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const recover = retry ?? reset;

  useEffect(() => {
    reportClientError(error, "global-error");
  }, [error]);

  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <ErrorView
          title="Krytyczny błąd aplikacji"
          description="Aplikacja napotkała nieoczekiwany problem. Odśwież stronę, aby spróbować ponownie."
          reset={recover}
        />
      </body>
    </html>
  );
}
