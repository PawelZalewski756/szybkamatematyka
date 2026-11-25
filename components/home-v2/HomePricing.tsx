"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PricingTeaser } from "@/components/home-v2/HomeSections";
import { proMemberPricing } from "@/lib/home/signed-in-home";
import { useSubscription } from "@/lib/subscription/use-subscription";

function ProMemberPricing() {
  const copy = proMemberPricing();
  return (
    <section
      id="cennik"
      className="border-b border-surface-border bg-surface/35 py-14 sm:py-20"
      aria-labelledby="cennik-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <p className="text-overline">TWÓJ PLAN</p>
        <h2
          id="cennik-heading"
          className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
        >
          {copy.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {copy.text}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={copy.train.href} className="btn-chunky px-5 py-3 text-sm">
            {copy.train.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={copy.manage.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
          >
            {copy.manage.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomePricing() {
  const { isPro, loading } = useSubscription();
  if (!loading && isPro) return <ProMemberPricing />;
  return <PricingTeaser />;
}
