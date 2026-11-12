import { cn } from "@/lib/utils";

/** Intentional horizontal scroll with a visible cue for narrow viewports. */
export function ScrollRegion({
  children,
  className,
  label = "Swipe sideways for more",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <p className="copy-slab mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:hidden">
        {label}
      </p>
      <div className="overflow-x-auto overscroll-x-contain border-2 border-black bg-white pb-2 shadow-[4px_4px_0_0_#000] [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-y-8 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden"
        aria-hidden="true"
      />
    </div>
  );
}
