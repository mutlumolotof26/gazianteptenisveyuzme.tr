"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Newspaper, Calendar, Images, MessageSquare, LogOut, Menu, X, Settings, UserCheck, Waves,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/uyeler", icon: Users, label: "Üyeler" },
  { href: "/admin/antrenorler", icon: UserCheck, label: "Antrenörler" },
  { href: "/admin/seanslar", icon: Waves, label: "Seanslar" },
  { href: "/admin/haberler", icon: Newspaper, label: "Haberler" },
  { href: "/admin/etkinlikler", icon: Calendar, label: "Etkinlikler" },
  { href: "/admin/galeri", icon: Images, label: "Galeri" },
  { href: "/admin/mesajlar", icon: MessageSquare, label: "Mesajlar" },
  { href: "/admin/ayarlar", icon: Settings, label: "Site Ayarları" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <div className="text-[#ed780e] text-xs">GTY Spor Kulübü</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-[#ed780e] text-white" : "text-blue-200 hover:bg-[#1e4468] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-800">
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
      <div className="hidden lg:flex w-64 bg-[#0d1e2e] flex-col h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1e4468] text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0d1e2e] flex flex-col">
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
