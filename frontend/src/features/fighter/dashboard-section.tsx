import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardSection({
  title,
  eyebrow,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 border-b-2 border-black pb-2">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">{eyebrow}</p>
          ) : null}
          <h2 className="text-display text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="shrink-0 pb-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-red hover:underline sm:text-[11px]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
