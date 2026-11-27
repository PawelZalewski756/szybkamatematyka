"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { signedInPlanCta } from "@/lib/home/signed-in-home";
import { useSubscription } from "@/lib/subscription/use-subscription";

type HomePlanLinkProps = {
  planId: string;
  guestHref: string;
  guestLabel: string;
  className: string;
};

export function HomePlanLink({
  planId,
  guestHref,
  guestLabel,
  className,
}: HomePlanLinkProps) {
  const { isLoggedIn, isPro, loading } = useSubscription();
  const signedIn = !loading && isLoggedIn ? signedInPlanCta(planId, isPro) : null;

  return (
    <Link href={signedIn?.href ?? guestHref} className={className}>
      {signedIn?.label ?? guestLabel}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
