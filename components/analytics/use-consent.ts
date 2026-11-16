"use client";

import { useSyncExternalStore } from "react";
import {
  getServerConsent,
  readConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/analytics/consent";

/** Reaktywny odczyt zgód - wspólny dla banera, analityki i reklam. */
export function useConsent() {
  const snapshot = useSyncExternalStore(
    subscribeConsent,
    readConsent,
    getServerConsent,
  );

  return {
    ...snapshot,
    save: saveConsent,
  };
}
