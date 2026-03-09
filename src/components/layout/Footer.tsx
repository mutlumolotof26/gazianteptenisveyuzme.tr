import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";

interface FooterProps {
  logoUrl?: string;
  siteName?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  calismaHafta?: string;
  calismaCumartesi?: string;
  calismaPazar?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export default function Footer({
  logoUrl = "/logo.png",
  siteName = "Gaziantep Yüzme Spor Kulübü",
  telefon = "+90 (342) 000 00 00",
  email = "info@gazitenisyuzme.com",
  adres = "Şehitkamil, Gaziantep, Türkiye",
  calismaHafta = "07:00 - 22:00",
  calismaCumartesi = "08:00 - 20:00",
  calismaPazar = "09:00 - 18:00",
  instagramUrl = "",
  facebookUrl = "",
}: FooterProps) {
  return (
    <footer className="bg-[#0d1e2e] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kulüp Bilgisi */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={logoUrl}
                alt={siteName}
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
              <div>
                <div className="text-white font-bold text-sm">{siteName}</div>
                <div className="text-[#ed780e] text-xs">Spor Kulübü</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              1985 yılından bu yana Gaziantep'in spor alanında öncü kulübü olarak hizmet vermekteyiz.
            </p>
            {(instagramUrl || facebookUrl) && (
              <div className="flex items-center gap-3">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#1e4468] rounded-lg flex items-center justify-center hover:bg-[#ed780e] transition-colors">
                    <Instagram size={14} />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 bg-[#1e4468] rounded-lg flex items-center justify-center hover:bg-[#ed780e] transition-colors">
                    <Facebook size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hızlı Bağlantılar */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/tenis", label: "Tenis" },
                { href: "/yuzme", label: "Yüzme" },
                { href: "/uyelik", label: "Üyelik" },
                { href: "/haberler", label: "Haberler" },
                { href: "/galeri", label: "Galeri" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#ed780e] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-white font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#ed780e] mt-0.5 shrink-0" />
                <span>{adres}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#ed780e] shrink-0" />
                <span>{telefon}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#ed780e] shrink-0" />
                <span>{email}</span>
              </li>
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div>
            <h3 className="text-white font-semibold mb-4">Çalışma Saatleri</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Clock size={16} className="text-[#ed780e] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div><span className="text-gray-400">Hafta içi:</span> {calismaHafta}</div>
                  <div><span className="text-gray-400">Cumartesi:</span> {calismaCumartesi}</div>
                  <div><span className="text-gray-400">Pazar:</span> {calismaPazar}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e4468] mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
