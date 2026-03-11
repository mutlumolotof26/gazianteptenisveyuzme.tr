"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/tenis", label: "Tenis" },
  { href: "/yuzme", label: "Yüzme" },
  { href: "/uyelik", label: "Üyelik" },
  { href: "/haberler", label: "Haberler" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/galeri", label: "Galeri" },
  { href: "/iletisim", label: "İletişim" },
];

interface HeaderProps {
  logoUrl?: string;
  siteName?: string;
  siteAcik?: string;
}

export default function Header({
  logoUrl = "/logo.png",
  siteName = "Gaziantep Tenis ve Yüzme Spor Kulübü",
  siteAcik = "Tenis & Yüzme",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#152f47]/95 backdrop-blur-md shadow-2xl"
          : "bg-[#1e4468] shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-24"}`}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`rounded-full overflow-hidden shrink-0 border-2 border-white/20 transition-all duration-300 group-hover:border-[#ed780e]/60 ${scrolled ? "w-10 h-10" : "w-16 h-16"}`}>
              <Image
                src={logoUrl}
                alt={siteName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="hidden sm:block">
              <div className={`text-white font-bold leading-tight tracking-tight transition-all duration-300 ${scrolled ? "text-sm" : "text-base"}`}>
                {siteName}
              </div>
              <div className="text-[#ed780e] text-xs font-semibold tracking-widest uppercase mt-0.5">
                {siteAcik}
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-medium tracking-wide rounded-md transition-all duration-200 group ${
                    isActive
                      ? "text-[#ed780e]"
                      : "text-white/85 hover:text-white"
                  }`}
                >
                  {link.label}
                  {/* Animated underline */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#ed780e] rounded-full transition-all duration-300 ${
                      isActive ? "w-4/5" : "w-0 group-hover:w-3/5"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menü"
          >
            <div className={`transition-transform duration-300 ${menuOpen ? "rotate-90" : "rotate-0"}`}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </div>
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="py-3 border-t border-white/10 space-y-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#ed780e]/15 text-[#ed780e]"
                      : "text-white/80 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {isActive && <span className="w-1 h-1 rounded-full bg-[#ed780e]" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pb-3" />
        </div>
      </div>
    </header>
  );
}
