import type { Metadata } from "next";
import { RankingDemo } from "@/features/rankings/ranking-demo";

export const metadata: Metadata = { title: "Seeding demo", robots: { index: false, follow: false } };

export default function RankingDemoPage() {
  return (
    <main className="px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-2">Seeding demo</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-3xl">
          A walkthrough of the athlete seeding sheet. These eight fighters are sample names, including James Lewis, Suraj Phirke, Suketu Bhuva, and Deep Godani. Ravi Iyer and Aman Desai are the sheet’s worked example: a strong record against a shorter, hotter run.
        </p>
        <RankingDemo />
      </div>
    </main>
  );
}
