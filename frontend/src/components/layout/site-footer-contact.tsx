import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { cachedPublicSiteContact } from "@/lib/public-reads";

async function SiteFooterWithContact() {
  const contact = await cachedPublicSiteContact();
  return <SiteFooter contact={contact} />;
}

/** Isolate site-settings IO so a slow/cached contact read cannot poison the public shell. */
export function SiteFooterBoundary() {
  return (
    <Suspense fallback={<SiteFooter />}>
      <SiteFooterWithContact />
    </Suspense>
  );
}
