import Link from "next/link";
import type { ReactNode } from "react";
import { AdminStamp } from "./admin-stamp";

export function AdminSection({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <AdminStamp>{title}</AdminStamp>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="text-sm font-semibold text-brand-red underline">
            {actionLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
