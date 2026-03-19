import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://gazianteptenisveyuzme.tr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gaziantep Yüzme Kursu ve Tenis Kulübü | GTY Spor Kulübü",
    template: "%s | GTY Gaziantep Tenis ve Yüzme Spor Kulübü",
  },
  description:
    "Gaziantep yüzme kursu ve tenis eğitimi. Olimpik yüzme havuzu, çocuk ve yetişkin yüzme kursları, profesyonel tenis kortları. GTY Spor Kulübü - Şehitkamil, Gaziantep.",
  keywords: [
    "Gaziantep yüzme kursu",
    "Gaziantep yüzme",
    "Gaziantep yüzme havuzu",
    "yüzme kursu Gaziantep",
    "çocuk yüzme kursu Gaziantep",
    "bebek yüzme Gaziantep",
    "yetişkin yüzme kursu Gaziantep",
    "olimpik havuz Gaziantep",
    "yüzme okulu Gaziantep",
    "Gaziantep tenis kursu",
    "Gaziantep tenis kulübü",
    "Gaziantep spor kulübü",
    "Şehitkamil yüzme kursu",
    "GTY spor kulübü",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "GTY Gaziantep Tenis ve Yüzme Spor Kulübü",
    title: "Gaziantep Yüzme Kursu ve Tenis Kulübü | GTY Spor Kulübü",
    description: "Gaziantep'in yüzme kursu ve tenis merkezi. Olimpik havuz, uzman antrenörler, çocuk ve yetişkin programları.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "GTY Gaziantep Tenis ve Yüzme Spor Kulübü" }],
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
  name: "GTY Gaziantep Tenis ve Yüzme Spor Kulübü",
  alternateName: "Gaziantep Yüzme Kursu",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/logo.png`,
  description: "Gaziantep yüzme kursu ve tenis eğitimi. Olimpik yüzme havuzu, çocuk ve yetişkin yüzme kursları, profesyonel tenis kortları.",
  foundingDate: "2014",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Batıkent, Muhsin Yazıcıoğlu Cd. No:18",
    addressLocality: "Şehitkamil",
    addressRegion: "Gaziantep",
    postalCode: "27560",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    addressCountry: "TR",
    addressRegion: "Gaziantep",
  },
  telephone: "+905512458274",
  email: "gazianteptenisveyuzmegsk@gmail.com",
  sport: ["Yüzme", "Tenis"],
  hasMap: "https://maps.google.com/?q=Batıkent+Muhsin+Yazıcıoğlu+Cd+No+18+Şehitkamil+Gaziantep",
  sameAs: [
    `${siteUrl}`,
    "https://www.instagram.com/gazianteptenisyuzmegsk",
  ],
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Olimpik Yüzme Havuzu", value: true },
    { "@type": "LocationFeatureSpecification", name: "Tenis Kortu", value: true },
    { "@type": "LocationFeatureSpecification", name: "Çocuk Yüzme Kursu", value: true },
    { "@type": "LocationFeatureSpecification", name: "Yetişkin Yüzme Kursu", value: true },
  ],
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
