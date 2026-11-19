import { GOOGLE_ADS_PURCHASE_CONVERSION } from "@/lib/analytics/google-ads";

/** Minimalny kształt `window.gtag` - dzięki temu moduł da się testować bez DOM. */
export type GtagFn = (...args: unknown[]) => void;

export type PurchaseInput = {
  /** Identyfikator sesji Stripe (`cs_...`) - jednocześnie klucz deduplikacji. */
  sessionId: string;
  /** Kwota w groszach, dokładnie tak jak w `session.amount_total`. */
  amountTotalMinorUnits: number | null | undefined;
  /** Kod waluty ISO 4217 ze Stripe, np. `pln`. */
  currency: string | null | undefined;
  planId?: string | null;
};

export type PurchaseConversion = {
  sendTo: string;
  transactionId: string;
  value: number;
  currency: string;
};

const STORAGE_PREFIX = "gads:purchase:";

/**
 * Normalizuje walutę do ISO 4217 (wielkie litery).
 * Stripe zwraca małe litery (`pln`), Google Ads oczekuje kodu waluty konta.
 */
export function normalizeCurrency(raw: string | null | undefined): string {
  const code = (raw ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "PLN";
}

/** Grosze → złote, z zaokrągleniem do dwóch miejsc. Wartości ujemne/brak → 0. */
export function toMajorUnits(
  minorUnits: number | null | undefined,
): number {
  if (
    typeof minorUnits !== "number" ||
    !Number.isFinite(minorUnits) ||
    minorUnits <= 0
  ) {
    return 0;
  }
  return Math.round(minorUnits) / 100;
}

/**
 * Buduje payload konwersji „Zakup PRO”.
 * Zwraca `null`, gdy brakuje etykiety konwersji albo identyfikatora transakcji -
 * wtedy lepiej nie wysyłać nic, niż wysłać konwersję bez deduplikacji.
 */
export function buildPurchaseConversion(
  input: PurchaseInput,
  sendTo: string = GOOGLE_ADS_PURCHASE_CONVERSION,
): PurchaseConversion | null {
  const transactionId = input.sessionId?.trim();
  if (!transactionId) return null;
  if (!/^AW-\d+\/[\w-]+$/.test(sendTo)) return null;

  return {
    sendTo,
    transactionId,
    value: toMajorUnits(input.amountTotalMinorUnits),
    currency: normalizeCurrency(input.currency),
  };
}

export function purchaseStorageKey(transactionId: string): string {
  return `${STORAGE_PREFIX}${transactionId}`;
}

function safeSessionStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    // Safari w trybie prywatnym / zablokowane ciasteczka.
    return null;
  }
}

/** Czy konwersja dla tej sesji została już wysłana w tej karcie (ochrona przed F5). */
export function wasPurchaseTracked(transactionId: string): boolean {
  const storage = safeSessionStorage();
  if (!storage) return false;
  try {
    return storage.getItem(purchaseStorageKey(transactionId)) === "1";
  } catch {
    return false;
  }
}

export function markPurchaseTracked(transactionId: string): void {
  const storage = safeSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(purchaseStorageKey(transactionId), "1");
  } catch {
    // Brak dostępu do storage nie może psuć powrotu z płatności.
  }
}

/**
 * Wysyła zdarzenie `conversion` do Google Ads.
 * `transaction_id` pozwala Google odrzucić duplikaty (np. ponowne wejście
 * na stronę sukcesu z innej karty lub z innego urządzenia).
 */
export function sendPurchaseConversion(
  gtag: GtagFn,
  conversion: PurchaseConversion,
): void {
  gtag("event", "conversion", {
    send_to: conversion.sendTo,
    value: conversion.value,
    currency: conversion.currency,
    transaction_id: conversion.transactionId,
  });
}

type TrackOptions = {
  /** Wstrzykiwany gtag (testy). Domyślnie `window.gtag`. */
  gtag?: GtagFn;
  timeoutMs?: number;
  intervalMs?: number;
};

/**
 * Śledzi zakup po powrocie ze Stripe. Czeka na `gtag`, bo tag ładuje się
 * dopiero po zgodzie marketingowej i może być gotowy chwilę po hydracji.
 */
export function trackPurchaseConversion(
  input: PurchaseInput,
  options: TrackOptions = {},
): void {
  const conversion = buildPurchaseConversion(input);
  if (!conversion) return;
  if (wasPurchaseTracked(conversion.transactionId)) return;

  const resolveGtag = (): GtagFn | undefined => {
    if (options.gtag) return options.gtag;
    if (typeof window === "undefined") return undefined;
    const fromWindow = (window as unknown as { gtag?: GtagFn }).gtag;
    return typeof fromWindow === "function" ? fromWindow : undefined;
  };

  const attempt = (): boolean => {
    const gtag = resolveGtag();
    if (!gtag) return false;
    if (wasPurchaseTracked(conversion.transactionId)) return true;
    sendPurchaseConversion(gtag, conversion);
    markPurchaseTracked(conversion.transactionId);
    return true;
  };

  if (attempt()) return;
  if (typeof window === "undefined") return;

  const timeoutMs = options.timeoutMs ?? 8000;
  const intervalMs = options.intervalMs ?? 150;
  const startedAt = Date.now();

  const intervalId = window.setInterval(() => {
    const done = attempt();
    if (done || Date.now() - startedAt > timeoutMs) {
      window.clearInterval(intervalId);
    }
  }, intervalMs);
}
