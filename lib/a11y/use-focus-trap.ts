"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Więzi fokus klawiatury w kontenerze dialogu i oddaje go po zamknięciu.
 *
 * Dlaczego: dialogi mobilne (`aria-modal="true"`) obsługiwały Escape, ale Tab
 * wychodził do treści pod spodem - czytnik ekranu i klawiatura trafiały wtedy
 * w niewidoczne linki. Hook pilnuje też, żeby fokus wrócił na przycisk, który
 * dialog otworzył.
 *
 * Użycie:
 *   const dialogRef = useFocusTrap<HTMLElement>(open);
 *   <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" />
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

    // Nie przestawiamy fokusu, jeśli komponent już go ustawił (np. autofocus
    // na polu nicku w onboardingu).
    if (!container.contains(document.activeElement)) {
      (getFocusable()[0] ?? container).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (!container.contains(current)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active]);

  return containerRef;
}
