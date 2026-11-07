import type { ReactNode } from "react";

type FunkyHeadlineId =
  | "built-for-grapplers"
  | "brazilian-jiu-jitsu-platform"
  | "real-fights-real-pay-real-rankings";

const SRC: Record<FunkyHeadlineId, { black: string; white: string; alt: string }> = {
  "built-for-grapplers": {
    black: "/headlines/built-for-grapplers.png",
    white: "/headlines/built-for-grapplers-white.png",
    alt: "Built For Grapplers",
  },
  "brazilian-jiu-jitsu-platform": {
    black: "/headlines/brazilian-jiu-jitsu-platform.png",
    white: "/headlines/brazilian-jiu-jitsu-platform-white.png",
    alt: "Brazilian Jiu Jitsu Platform",
  },
  "real-fights-real-pay-real-rankings": {
    black: "/headlines/real-fights-real-pay-real-rankings.png",
    white: "/headlines/real-fights-real-pay-real-rankings-white.png",
    alt: "Real Fights. Real Pay. Real Rankings",
  },
};

/** Hand-lettered marker headlines from the provided font-style references. */
export function FunkyHeadline({
  id,
  tone = "black",
  className = "",
  trailing,
}: {
  id: FunkyHeadlineId;
  tone?: "black" | "white";
  className?: string;
  trailing?: ReactNode;
}) {
  const asset = SRC[id];
  return (
    <span className={`inline-flex max-w-full items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tone === "white" ? asset.white : asset.black}
        alt={asset.alt}
        className="h-auto w-full max-w-full object-contain object-left"
      />
      {trailing}
    </span>
  );
}
