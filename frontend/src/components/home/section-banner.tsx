export function SectionBanner({ children }: { children: string }) {
  return (
    <h2 className="inline-flex items-stretch -skew-x-12 shadow-[6px_6px_0_0_#000] mb-6">
      <span className="w-4 bg-black" aria-hidden="true" />
      <span className="bg-brand-red text-white text-display uppercase tracking-wider font-semibold px-4 py-2 text-sm sm:text-lg">
        <span className="inline-block skew-x-12">{children}</span>
      </span>
      <span className="w-8 bg-black" aria-hidden="true" />
    </h2>
  );
}
