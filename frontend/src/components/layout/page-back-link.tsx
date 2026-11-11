import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLinkPending } from "./nav-link-pending";

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
      prefetch
      className={cn(
        "copy-slab relative mb-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-red",
        "rounded-sm transition-opacity duration-150 active:opacity-70",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        className
      )}
    >
      <NavLinkPending className="rounded-sm" />
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
