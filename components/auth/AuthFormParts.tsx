export const AUTH_INPUT_CLASS =
  "rounded-2xl border border-surface-border bg-surface px-4 py-3.5 text-foreground outline-none transition-shadow placeholder:text-muted focus:ring-4 focus:border-accent/50 focus:ring-accent/20";

export function AuthAlert({
  message,
  isError,
}: {
  message: string;
  isError: boolean;
}) {
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        isError
          ? "border border-red-500/30 bg-red-500/10 text-red-300"
          : "border border-success/30 bg-success/10 text-success"
      }`}
      role="alert"
    >
      {message}
    </p>
  );
}
