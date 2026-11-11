import type { Metadata, Viewport } from "next";
import { Inter, Oswald, Permanent_Marker } from "next/font/google";
import Providers from "@/components/Providers";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
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

/** Fallback marker face for CSS text when lettered headline art is not used. */
const funky = Permanent_Marker({
  variable: "--font-funky-face",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = getSiteUrl();
const title = "Up 'n Roll";
const description =
  "Up 'n Roll is a combat sports tournament platform founded by Suketu Bhuva in India. Register for a division, track your record, and follow every bracket.";
const keywords = [
  "Up 'n Roll",
  "Up n Roll",
  "No-Gi",
  "grappling",
  "BJJ",
  "MMA",
  "tournament",
  "India",
  "brackets",
  "rankings",
  "Suketu Bhuva",
];

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Up 'n Roll",
  },
  description,
  applicationName: "Up 'n Roll",
  keywords,
  authors: [{ name: "Suketu Bhuva" }, { name: "Dimensity Labs" }],
  creator: "Up 'n Roll",
  publisher: "Up 'n Roll",
  category: "sports",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/seo/icon.png" }],
    shortcut: ["/logo-mark.png"],
  },
  manifest: "/seo/site.webmanifest",
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Up 'n Roll",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/seo/og-default.jpg",
        width: 1280,
        height: 720,
        alt: "Up 'n Roll. Real fights. Real pay. Real rankings.",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: "/seo/twitter-card.jpg",
        width: 1280,
        height: 720,
        alt: "Up 'n Roll. Real fights. Real pay. Real rankings.",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Up 'n Roll",
  url: siteUrl,
  logo: absoluteUrl("/logo-mark.png"),
  image: absoluteUrl("/seo/og-default.jpg"),
  description,
  founder: {
    "@type": "Person",
    name: "Suketu Bhuva",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  sameAs: ["https://www.instagram.com/up.n.roll/"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Up 'n Roll",
  url: siteUrl,
  description,
  inLanguage: "en-IN",
  publisher: {
    "@type": "Organization",
    name: "Up 'n Roll",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${oswald.variable} ${funky.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
