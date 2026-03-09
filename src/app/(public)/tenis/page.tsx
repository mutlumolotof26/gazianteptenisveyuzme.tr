import type { Metadata } from "next";
import { Trophy, Clock, Users, Star } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tenis",
  description: "Gaziantep Tenis ve Yüzme Kulübü tenis tesisleri, antrenörler ve eğitim programları.",
};

async function getTenisCoaches() {
  return prisma.coach.findMany({
    where: { aktif: true, spor: { in: ["tenis", "her_ikisi"] } },
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
  });
}

export default async function TenisPage() {
  const coaches = await getTenisCoaches();

  const programs = [
    { title: "Başlangıç Programı", age: "Tüm yaşlar", saat: "Haftada 2 gün", sure: "60 dk", seviye: "Başlangıç" },
    { title: "Orta Seviye", age: "10 yaş üstü", saat: "Haftada 3 gün", sure: "90 dk", seviye: "Orta" },
    { title: "İleri Seviye", age: "12 yaş üstü", saat: "Haftada 4 gün", sure: "120 dk", seviye: "İleri" },
    { title: "Küçükler Programı", age: "5-10 yaş", saat: "Haftada 2 gün", sure: "45 dk", seviye: "Başlangıç" },
    { title: "Yetişkin Programı", age: "18 yaş üstü", saat: "Haftada 2-3 gün", sure: "90 dk", seviye: "Her seviye" },
    { title: "Özel Ders", age: "Tüm yaşlar", saat: "Randevuya göre", sure: "60 dk", seviye: "Her seviye" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <Trophy size={48} className="text-amber-400" />
            <div>
              <h1 className="text-4xl font-bold mb-1">Tenis</h1>
              <p className="text-green-200 text-lg">Profesyonel kortlar, uzman antrenörler</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tesisler */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 text-center">Tenis Tesislerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "🎾", title: "6 Tenis Kortu", desc: "Profesyonel Amerikan sert kort zemini, gece aydınlatmalı" },
              { icon: "🏆", title: "Turnuva Sahası", desc: "Resmi turnuvalar için tribünlü ana kort" },
              { icon: "🔧", title: "Raket Servisi", desc: "Raket kirişleme ve ekipman bakım servisi" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programlar */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-3">Eğitim Programları</h2>
          <p className="text-center text-gray-500 mb-10">Her yaş ve seviyeye uygun programlar</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div key={prog.title} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-green-400 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">{prog.title}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">{prog.seviye}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-green-600" />
                    <span>{prog.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-600" />
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
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-green-100 flex items-center justify-center border-2 border-green-200">
                    {coach.resimUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.resimUrl} alt={coach.ad} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={36} className="text-green-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{coach.ad}</h3>
                  <p className="text-green-600 font-medium text-sm mt-1">{coach.unvan}</p>
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
      <section className="py-16 bg-green-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Tenis Ailemize Katılın</h2>
          <p className="text-green-200 mb-8">Deneme dersi için bizimle iletişime geçin.</p>
          <a href="/iletisim" className="bg-amber-400 text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors inline-block">
            İletişime Geç
          </a>
        </div>
      </section>
    </div>
  );
}
