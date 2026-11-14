import type { Metadata } from "next";
import { ComingSoon } from "@/components/content/coming-soon";

export const metadata: Metadata = { title: "Store" };

export default function StorePage() {
  return <ComingSoon />;
}
