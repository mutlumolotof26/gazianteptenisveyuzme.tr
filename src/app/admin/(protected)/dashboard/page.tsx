import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Users, Newspaper, Calendar, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  await requireAdmin();

  const [memberCount, activeMembers, pendingMembers, newsCount, eventCount, unreadMessages, recentMembers] =
    await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { durum: "aktif" } }),
      prisma.member.count({ where: { durum: "beklemede" } }),
      prisma.news.count({ where: { aktif: true } }),
      prisma.event.count({ where: { aktif: true } }),
      prisma.contact.count({ where: { okundu: false } }),
      prisma.member.findMany({ orderBy: { kayitTarihi: "desc" }, take: 5 }),
    ]);

  const stats = [
    { title: "Toplam Üye", value: memberCount, sub: `${activeMembers} aktif`, icon: Users, color: "blue", href: "/admin/uyeler" },
    { title: "Bekleyen Başvuru", value: pendingMembers, sub: "Onay bekliyor", icon: Clock, color: "amber", href: "/admin/uyeler?durum=beklemede" },
    { title: "Aktif Haber", value: newsCount, sub: "Yayında", icon: Newspaper, color: "green", href: "/admin/haberler" },
    { title: "Etkinlik", value: eventCount, sub: "Toplam", icon: Calendar, color: "purple", href: "/admin/etkinlikler" },
    { title: "Okunmamış Mesaj", value: unreadMessages, sub: "Yeni mesaj", icon: MessageSquare, color: "red", href: "/admin/mesajlar" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-[#e0f3fc] text-[#3a8fbf]",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-orange-50 text-[#e5500a]",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Kulüp yönetim paneline hoş geldiniz.</p>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-black text-gray-800">{stat.value}</div>
            <div className="text-sm font-semibold text-gray-600 mt-0.5">{stat.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* Son Üyeler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Son Üye Başvuruları</h2>
          <Link href="/admin/uyeler" className="text-sm text-[#3a8fbf] font-medium hover:underline">
            Tümünü Gör
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#e0f3fc] rounded-full flex items-center justify-center text-[#3a8fbf] font-bold text-sm">
                  {member.ad[0]}{member.soyad[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{member.ad} {member.soyad}</div>
                  <div className="text-gray-400 text-xs">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.durum === "aktif" ? "bg-orange-50 text-[#e5500a]" : member.durum === "beklemede" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                  {member.durum === "aktif" ? "Aktif" : member.durum === "beklemede" ? "Beklemede" : "Pasif"}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(member.kayitTarihi).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
