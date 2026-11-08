"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CheckoutCancelledBannerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(
    () => searchParams.get("checkout") === "cancelled",
  );

  useEffect(() => {
    if (!show) return;
    router.replace("/cennik", { scroll: false });
  }, [show, router]);

  if (!show) return null;

  return (
    <p
      role="status"
      className="mt-6 rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm text-muted"
    >
      Płatność anulowana — możesz wrócić do wyboru planu w dowolnym momencie.
      <button
        type="button"
        className="ml-2 text-accent underline-offset-2 hover:underline"
        onClick={() => setShow(false)}
      >
        Zamknij
      </button>
    </p>
  );
}

export function CheckoutCancelledBanner() {
  return (
    <Suspense fallback={null}>
      <CheckoutCancelledBannerInner />
    </Suspense>
  );
}
