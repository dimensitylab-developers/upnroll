export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-background halftone-bg"
      role="status"
      aria-live="polite"
      aria-label="Loading Up 'n Roll"
    >
      <img src="/logo-mark.png" alt="" className="h-14 w-14 object-contain" />
      <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-12 w-auto" />
      <span className="block h-1 w-28 overflow-hidden bg-black/10">
        <span className="upnroll-loader-bar block h-full w-1/3 bg-brand-red" />
      </span>
    </div>
  );
}
