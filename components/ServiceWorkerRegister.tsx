"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Stary SW z builda produkcyjnego potrafi serwować nieaktualne chunki w dev.
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          void reg.unregister();
        }
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[PWA] Rejestracja service workera nie powiodła się:", err);
    });
  }, []);

  return null;
}
