import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ChatbotWidget } from "@/features/chatbot/chatbot-widget";
import { cachedPublicSiteContact } from "@/lib/public-reads";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const contact = await cachedPublicSiteContact();

  return (
    <div className="min-h-screen flex flex-col halftone-bg">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter contact={contact} />
      <ChatbotWidget />
    </div>
  );
}
