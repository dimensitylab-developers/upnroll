import Image from "next/image";

export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={40}
      height={40}
      className={`object-contain ${className}`}
    />
  );
}

function IndianFlag({ className = "h-3 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 12" className={className} aria-hidden="true">
      <rect width="18" height="4" fill="#FF9933" />
      <rect y="4" width="18" height="4" fill="#FFFFFF" />
      <rect y="8" width="18" height="4" fill="#138808" />
      <circle cx="9" cy="6" r="1.45" fill="none" stroke="#000080" strokeWidth="0.45" />
    </svg>
  );
}

export function FounderCredit({ className = "" }: { className?: string }) {
  return (
    <address className={`not-italic text-xs text-muted-foreground ${className}`.trim()}>
      Founded by Suketu Bhuva
    </address>
  );
}

/** Static year — Cache Components forbids `new Date()` during prerender of static shells. */
const COPYRIGHT_YEAR = 2026;

export function SiteCopyright({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-none text-muted-foreground ${className}`.trim()}>
      © {COPYRIGHT_YEAR} D3 Spectator. All rights reserved.
    </p>
  );
}

export function FooterAddress({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center justify-center gap-2 text-sm font-semibold text-foreground ${className}`.trim()}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Address</span>
      <span className="text-display text-base font-semibold">India</span>
      <IndianFlag className="h-3.5 w-5 rounded-[1px] ring-1 ring-black/15" />
    </p>
  );
}

export function BuiltBy({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-[11px] leading-none text-muted-foreground ${className}`.trim()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/dimensity-mark.png" alt="" className="h-3 w-3 object-contain opacity-70" />
      <span>
        Built by{" "}
        <a
          href="https://dimensitylabs.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Dimensity Labs
        </a>
      </span>
    </p>
  );
}
