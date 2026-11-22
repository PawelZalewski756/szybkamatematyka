import {
  BookOpen,
  CalendarRange,
  ClipboardCheck,
  FileText,
  Flame,
  Gamepad2,
  Gift,
  GraduationCap,
  Library,
  RefreshCw,
  ScrollText,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {
  HOME_FEATURE_GROUPS,
  HOME_FEATURES,
  type HomeFeature,
} from "@/lib/home/feature-map";

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Target,
  FileText,
  Gamepad2,
  ScrollText,
  Library,
  RefreshCw,
  CalendarRange,
  ClipboardCheck,
  Flame,
  Swords,
  Trophy,
  UserRound,
  Sparkles,
  GraduationCap,
  Gift,
};

function featureBadgeClass(badge: string): string {
  if (badge === "Pro") {
    return "border-accent/40 bg-accent/10 text-accent";
  }
  if (badge === "Nowe" || badge === "Wkrótce") {
    return "border-accent/30 bg-accent-soft/60 text-accent";
  }
  return "border-surface-border bg-surface text-muted";
}

function FeatureCard({ feature }: { feature: HomeFeature }) {
  const Icon = ICONS[feature.icon] ?? BookOpen;

  return (
    <Link
      href={feature.href}
      className={`group card-raised flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-accent/50 ${
        feature.featured ? "border-accent/45 bg-accent-soft/35" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="icon-chip h-11 w-11 shrink-0">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {feature.badge ? (
          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${featureBadgeClass(
              feature.badge,
            )}`}
          >
            {feature.badge}
          </span>
        ) : null}
      </div>

      <h4 className="mt-4 text-base font-extrabold tracking-tight text-foreground group-hover:text-accent">
        {feature.title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {feature.description}
      </p>
      <span className="mt-auto pt-4 text-sm font-bold text-accent">
        Otwórz <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export function FeatureGrid() {
  return (
    <section
      id="wszystko"
      className="border-b border-surface-border py-14 sm:py-20"
      aria-labelledby="wszystko-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="max-w-2xl">
          <p className="text-overline">PEŁNA MAPA SERWISU</p>
          <h2
            id="wszystko-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Wszystko w jednym miejscu
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Nie tylko zadania. Cały system nauki - od diagnozy po ostatnią
            powtórkę przed egzaminem.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {HOME_FEATURE_GROUPS.map((group) => {
            const features = HOME_FEATURES.filter(
              (feature) => feature.group === group.id,
            );

            return (
              <div key={group.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                    {group.label}
                  </h3>
                  <p className="max-w-xl text-sm text-muted sm:text-right">
                    {group.description}
                  </p>
                </div>

                <div className="mt-4 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="min-w-[78%] snap-start sm:min-w-0"
                    >
                      <FeatureCard feature={feature} />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted sm:hidden">
                  Przesuń w bok, aby zobaczyć więcej →
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
