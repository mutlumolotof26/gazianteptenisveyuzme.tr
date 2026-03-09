"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  siteName = "Gaziantep Yüzme Spor Kulübü",
  siteAcik = "Tenis & Yüzme",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#1e4468] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
              <Image
                src={logoUrl}
                alt={siteName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="hidden sm:block whitespace-nowrap">
              <div className="text-white text-sm font-bold leading-tight">{siteName}</div>
              <div className="text-[#ed780e] text-xs font-semibold tracking-wide">{siteAcik}</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm rounded-md hover:bg-[#2c5580] hover:text-[#ed780e] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-[#2c5580]"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="lg:hidden py-2 border-t border-[#2c5580]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm hover:bg-[#2c5580] hover:text-[#ed780e] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
