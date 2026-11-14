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

export function FounderCredit({ className = "" }: { className?: string }) {
  return (
    <address className={`not-italic text-xs text-muted-foreground ${className}`.trim()}>
      Founded by Suketu Bhuva
    </address>
  );
}

/** Static year: Cache Components forbids `new Date()` during prerender of static shells. */
const COPYRIGHT_YEAR = 2026;

export function SiteCopyright({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-none text-muted-foreground ${className}`.trim()}>
      © {COPYRIGHT_YEAR} Up &apos;n Roll. All rights reserved.
    </p>
  );
}

/** Centered Make in India mark for the footer bar. */
export function FooterAddress({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/make-in-india.png"
        alt="Make in India"
        width={720}
        height={405}
        className="h-11 w-auto object-contain sm:h-12"
      />
    </div>
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
