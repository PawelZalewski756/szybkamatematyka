"use client";

import { useEffect } from "react";
import { referralFromSearch } from "@/lib/referral/codes";
import { storeReferralCode } from "@/lib/referral/storage";

/**
 * Zapamiętuje kod polecający z `?ref=` na dowolnej stronie wejścia.
 * Dzięki temu link może prowadzić na stronę główną albo do cennika,
 * a rejestracja i tak odczyta kod z localStorage.
 */
export function ReferralCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = referralFromSearch(window.location.search);
    if (code) storeReferralCode(code);
  }, []);

  return null;
}
