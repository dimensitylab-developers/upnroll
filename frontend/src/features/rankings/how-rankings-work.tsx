"use client";

import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STEPS = [
  {
    title: "Enter",
    body: "Once your registration is confirmed, you appear in your division.",
  },
  {
    title: "Compete",
    body: "Every match earns ranking points, and wins count the most.",
  },
  {
    title: "Rank",
    body: "Until a match in your division is decided, entries show a dot and 00 points. After that, ranks 1, 2, 3 follow the points.",
  },
  {
    title: "Superfight",
    body: "The top performers earn a place in the superfight. Eligibility is based on wins and top rankings within the same division.",
  },
];

/** Short pop-up explainer for the rankings board. */
export function HowRankingsWork() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000]"
        >
          <CircleHelp className="size-4 text-brand-red" aria-hidden="true" />
          How rankings work
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-none border-2 border-black bg-white p-0 shadow-[8px_8px_0_0_#c8102e] [&>button]:text-white [&>button]:opacity-100">
        <DialogHeader className="border-b-2 border-black bg-black px-6 py-4 text-left text-white">
          <DialogTitle className="text-display text-2xl font-semibold uppercase tracking-wide">
            How rankings work
          </DialogTitle>
          <DialogDescription className="text-sm text-white/75">
            The board fills in by itself. Here is the short version.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-4 px-6 py-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="text-display flex size-8 shrink-0 items-center justify-center bg-brand-red text-lg font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-display text-lg font-semibold uppercase leading-none tracking-wide">
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="border-t-2 border-black bg-[#f3efe8] px-6 py-3 text-xs leading-relaxed text-black/70">
          Changing divisions starts a new ranking: earlier results do not carry over.
        </p>

        <div className="flex justify-end border-t-2 border-black px-6 py-4">
          <DialogClose asChild>
            <button
              type="button"
              className="border-2 border-black bg-brand-red px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[3px_3px_0_0_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_#000]"
            >
              Got it
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
