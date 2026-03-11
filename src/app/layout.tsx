import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://gazianteptenisveyuzme.tr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gaziantep Tenis ve Yüzme Kulübü",
    template: "%s | Gaziantep Tenis ve Yüzme Kulübü",
  },
  description:
    "Gaziantep Tenis ve Yüzme Kulübü - 1985'ten beri Gaziantep'in köklü spor kulübü. Olimpik yüzme havuzu, yüzme kursları, profesyonel tenis kortları ve uzman antrenörler.",
  keywords: [
    "Gaziantep yüzme",
    "Gaziantep yüzme kursu",
    "Gaziantep yüzme havuzu",
    "yüzme kursu Gaziantep",
    "Gaziantep tenis",
    "Gaziantep tenis kulübü",
    "Gaziantep spor kulübü",
    "yüzme okulu Gaziantep",
    "çocuk yüzme kursu Gaziantep",
    "olimpik havuz Gaziantep",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Gaziantep Tenis ve Yüzme Kulübü",
    title: "Gaziantep Tenis ve Yüzme Kulübü",
    description: "Gaziantep'in en köklü spor kulübü. Olimpik yüzme havuzu, yüzme kursları ve profesyonel tenis kortları.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gaziantep Tenis ve Yüzme Kulübü" }],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: "Gaziantep Tenis ve Yüzme Kulübü",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/logo.png`,
  description: "Gaziantep'in en köklü spor kulübü. Olimpik yüzme havuzu, yüzme kursları ve profesyonel tenis kortları.",
  foundingDate: "2014",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gaziantep",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    addressCountry: "TR",
    addressRegion: "Gaziantep",
  },
  sport: ["Yüzme", "Tenis"],
  hasMap: "https://maps.google.com/?q=Gaziantep+Tenis+Yüzme+Kulübü",
  sameAs: [`${siteUrl}`],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
