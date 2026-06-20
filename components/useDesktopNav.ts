"use client";

import { useSyncExternalStore } from "react";

function subscribeDesktopNav(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getDesktopNavSnapshot() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

/** true od lg w górę — linki w pasku, menu tylko z resztą sekcji. */
export function useDesktopNav() {
  return useSyncExternalStore(
    subscribeDesktopNav,
    getDesktopNavSnapshot,
    () => false,
  );
}
