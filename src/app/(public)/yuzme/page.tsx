import type { Metadata } from "next";
import { Waves, Clock, Users, Droplets, Star, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/db";
import SeansBasvuruForm from "./SeansBasvuruForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yüzme Kursları ve Olimpik Havuz",
  description: "Gaziantep yüzme kursu ve olimpik yüzme havuzu. Çocuk, yetişkin ve bebek yüzme programları. Uzman antrenörlerle Gaziantep'in en köklü yüzme kulübünde yüzme öğrenin.",
  keywords: [
    "Gaziantep yüzme kursu",
    "Gaziantep yüzme havuzu",
    "yüzme kursu Gaziantep",
    "çocuk yüzme kursu Gaziantep",
    "bebek yüzme Gaziantep",
    "yetişkin yüzme kursu Gaziantep",
    "olimpik havuz Gaziantep",
    "yüzme okulu Gaziantep",
  ],
  openGraph: {
    title: "Gaziantep Yüzme Kursu ve Olimpik Havuz",
    description: "Çocuk, yetişkin ve bebek yüzme programları. Gaziantep'in olimpik yüzme havuzunda uzman antrenörlerle yüzme öğrenin.",
  },
};

async function getYuzmeCoaches() {
  return prisma.coach.findMany({
    where: { aktif: true, spor: { in: ["yuzme", "her_ikisi"] } },
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
  });
}

async function getSeanslar() {
  return prisma.session.findMany({
    where: { aktif: true },
    include: { coach: { select: { id: true, ad: true } } },
    orderBy: [{ sira: "asc" }, { gun: "asc" }, { baslangic: "asc" }],
  });
}

const gunSirasi = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const seviyeLabel: Record<string, string> = {
  baslangic: "Başlangıç",
  orta: "Orta",
  ileri: "İleri",
  her_seviye: "Her Seviye",
};

const seviyeColor: Record<string, string> = {
  baslangic: "bg-green-100 text-green-700",
  orta: "bg-yellow-100 text-yellow-700",
  ileri: "bg-red-100 text-red-700",
  her_seviye: "bg-blue-100 text-blue-700",
};

export default async function YuzmePage() {
  const [coaches, seanslar] = await Promise.all([getYuzmeCoaches(), getSeanslar()]);

  // Group sessions by day
  const seansByGun = gunSirasi.reduce<Record<string, typeof seanslar>>((acc, gun) => {
    const list = seanslar.filter((s) => s.gun.toLowerCase() === gun.toLowerCase());
    if (list.length > 0) acc[gun] = list;
    return acc;
  }, {});

  const programs = [
    { title: "Yüzme Okulu (Baby)", age: "2-4 yaş", saat: "Haftada 2 gün", sure: "30 dk", seviye: "Başlangıç" },
    { title: "Küçükler Programı", age: "5-8 yaş", saat: "Haftada 3 gün", sure: "45 dk", seviye: "Başlangıç" },
    { title: "Çocuk Programı", age: "9-14 yaş", saat: "Haftada 3 gün", sure: "60 dk", seviye: "Her seviye" },
    { title: "Yetişkin Kursu", age: "18 yaş üstü", saat: "Haftada 3 gün", sure: "60 dk", seviye: "Her seviye" },
    { title: "Rekabetçi Yüzme", age: "10 yaş üstü", saat: "Haftada 5 gün", sure: "90 dk", seviye: "İleri" },
    { title: "Özel Ders", age: "Tüm yaşlar", saat: "Randevuya göre", sure: "60 dk", seviye: "Her seviye" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <Waves size={48} className="text-cyan-300" />
            <div>
              <h1 className="text-4xl font-bold mb-1">Yüzme</h1>
              <p className="text-blue-200 text-lg">Olimpik havuz, uzman antrenörler</p>
            </div>
          </div>
        </div>
      </section>

      {/* Havuz Bilgisi */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 text-center">Havuz Tesislerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Droplets size={32} className="text-blue-600" />, title: "50m Olimpik Havuz", desc: "Uluslararası standartta olimpik havuz" },
              { icon: <Waves size={32} className="text-cyan-600" />, title: "25m Isınma Havuzu", desc: "Antrenman öncesi ısınma havuzu" },
              { icon: <Users size={32} className="text-blue-500" />, title: "Çocuk Havuzu", desc: "Küçük yüzücüler için güvenli havuz" },
              { icon: "🌡️", title: "Isıtmalı Havuz", desc: "Yıl boyu 28°C sabit sıcaklık" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
                <div className="text-4xl mb-3 flex justify-center">{typeof item.icon === "string" ? item.icon : item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Haftalık Seans Programı */}
      {Object.keys(seansByGun).length > 0 && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CalendarDays size={28} className="text-blue-600" />
              <h2 className="text-3xl font-bold text-blue-900">Haftalık Seans Programı</h2>
            </div>
            <p className="text-center text-gray-500 mb-10">İlgilendiğiniz seansı seçip başvurunuzu yapabilirsiniz</p>

            <div className="space-y-8">
              {gunSirasi.filter((gun) => seansByGun[gun]).map((gun) => (
                <div key={gun}>
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full inline-block" />
                    {gun}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seansByGun[gun].map((seans) => (
                      <div key={seans.id} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-gray-800">{seans.program}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${seviyeColor[seans.seviye] ?? "bg-gray-100 text-gray-600"}`}>
                            {seviyeLabel[seans.seviye] ?? seans.seviye}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-500 mb-1">
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-blue-500 flex-shrink-0" />
                            <span>{seans.baslangic} – {seans.bitis}</span>
                          </div>
                          {seans.coach && (
                            <div className="flex items-center gap-2">
                              <Star size={13} className="text-amber-400 flex-shrink-0" />
                              <span>{seans.coach.ad}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-blue-500 flex-shrink-0" />
                            <span>Kapasite: {seans.kapasite} kişi</span>
                          </div>
                        </div>
                        <SeansBasvuruForm session={seans} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programlar */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-3">Yüzme Programları</h2>
          <p className="text-center text-gray-500 mb-10">2 yaşından itibaren tüm yaşlara yüzme eğitimi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div key={prog.title} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-blue-400 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">{prog.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">{prog.seviye}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-600" />
                    <span>{prog.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-600" />
                    <span>{prog.saat} - {prog.sure}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Antrenörler */}
      {coaches.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-10">Antrenörlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <div key={coach.id} className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                    {coach.resimUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.resimUrl} alt={coach.ad} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={36} className="text-blue-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{coach.ad}</h3>
                  <p className="text-blue-600 font-medium text-sm mt-1">{coach.unvan}</p>
                  {coach.deneyim && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-gray-400 text-sm">
                      <Star size={12} fill="currentColor" className="text-amber-400" />
                      {coach.deneyim}
                    </div>
                  )}
                  {coach.biyografi && (
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">{coach.biyografi}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-blue-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Yüzmeye Başlayın</h2>
          <p className="text-blue-200 mb-8">Ücretsiz deneme dersi için kaydolun.</p>
          <a href="/iletisim" className="bg-amber-400 text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors inline-block">
            İletişime Geç
          </a>
        </div>
      </section>
    </div>
  );
}
