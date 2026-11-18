import { BrandWordmark } from "@/components/layout/brand";

export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-background halftone-bg"
      role="status"
      aria-live="polite"
      aria-label="Loading Up 'n Roll"
    >
      <BrandWordmark className="h-14 w-auto max-w-[16rem] object-center sm:h-16 sm:max-w-[18rem]" />
      <span className="block h-1 w-28 overflow-hidden bg-black/10">
        <span className="upnroll-loader-bar block h-full w-1/3 bg-brand-red" />
      </span>
    </div>
  );
}
