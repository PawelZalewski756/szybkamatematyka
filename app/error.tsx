"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { useEffect } from "react";

export default function RootError({
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
      title="Coś poszło nie tak"
      description="Wystąpił nieoczekiwany błąd. Możesz spróbować ponownie lub wrócić na stronę główną."
      reset={reset}
    />
  );
}
