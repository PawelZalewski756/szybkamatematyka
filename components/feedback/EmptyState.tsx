import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

type EmptyStateAction = {
  label: string;
  href: string;
};

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  action?: EmptyStateAction;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`mx-auto flex max-w-md flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface text-brand">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      )}
      {action && (
        <Link href={action.href} className="btn-primary mt-5 px-5 py-2.5 text-sm">
          {action.label}
        </Link>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
