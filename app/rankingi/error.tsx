"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { useEffect } from "react";

export default function RankingiError({
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
      title="Nie udało się załadować rankingu"
      description="Wystąpił problem podczas pobierania tablicy wyników. Spróbuj ponownie za chwilę."
      reset={reset}
    />
  );
}
