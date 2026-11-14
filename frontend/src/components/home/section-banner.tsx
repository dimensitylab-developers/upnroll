export function SectionBanner({ children }: { children: string }) {
  return (
    <h2 className="mb-6 inline-flex max-w-full items-stretch -skew-x-12 shadow-[6px_6px_0_0_#000]">
      <span className="w-4 shrink-0 bg-black" aria-hidden="true" />
      <span className="min-w-0 bg-brand-red px-3 py-2 text-display text-sm font-semibold uppercase tracking-wider text-white sm:px-4 sm:text-lg">
        <span className="inline-block max-w-full skew-x-12 break-words">{children}</span>
      </span>
      <span className="w-8 shrink-0 bg-black" aria-hidden="true" />
    </h2>
  );
}
