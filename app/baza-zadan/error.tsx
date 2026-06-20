"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { useEffect } from "react";

export default function BazaZadanError({
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
    <ErrorView
      title="Nie udało się załadować bazy zadań"
      description="Wystąpił problem podczas pobierania zadań. Sprawdź połączenie i spróbuj ponownie."
      reset={reset}
    />
  );
}
