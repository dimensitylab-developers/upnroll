import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import Providers from "@/components/Providers";
import { NavigationLoader } from "@/components/layout/navigation-loader";
import { ChatbotWidget } from "@/features/chatbot/chatbot-widget";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const description =
  "Up 'n Roll is a combat sports tournament platform founded by Suketu Bhuva in India. Register for a division, track your record, and follow every bracket.";

export const metadata: Metadata = {
  title: {
    default: "Up 'n Roll",
    template: "%s · Up 'n Roll",
  },
  description,
  icons: {
    icon: "/logo-mark.png",
  },
  openGraph: {
    title: "Up 'n Roll",
    description,
    siteName: "Up 'n Roll",
    locale: "en_IN",
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Up 'n Roll",
  description,
  founder: {
    "@type": "Person",
    name: "Suketu Bhuva",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${oswald.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
        <NavigationLoader />
        <ChatbotWidget />
      </body>
    </html>
  );
}
