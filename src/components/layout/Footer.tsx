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
  siteName = "Gaziantep Tenis ve Yüzme Spor Kulübü",
  telefon = "0551 245 82 74",
  email = "gazianteptenisveyuzmegsk@gmail.com",
  adres = "Batıkent, Muhsin Yazıcıoğlu Cd. No:18, 27560 Şehitkamil/Gaziantep",
  calismaHafta = "07:00 - 22:00",
  calismaCumartesi = "08:00 - 20:00",
  calismaPazar = "09:00 - 18:00",
  instagramUrl = "",
  facebookUrl = "",
}: FooterProps) {
  return (
    <footer style={{ background: "var(--navy-dark)", color: "rgba(255,255,255,.75)", borderTop: "4px solid var(--orange)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marka */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 p-1"
                style={{ borderColor: "rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)" }}>
                <Image src={logoUrl} alt={siteName} width={64} height={64} className="w-full h-full object-contain" unoptimized />
              </div>
              <div>
                <div className="font-black text-white text-sm leading-tight" style={{ fontFamily: "Montserrat,sans-serif" }}>
                  {siteName}
                </div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--orange)" }}>Spor Kulübü</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,.45)" }}>
              Gaziantep&apos;in köklü spor kulübü olarak olimpik yüzme havuzu ve profesyonel tenis kortlarıyla hizmetinizdeyiz.
            </p>
            {(instagramUrl || facebookUrl) && (
              <div className="flex gap-2 mt-1">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,.07)" }}>
                    <Instagram size={16} color="rgba(255,255,255,.7)" />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,.07)" }}>
                    <Facebook size={16} color="rgba(255,255,255,.7)" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm" style={{ fontFamily: "Montserrat,sans-serif" }}>Hızlı Linkler</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/tenis", label: "Tenis" },
                { href: "/yuzme", label: "Yüzme" },
                { href: "/uyelik", label: "Üyelik" },
                { href: "/haberler", label: "Haberler" },
                { href: "/galeri", label: "Galeri" },
                { href: "/iletisim", label: "İletişim" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm" style={{ color: "rgba(255,255,255,.45)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm" style={{ fontFamily: "Montserrat,sans-serif" }}>İletişim</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,.6)" }}>
                <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: "var(--orange)" }} />
                <span>{adres}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,.6)" }}>
                <Phone size={15} className="shrink-0" style={{ color: "var(--orange)" }} />
                <span>{telefon}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,.6)" }}>
                <Mail size={15} className="shrink-0" style={{ color: "var(--orange)" }} />
                <span>{email}</span>
              </li>
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm" style={{ fontFamily: "Montserrat,sans-serif" }}>Çalışma Saatleri</h4>
            <ul className="flex flex-col gap-2.5 text-sm" style={{ color: "rgba(255,255,255,.6)" }}>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="mt-0.5 shrink-0" style={{ color: "var(--orange)" }} />
                <div className="flex flex-col gap-1">
                  <span><span style={{ color: "rgba(255,255,255,.35)" }}>Hf. içi:</span> {calismaHafta}</span>
                  <span><span style={{ color: "rgba(255,255,255,.35)" }}>Cumartesi:</span> {calismaCumartesi}</span>
                  <span><span style={{ color: "rgba(255,255,255,.35)" }}>Pazar:</span> {calismaPazar}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.25)" }}>
          © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır. · gazianteptenisveyuzme.tr
        </div>
      </div>
    </footer>
  );
}
