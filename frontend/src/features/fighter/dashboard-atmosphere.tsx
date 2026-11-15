/** Quiet pad under the desk — light texture only, no watermark fight with type. */
export function DashboardAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 halftone-bg opacity-[0.12]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/[0.04] to-transparent" />
    </div>
  );
}
