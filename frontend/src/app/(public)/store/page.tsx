import type { Metadata } from "next";
import { ComingSoon } from "@/components/content/coming-soon";

export const metadata: Metadata = { title: "Store" };

export default function StorePage() {
  return (
    <ComingSoon
      title="Store"
      stamp="Coming soon"
      line="The store is not open yet. Nothing is listed and nothing is for sale."
    >
      <p className="text-center text-display text-3xl font-semibold uppercase tracking-wide text-brand-red sm:text-4xl">
        Coming soon
      </p>
    </ComingSoon>
  );
}
