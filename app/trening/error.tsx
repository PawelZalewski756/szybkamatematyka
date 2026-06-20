"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { useEffect } from "react";

export default function TreningError({
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
      title="Nie udało się załadować treningu"
      description="Wystąpił problem podczas pobierania ścieżki treningowej. Spróbuj ponownie."
      reset={reset}
    />
  );
}
