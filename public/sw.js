/**
 * Lekki service worker — tylko powłoka aplikacji (/, /offline).
 * Nie cache’uje bazy zadań, API ani tras dynamicznych.
 *
 * Push notifications (Web Push + VAPID) — odłożone: wymaga kluczy serwera
 * i handlera push w SW. Przypomnienia o serii działają przez Notification API
 * w otwartej karcie (lib/reminders/*); bez VAPID nie rejestrujemy push.
 */
const CACHE_SHELL = "szybka-matma-shell-v2";
const SHELL_URLS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_SHELL)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isShellNavigation(url) {
  const path = url.pathname;
  return path === "/" || path === "/offline";
}

function shouldBypassCache(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/baza-zadan") ||
    url.pathname.startsWith("/arkusze") ||
    url.pathname.startsWith("/_next/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypassCache(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isShellNavigation(url)) {
            const copy = response.clone();
            caches.open(CACHE_SHELL).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match("/offline");
          if (offline) return offline;
          const home = await caches.match("/");
          if (home) return home;
          return Response.error();
        }),
    );
  }
});
