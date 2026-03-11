import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gaziantep Tenis ve Yüzme Kulübü",
    template: "%s | Gaziantep Tenis ve Yüzme Kulübü",
  },
  description:
    "Gaziantep Tenis ve Yüzme Kulübü - 1985'ten beri Gaziantep'in köklü spor kulübü. Profesyonel tenis kortları, olimpik yüzme havuzu, uzman antrenörler.",
  keywords: [
    "Gaziantep tenis kulübü",
    "Gaziantep yüzme kulübü",
    "tenis antrenman Gaziantep",
    "yüzme kursu Gaziantep",
    "spor kulübü Gaziantep",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Gaziantep Tenis ve Yüzme Kulübü",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
