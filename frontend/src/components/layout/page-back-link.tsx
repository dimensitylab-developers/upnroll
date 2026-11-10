import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageBackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-red",
        "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        className
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
