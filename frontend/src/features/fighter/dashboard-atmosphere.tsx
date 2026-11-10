type DashboardAtmosphereProps = {
  name: string;
};

/** Quiet mat texture — keeps the desk grounded without competing with content. */
export function DashboardAtmosphere({ name }: DashboardAtmosphereProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 halftone-bg opacity-[0.28]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-black/[0.03] to-transparent" />
      <p className="absolute -right-4 top-24 max-w-[50%] truncate text-display text-[clamp(4rem,18vw,9rem)] font-semibold leading-none text-black/[0.035]">
        {name}
      </p>
    </div>
  );
}
