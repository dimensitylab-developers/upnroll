import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { PreviewNav } from "@/components/preview/preview-nav";
import { BrandAndTokens } from "@/components/preview/sections/brand-and-tokens";
import { Typography } from "@/components/preview/sections/typography";
import { ButtonsControls } from "@/components/preview/sections/buttons-controls";
import { NavigationSystems } from "@/components/preview/sections/navigation-systems";
import { PublicPreviews } from "@/components/preview/sections/public-previews";
import { FighterDirectory } from "@/components/preview/sections/fighter-directory";
import { FighterProfile } from "@/components/preview/sections/fighter-profile";
import { RegistrationFlow } from "@/components/preview/sections/registration-flow";
import { PaymentFlow } from "@/components/preview/sections/payment-flow";
import { FighterDashboard } from "@/components/preview/sections/fighter-dashboard";
import { Brackets } from "@/components/preview/sections/brackets";
import { MatchDetails } from "@/components/preview/sections/match-details";
import { Rankings } from "@/components/preview/sections/rankings";
import { AdminDashboard } from "@/components/preview/sections/admin-dashboard";
import { PaymentVerification } from "@/components/preview/sections/payment-verification";
import { RequestsAndTransfers } from "@/components/preview/sections/requests-and-transfers";
import { Notifications } from "@/components/preview/sections/notifications";
import { Chatbot } from "@/components/preview/sections/chatbot";
import { MotionFeedback } from "@/components/preview/sections/motion-feedback";
import { ResponsiveBehavior } from "@/components/preview/sections/responsive-behavior";

export const metadata: Metadata = {
  title: { absolute: "Up 'n Roll — UI Preview Showroom" },
  robots: { index: false, follow: false },
};

// `next build`/`next start` always set NODE_ENV=production, including for a
// staging/review deployment — so NODE_ENV alone can't distinguish "public
// production" from "authorized review." Gate on an explicit opt-in instead.
// connection() keeps that check on the request, so a production build does not
// bake in a permanent 404.

export default async function UiPreviewPage() {
  await connection();
  // Part P: restrict the design showroom once the real site launches.
  // Enabled in local dev by default; any other environment (including a
  // review/staging deployment) must explicitly opt in via UI_PREVIEW_ENABLED.
  const isDev = process.env.NODE_ENV !== "production";
  const explicitlyEnabled = process.env.UI_PREVIEW_ENABLED === "true";
  if (!isDev && !explicitlyEnabled) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PreviewNav />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <header className="mb-4 pb-8 border-b border-black/10">
            <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-2">Phase 1 deliverable</p>
            <h1 className="text-display text-4xl sm:text-5xl font-semibold">/ui-preview</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Interactive design showroom for Up &apos;n Roll — the combat sports tournament platform.
              Every data point on this page is a clearly-labeled fictional fixture. No production
              database, authentication, or payment processing exists behind this route.
            </p>
          </header>

          <BrandAndTokens />
          <Typography />
          <ButtonsControls />
          <NavigationSystems />
          <PublicPreviews />
          <FighterDirectory />
          <FighterProfile />
          <RegistrationFlow />
          <PaymentFlow />
          <FighterDashboard />
          <Brackets />
          <MatchDetails />
          <Rankings />
          <AdminDashboard />
          <PaymentVerification />
          <RequestsAndTransfers />
          <Notifications />
          <Chatbot />
          <MotionFeedback />
          <ResponsiveBehavior />

          <footer className="pt-10 pb-20 text-xs text-muted-foreground">
            Up &apos;n Roll — DimensityLabs. UI preview build, not for public indexing.
          </footer>
        </div>
      </main>
    </div>
  );
}
