import type { Metadata } from "next";
import { ComingSoon } from "@/components/content/coming-soon";

export const metadata: Metadata = { title: "Store" };

const RACK = [
  { name: "Tee", ink: "#111" },
  { name: "Rashguard", ink: "#c1121f" },
  { name: "Shorts", ink: "#111" },
];

function Tee({ ink }: { ink: string }) {
  return (
    <svg viewBox="0 0 120 130" className="mx-auto h-36 w-auto" aria-hidden="true">
      <path
        d="M38 18 18 32 8 58l18 8 6-14v62h56V52l6 14 18-8-10-26-20-14-8 10c-6 6-16 6-22 0z"
        fill={ink}
      />
      <path d="M48 28c4 8 20 8 24 0" fill="none" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

export default function StorePage() {
  return (
    <ComingSoon
      title="Store"
      stamp="No cart"
      line="Manga grappling shirts are the idea. There is nothing on the rack, nothing to buy, and no price."
    >
      <p className="manga-speech-bubble manga-speech-bubble-right ml-auto max-w-md text-base">Opening when the first drop is real.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {RACK.map((item) => (
          <li key={item.name} className="border-2 border-black bg-[#f7f6f4] px-4 py-6 text-center shadow-[6px_6px_0_0_#000]">
            <Tee ink={item.ink} />
            <p className="text-display mt-2 text-2xl font-semibold">{item.name}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Soon</p>
          </li>
        ))}
      </ul>
    </ComingSoon>
  );
}
