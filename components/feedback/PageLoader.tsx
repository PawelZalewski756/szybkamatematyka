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
      <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}
