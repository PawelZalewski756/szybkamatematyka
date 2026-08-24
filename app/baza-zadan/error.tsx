"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { reportClientError } from "@/lib/observability/client-report";
import { useEffect } from "react";

export default function BazaZadanError({
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
    reportClientError(error, "baza-error");
  }, [error]);

  return (
    <ErrorView
      title="Nie udało się załadować bazy zadań"
      description="Wystąpił problem podczas pobierania zadań. Sprawdź połączenie i spróbuj ponownie."
      reset={recover}
    />
  );
}
