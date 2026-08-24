import { reportClientError } from "@/lib/observability/client-report";

try {
  window.addEventListener("error", (event) => {
    reportClientError(event.error ?? event.message, "window.error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportClientError(event.reason, "unhandledrejection");
  });
} catch {
  /* instrumentation must never break the app */
}
