"use client";

import { useSubscription } from "@/lib/subscription/use-subscription";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type BannerKind = "success" | "portal" | null;

function CheckoutStatusBannerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useSubscription();
  const [banner] = useState<BannerKind>(() => {
    if (searchParams.get("checkout") === "success") return "success";
    if (searchParams.get("portal") === "return") return "portal";
    return null;
  });

  useEffect(() => {
    if (!banner) return;
    void refresh();
    router.replace("/profil", { scroll: false });
  }, [banner, refresh, router]);

  if (banner === "success") {
    return (
      <p
        role="status"
        className="mt-6 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm font-semibold text-success"
      >
        Płatność przyjęta. Aktywacja Pro może potrwać chwilę — odśwież stronę,
        jeśli status jeszcze się nie zmienił.
      </p>
    );
  }

  if (banner === "portal") {
    return (
      <p
        role="status"
        className="mt-6 rounded-2xl border border-surface-border bg-white/10 px-4 py-3 text-sm font-semibold text-muted"
      >
        Wróciłeś z portalu Stripe. Status planu odświeżamy automatycznie.
      </p>
    );
  }

  return null;
}

/** Baner po powrocie z Checkout / Customer Portal (query: checkout, portal). */
export function CheckoutStatusBanner() {
  return (
    <Suspense fallback={null}>
      <CheckoutStatusBannerInner />
    </Suspense>
  );
}
