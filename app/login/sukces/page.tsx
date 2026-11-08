import type { Metadata } from "next";
import Link from "next/link";

import { GoogleAdsConversion } from "@/components/analytics/GoogleAdsConversion";
import {
  GOOGLE_ADS_SIGNUP_CONVERSION,
  isGoogleAdsSignupConversionConfigured,
} from "@/lib/analytics/google-ads";
import { BRAND_NAME } from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Konto utworzone",
  description: `Rejestracja w ${BRAND_NAME} zakończona pomyślnie.`,
  robots: { index: false, follow: false },
};

type SignupSuccessPageProps = {
  searchParams: Promise<{ confirm?: string }>;
};

export default async function SignupSuccessPage({
  searchParams,
}: SignupSuccessPageProps) {
  const { confirm } = await searchParams;
  const needsEmailConfirm = confirm === "1" || confirm === "true";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      {isGoogleAdsSignupConversionConfigured() ? (
        <GoogleAdsConversion sendTo={GOOGLE_ADS_SIGNUP_CONVERSION} />
      ) : null}
      <div className="rounded-3xl border border-surface-border bg-surface/60 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Rejestracja
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Konto utworzone
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          {needsEmailConfirm
            ? "Sprawdź skrzynkę e-mail, kliknij link potwierdzający, a potem się zaloguj."
            : `Witaj w ${BRAND_NAME}. Możesz od razu zacząć naukę - postęp zapisze się na Twoim koncie.`}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {needsEmailConfirm ? (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3.5 text-sm font-bold text-on-accent transition hover:opacity-90"
            >
              Przejdź do logowania
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3.5 text-sm font-bold text-on-accent transition hover:opacity-90"
            >
              Zacznij naukę
            </Link>
          )}
          <Link
            href="/cennik"
            className="inline-flex items-center justify-center rounded-2xl border border-surface-border px-4 py-3.5 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:text-accent"
          >
            Zobacz cennik
          </Link>
        </div>
      </div>
    </div>
  );
}
