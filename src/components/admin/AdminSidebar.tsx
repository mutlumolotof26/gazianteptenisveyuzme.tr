"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Newspaper, Calendar, Images, MessageSquare, LogOut, Menu, X, Settings, UserCheck, Waves, MessagesSquare, Sun, Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/admin/ThemeProvider";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/uyeler", icon: Users, label: "Üyeler", badgeKey: "uyeler" },
  { href: "/admin/antrenorler", icon: UserCheck, label: "Antrenörler" },
  { href: "/admin/seanslar", icon: Waves, label: "Seanslar" },
  { href: "/admin/haberler", icon: Newspaper, label: "Haberler" },
  { href: "/admin/etkinlikler", icon: Calendar, label: "Etkinlikler" },
  { href: "/admin/galeri", icon: Images, label: "Galeri" },
  { href: "/admin/konusmalar", icon: MessagesSquare, label: "Bot Konuşmaları", badgeKey: "konusmalar" },
  { href: "/admin/mesajlar", icon: MessageSquare, label: "Mesajlar" },
  { href: "/admin/ayarlar", icon: Settings, label: "Site Ayarları" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badges, setBadges] = useState<{ konusmalar: number; uyeler: number }>({ konusmalar: 0, uyeler: 0 });
  const { dark, toggle } = useTheme();

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const d = await res.json();
        setBadges({
          konusmalar: d.yeniKonusma || 0,
          uyeler: (d.onKayit || 0) + (d.aranacak || 0),
        });
      } catch {}
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={44}
            height={44}
            className="rounded-full bg-white p-0.5 object-contain"
          />
          <div>
            <div className="text-white font-bold text-sm leading-tight">Admin Paneli</div>
            <div className="text-[#e5500a] text-xs">GTY Spor Kulübü</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, badgeKey }) => {
          const active = pathname === href;
          const count = badgeKey ? badges[badgeKey as keyof typeof badges] : 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-[#e5500a] text-white" : "text-[#8fd0f0] hover:bg-[#1d3a5c] hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dark Mode Toggle + Logout */}
      <div className="p-4 border-t border-blue-800 space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#8fd0f0] hover:bg-[#1d3a5c] hover:text-white transition-colors w-full"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? "Açık Mod" : "Koyu Mod"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors w-full"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-[#0f1f30] flex-col h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1d3a5c] text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0f1f30] flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white">
              <X size={20} />
            </button>
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
