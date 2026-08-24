"use client";

import { ErrorView } from "@/components/feedback/ErrorView";
import { reportClientError } from "@/lib/observability/client-report";
import { useEffect } from "react";

export default function RootError({
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
    reportClientError(error, "error-boundary");
  }, [error]);

  return (
    <ErrorView
      title="Coś poszło nie tak"
      description="Wystąpił nieoczekiwany błąd. Możesz spróbować ponownie lub wrócić na stronę główną."
      reset={recover}
    />
  );
}
