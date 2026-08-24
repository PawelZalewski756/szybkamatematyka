/**
 * Strukturalne logi JSON — bez sekretów i bez pełnych payloadów użytkownika.
 * Request ID pozwala skleić wpisy z jednym żądaniem.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, string | number | boolean | null | undefined>;

const SECRET_KEY =
  /pass(word)?|secret|token|authorization|cookie|dsn|api[_-]?key|service[_-]?role|stripe/i;

function redactKey(key: string): boolean {
  return SECRET_KEY.test(key);
}

export function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 500) return `${value.slice(0, 500)}…`;
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message.slice(0, 500),
    };
  }
  if (depth >= 3) return "[truncated]";
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeLogValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = redactKey(key) ? "[redacted]" : sanitizeLogValue(nested, depth + 1);
    }
    return out;
  }
  return String(value);
}

function emit(level: LogLevel, message: string, fields?: LogFields): void {
  const sanitized = sanitizeLogValue(fields ?? {});
  const extra =
    sanitized && typeof sanitized === "object" && !Array.isArray(sanitized)
      ? (sanitized as Record<string, unknown>)
      : {};
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...extra,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function logDebug(message: string, fields?: LogFields): void {
  if (process.env.NODE_ENV === "production") return;
  emit("debug", message, fields);
}

export function logInfo(message: string, fields?: LogFields): void {
  emit("info", message, fields);
}

export function logWarn(message: string, fields?: LogFields): void {
  emit("warn", message, fields);
}

export function logError(message: string, fields?: LogFields): void {
  emit("error", message, fields);
}
