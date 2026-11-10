import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  href,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
  accent?: boolean;
}) {
  const body = (
    <>
      <p className={cn("text-display text-2xl font-semibold sm:text-3xl lg:text-4xl", accent ? "text-brand-red" : "")}>
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] sm:mt-2 sm:text-xs sm:tracking-[0.16em]">
        {label}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{hint}</p>}
    </>
  );

  const className = cn(
    "border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000] transition-transform sm:p-5 sm:shadow-[6px_6px_0_0_#000]",
    href && "active:translate-y-0.5 sm:hover:-translate-y-0.5 sm:hover:shadow-[8px_8px_0_0_#c8102e]",
    accent && "bg-black text-white shadow-[4px_4px_0_0_#c8102e] sm:shadow-[6px_6px_0_0_#c8102e]"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
