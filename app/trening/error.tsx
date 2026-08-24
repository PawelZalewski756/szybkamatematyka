"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { reportClientError } from "@/lib/observability/client-report";
import { useEffect } from "react";

export default function TreningError({
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
    reportClientError(error, "trening-error");
  }, [error]);

  return (
    <ErrorView
      title="Nie udało się załadować treningu"
      description="Wystąpił problem podczas pobierania ścieżki treningowej. Spróbuj ponownie."
      reset={recover}
    />
  );
}
