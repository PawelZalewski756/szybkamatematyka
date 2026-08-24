"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { reportClientError } from "@/lib/observability/client-report";
import { useEffect } from "react";

export default function RankingiError({
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
    reportClientError(error, "rankingi-error");
  }, [error]);

  return (
    <ErrorView
      title="Nie udało się załadować rankingu"
      description="Wystąpił problem podczas pobierania tablicy wyników. Spróbuj ponownie za chwilę."
      reset={recover}
    />
  );
}
