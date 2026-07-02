export const AUTH_INPUT_CLASS =
  "rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-white outline-none transition-shadow placeholder:text-zinc-600 focus:ring-4 focus:border-teal-500/50 focus:ring-teal-500/20";

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
          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      }`}
      role="alert"
    >
      {message}
    </p>
  );
}
