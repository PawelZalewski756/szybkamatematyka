type BarItem = {
  label: string;
  count: number;
};

type BarListProps = {
  items: BarItem[];
  /** Klasa gradientu paska, np. "from-accent to-orange-". */
  gradient?: string;
  /** Maksymalna liczba pozycji (reszta zwijana do „pozostałe”). */
  maxItems?: number;
  /** Komunikat, gdy brak danych. */
  emptyLabel?: string;
};

const PL_NUMBER = new Intl.NumberFormat("pl-PL");

/**
 * Prosty poziomy wykres słupkowy zbudowany czystym Tailwindem (bez bibliotek).
 * Szerokość paska jest proporcjonalna do największej wartości na liście.
 */
export function BarList({
  items,
  gradient = "from-accent to-accent-strong",
  maxItems = 12,
  emptyLabel = "Brak danych",
}: BarListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  const visible = items.slice(0, maxItems);
  const hidden = items.slice(maxItems);
  const hiddenTotal = hidden.reduce((sum, item) => sum + item.count, 0);

  const rows = hiddenTotal
    ? [
        ...visible,
        { label: `+ ${hidden.length} pozostałych`, count: hiddenTotal },
      ]
    : visible;

  const max = Math.max(1, ...rows.map((item) => item.count));

  return (
    <ul className="space-y-2.5">
      {rows.map((item) => {
        const percent = Math.round((item.count / max) * 100);
        return (
          <li key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-foreground">
                {item.label}
              </span>
              <span className="shrink-0 tabular-nums font-bold text-muted">
                {PL_NUMBER.format(item.count)}
              </span>
            </div>
            <div
              className="mt-1 h-2 w-full overflow-hidden rounded-full bg-foreground/5"
              role="img"
              aria-label={`${item.label}: ${item.count}`}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                style={{ width: `${Math.max(percent, 3)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
