import type { Metadata } from "next";
import { ComingSoon } from "@/components/content/coming-soon";

export const metadata: Metadata = { title: "Seminars" };

export default function SeminarsPage() {
  return <ComingSoon />;
}
