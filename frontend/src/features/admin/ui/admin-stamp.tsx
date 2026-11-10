import { cn } from "@/lib/utils";

export function AdminStamp({
  children,
  tone = "red",
  className,
}: {
  children: string;
  tone?: "red" | "black" | "white";
  className?: string;
}) {
  const tones = {
    red: "bg-brand-red text-white shadow-[4px_4px_0_0_#000]",
    black: "bg-black text-white shadow-[4px_4px_0_0_#c8102e]",
    white: "bg-white text-black border-2 border-black shadow-[4px_4px_0_0_#000]",
  } as const;

  return (
    <p className={cn("mb-4 inline-flex -skew-x-12 items-stretch", className)}>
      <span className="w-2.5 bg-black" aria-hidden="true" />
      <span className={cn("px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]", tones[tone])}>
        <span className="inline-block skew-x-12">{children}</span>
      </span>
    </p>
  );
}
