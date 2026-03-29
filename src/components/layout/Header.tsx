"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
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
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0f1f30]/97 backdrop-blur-md shadow-2xl border-b border-[#5aaddc]/10" : "bg-transparent"
    }`} style={{ padding: scrolled ? "10px 0" : "14px 0" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-7">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline group">
          <div className={`rounded-full overflow-hidden shrink-0 border-2 border-white/20 bg-white/8 p-0.5 shadow-md transition-all duration-300 group-hover:border-[#e5500a]/50 ${scrolled ? "w-11 h-11" : "w-14 h-14"}`}>
            <Image src={logoUrl} alt={siteName} width={56} height={56} className="w-full h-full object-cover" priority unoptimized />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-white tracking-widest" style={{ fontFamily: "Montserrat,sans-serif", fontSize: ".88rem" }}>
              GAZİANTEP
            </span>
            <span className="font-semibold" style={{ fontSize: ".68rem", color: "var(--blue-light)" }}>
              {siteAcik}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 rounded-lg transition-all duration-200 font-semibold text-sm"
                style={{
                  fontFamily: "Montserrat,sans-serif",
                  color: isActive ? "#fff" : "rgba(255,255,255,.8)",
                  background: isActive ? "rgba(229,80,10,.18)" : "transparent",
                }}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-3/5 rounded-full" style={{ background: "var(--orange)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/uyelik"
          className="hidden lg:inline-block shrink-0 font-bold text-sm text-white rounded-full border-2 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            fontFamily: "Montserrat,sans-serif",
            padding: "10px 22px",
            background: "var(--orange)",
            borderColor: "var(--orange)",
            boxShadow: "0 4px 16px rgba(229,80,10,.35)",
          }}
        >
          Üye Ol
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden ml-auto p-1 text-white"
          aria-label="Menü"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{ background: "rgba(15,31,48,.98)", backdropFilter: "blur(16px)" }}>
        <nav className="flex flex-col gap-1 px-6 py-3 pb-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className="px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  fontFamily: "Montserrat,sans-serif",
                  color: isActive ? "var(--orange)" : "rgba(255,255,255,.82)",
                  background: isActive ? "rgba(229,80,10,.1)" : "transparent",
                }}>
                {link.label}
              </Link>
            );
          })}
          <Link href="/uyelik"
            className="mt-2 py-3 rounded-full text-center font-bold text-sm text-white"
            style={{ fontFamily: "Montserrat,sans-serif", background: "var(--orange)" }}>
            Üye Ol
          </Link>
        </nav>
      </div>
    </header>
  );
}
