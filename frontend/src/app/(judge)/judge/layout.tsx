import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BrandWordmark } from "@/components/layout/brand";

export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Judge scoring · Up 'n Roll",
};

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <div className="min-h-dvh bg-background halftone-bg">
      <header className="border-b-2 border-black bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/judge" className="flex items-center gap-2 text-display text-sm font-semibold" aria-label="Scoring home">
            <BrandWordmark className="h-7 w-auto max-w-[9rem]" alt="" />
            <span>Judge</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
