"use client";

export type CatalogSectionId =
  | "dzialy"
  | "arkusze"
  | "cke-matura"
  | "cke-e8"
  | "admin";

type NavItem = {
  id: CatalogSectionId;
  label: string;
  count?: number;
};

type CatalogSectionNavProps = {
  items: NavItem[];
  active: CatalogSectionId;
  onSelect: (id: CatalogSectionId) => void;
};

export function CatalogSectionNav({
  items,
  active,
  onSelect,
}: CatalogSectionNavProps) {
  if (items.length <= 1) return null;

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-2xl border border-surface-border bg-surface p-2"
      aria-label="Sekcje katalogu"
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelect(item.id);
              document
                .getElementById(`catalog-${item.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors ${
              isActive
                ? "bg-accent text-on-accent"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {item.label}
            {item.count != null && item.count > 0 && (
              <span
                className={`ml-1.5 text-xs ${isActive ? "text-on-accent/70" : "text-muted"}`}
              >
                ({item.count})
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
