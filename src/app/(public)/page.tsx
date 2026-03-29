import Link from "next/link";
import { Trophy, Waves, Users, Calendar, Star, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getLatestNews() {
  return prisma.news.findMany({
    where: { aktif: true },
    orderBy: { yayinTarihi: "desc" },
    take: 3,
  });
}

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { aktif: true, tarih: { gte: new Date() } },
    orderBy: { tarih: "asc" },
    take: 3,
  });
}

async function getStats() {
  const [members, coaches, events] = await Promise.all([
    prisma.member.count({ where: { durum: "aktif" } }),
    prisma.coach.count({ where: { aktif: true } }),
    prisma.event.count({ where: { aktif: true } }),
  ]);
  return { members, coaches, events };
}

export default async function HomePage() {
  const [news, events, stats] = await Promise.all([
    getLatestNews(),
    getUpcomingEvents(),
    getStats(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0f1f30] via-[#1d3a5c] to-[#0f1f30] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#e5500a] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#3a8fbf] blur-3xl" />
        </div>
        {/* Kabarcıklar */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bubble" /><div className="bubble" /><div className="bubble" />
          <div className="bubble" /><div className="bubble" /><div className="bubble" />
          <div className="bubble" /><div className="bubble" /><div className="bubble" />
          <div className="bubble" /><div className="bubble" /><div className="bubble" />
          <div className="bubble" /><div className="bubble" /><div className="bubble" />
          <div className="bubble" /><div className="bubble" /><div className="bubble" />
          <div className="bubble" /><div className="bubble" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#e5500a] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Star size={14} fill="currentColor" />
              Gaziantep'in Köklü Spor Kulübü
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Gaziantep Tenis ve{" "}
              <span className="text-[#e5500a]">Yüzme Kulübü</span>
            </h1>
            <p className="text-lg md:text-xl text-[#8fd0f0] mb-8 leading-relaxed">
              2014'ten bu yana profesyonel tenis ve yüzme eğitimi sunuyoruz.
              Uzman antrenörlerimiz ve modern tesislerimizle spor kariyerinizi şekillendirin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/uyelik"
                className="bg-[#e5500a] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#ff6b2b] transition-colors"
              >
                Kayıt Ol
              </Link>
              <Link
                href="/hakkimizda"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-[#1d3a5c] transition-colors"
              >
                Daha Fazla
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#e5500a] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2014", label: "Kuruluş Yılı" },
              { value: `${stats.members}+`, label: "Aktif Üye" },
              { value: `${stats.coaches}`, label: "Uzman Antrenör" },
              { value: `${stats.events}+`, label: "Etkinlik" },
            ].map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-sm font-semibold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hizmetler */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1d3a5c] mb-3">Hizmetlerimiz</h2>
            <p className="text-gray-500 text-lg">Profesyonel spor eğitimi ve modern tesisler</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Yüzme Kartı */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-[#1d3a5c] to-[#3a8fbf] p-8 text-white">
                <Waves size={48} className="mb-4" />
                <h3 className="text-2xl font-bold mb-2">Yüzme</h3>
                <p className="text-[#8fd0f0]">Olimpik standartlarda yüzme havuzu ve eğitim</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600 mb-6">
                  {["50m olimpik yüzme havuzu", "Çocuk ve yetişkin kursları", "Yüzme okulu programı", "Profesyonel antrenörler"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#3a8fbf] rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/yuzme" className="flex items-center gap-1 text-[#1d3a5c] font-semibold hover:gap-2 transition-all">
                  Detaylı Bilgi <ChevronRight size={18} />
                </Link>
              </div>
            </div>

            {/* Tenis Kartı */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-[#e5500a] to-[#c44208] p-8 text-white">
                <Trophy size={48} className="mb-4" />
                <h3 className="text-2xl font-bold mb-2">Tenis</h3>
                <p className="text-orange-100">Profesyonel tenis kortları ve uzman antrenörler</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 text-gray-600 mb-6">
                  {["6 adet profesyonel tenis kortu", "Bireysel ve grup dersleri", "Tüm yaş grupları için program", "Turnuva organizasyonları"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#e5500a] rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/tenis" className="flex items-center gap-1 text-[#e5500a] font-semibold hover:gap-2 transition-all">
                  Detaylı Bilgi <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Son Haberler */}
      {news.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#1d3a5c] mb-1">Son Haberler</h2>
                <p className="text-gray-500">Kulübümüzden güncel haberler</p>
              </div>
              <Link href="/haberler" className="text-[#3a8fbf] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Tümü <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                  {item.resimUrl && (
                    <img src={item.resimUrl} alt={item.baslik} className="w-full h-48 object-cover" />
                  )}
                  {!item.resimUrl && (
                    <div className="w-full h-48 bg-gradient-to-br from-[#e0f3fc] to-[#c7e9f7] flex items-center justify-center">
                      <Calendar size={48} className="text-[#5aaddc]" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-xs text-gray-400 mb-2">
                      {new Date(item.yayinTarihi).toLocaleDateString("tr-TR")}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.baslik}</h3>
                    {item.ozet && <p className="text-gray-500 text-sm line-clamp-2">{item.ozet}</p>}
                    <Link href={`/haberler/${item.id}`} className="text-[#3a8fbf] text-sm font-semibold mt-3 inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Devamını Oku <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Etkinlikler */}
      {events.length > 0 && (
        <section className="py-20 bg-[#0f1f30] text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-1">Yaklaşan Etkinlikler</h2>
                <p className="text-[#8fd0f0]">Turnuvalar ve özel etkinlikler</p>
              </div>
              <Link href="/etkinlikler" className="text-[#e5500a] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Tümü <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-[#1d3a5c] rounded-xl p-6 border border-[#163050] hover:border-[#e5500a] transition-colors">
                  <div className="text-[#e5500a] text-sm font-semibold mb-2 uppercase tracking-wide">
                    {event.kategori === "tenis" ? "Tenis" : event.kategori === "yuzme" ? "Yüzme" : event.kategori === "turnuva" ? "Turnuva" : "Etkinlik"}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{event.baslik}</h3>
                  <div className="flex items-center gap-2 text-[#8fd0f0] text-sm">
                    <Calendar size={14} />
                    {new Date(event.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  {event.yer && (
                    <div className="text-[#5aaddc] text-sm mt-1">📍 {event.yer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Üyelik */}
      <section className="py-20 bg-gradient-to-r from-[#e5500a] to-[#c44208]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Users size={56} className="text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ailemize Katılın
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Üye olun, profesyonel antrenörlerimiz ve modern tesislerimizden yararlanın.
          </p>
          <Link
            href="/uyelik"
            className="bg-[#1d3a5c] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#163050] transition-colors inline-block"
          >
            Hemen Kayıt Ol
          </Link>
        </div>
      </section>
    </div>
  );
}
