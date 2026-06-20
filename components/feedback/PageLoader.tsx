import { Loader2 } from "lucide-react";

type PageLoaderProps = {
  /** Tekst komunikatu pod spinnerem. */
  label?: string;
  /** Krótszy wariant — mniej pionowego paddingu (np. wewnątrz sekcji). */
  compact?: boolean;
};

/**
 * Spójny, brandowy wskaźnik ładowania używany przez konwencję `loading.tsx`
 * App Routera oraz wewnątrz sekcji ładujących dane.
 */
export function PageLoader({
  label = "Ładowanie…",
  compact = false,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-1 flex-col items-center justify-center gap-4 text-center ${
        compact ? "py-12" : "min-h-[55vh] py-20"
      }`}
    >
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl"
          aria-hidden
        />
        <Loader2 className="h-10 w-10 animate-spin text-orange-400" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-zinc-400">{label}</p>
    </div>
  );
}
