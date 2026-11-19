import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooterBoundary } from "@/components/layout/site-footer-contact";
import { ChatbotWidget } from "@/features/chatbot/chatbot-widget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col halftone-bg">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooterBoundary />
      <ChatbotWidget />
    </div>
  );
}
