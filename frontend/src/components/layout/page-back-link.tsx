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
        "relative mb-5 inline-flex min-h-11 w-fit max-w-full flex-row flex-nowrap items-center gap-2",
        "border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-brand-red shadow-[4px_4px_0_0_#000]",
        "rounded-sm transition-[background-color,box-shadow,transform] duration-150",
        "hover:bg-brand-red/5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        className
      )}
    >
      <NavLinkPending className="rounded-sm" />
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
