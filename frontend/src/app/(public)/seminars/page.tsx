import type { Metadata } from "next";
import { ComingSoon } from "@/components/content/coming-soon";

export const metadata: Metadata = { title: "Seminars" };

const SLOTS = [
  { label: "Date", value: "Open" },
  { label: "Mat", value: "Open" },
  { label: "Coach", value: "Open" },
];

export default function SeminarsPage() {
  return (
    <ComingSoon
      title="Seminars"
      stamp="Not yet"
      line="A seminar is a class on the mat: a date, a coach, and a room. None of that is on the calendar."
    >
      <p className="manga-speech-bubble max-w-md text-base">The next class has not been called.</p>
      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {SLOTS.map((slot, index) => (
          <li
            key={slot.label}
            className="border-2 border-black bg-white px-4 py-5 shadow-[6px_6px_0_0_#000]"
            style={{ transform: `rotate(${index === 1 ? "1.5deg" : index === 2 ? "-1.5deg" : "-0.5deg"})` }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">0{index + 1}</p>
            <p className="text-display mt-3 text-2xl font-semibold">{slot.label}</p>
            <p className="mt-4 border-t-2 border-dashed border-black pt-3 text-sm">{slot.value}</p>
          </li>
        ))}
      </ol>
    </ComingSoon>
  );
}
