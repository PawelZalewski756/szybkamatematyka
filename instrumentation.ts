import type { Instrumentation } from "next";
import { logInfo } from "@/lib/observability/logger";
import { reportError } from "@/lib/observability/report-error";

export async function register() {
  logInfo("instrumentation.register", {
    runtime: process.env.NEXT_RUNTIME ?? "unknown",
  });
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  await reportError(error, {
    source: "onRequestError",
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
