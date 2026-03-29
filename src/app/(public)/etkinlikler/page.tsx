import type { Metadata } from "next";
import { Calendar, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description: "Gaziantep Tenis ve Yüzme Kulübü etkinlikleri, turnuvaları ve organizasyonları.",
};

const kategoriRenk: Record<string, string> = {
  tenis: "bg-orange-50 text-[#e5500a]",
  yuzme: "bg-[#e0f3fc] text-[#3a8fbf]",
  turnuva: "bg-red-100 text-red-700",
  genel: "bg-gray-100 text-gray-700",
};

const kategoriEtiket: Record<string, string> = {
  tenis: "Tenis",
  yuzme: "Yüzme",
  turnuva: "Turnuva",
  genel: "Genel",
};

export default async function EtkinliklerPage() {
  const events = await prisma.event.findMany({
    where: { aktif: true },
    orderBy: { tarih: "asc" },
  });

  const upcoming = events.filter((e) => new Date(e.tarih) >= new Date());
  const past = events.filter((e) => new Date(e.tarih) < new Date());

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1d3a5c] to-[#163050] text-white pb-16 pt-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Etkinlikler</h1>
          <p className="text-[#8fd0f0]">Turnuvalar ve özel organizasyonlar</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Yaklaşan Etkinlikler */}
          <h2 className="text-2xl font-bold text-[#1d3a5c] mb-6">Yaklaşan Etkinlikler</h2>
          {upcoming.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 mb-10">
              <Calendar size={48} className="mx-auto mb-3 opacity-40" />
              <p>Yaklaşan etkinlik bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {upcoming.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  {event.resimUrl ? (
                    <img src={event.resimUrl} alt={event.baslik} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-[#163050] to-[#1d3a5c] flex items-center justify-center">
                      <Calendar size={40} className="text-[#5aaddc]" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kategoriRenk[event.kategori] || kategoriRenk.genel}`}>
                        {kategoriEtiket[event.kategori] || event.kategori}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{event.baslik}</h3>
                    {event.aciklama && <p className="text-gray-500 text-sm line-clamp-2 mb-3">{event.aciklama}</p>}
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#5aaddc]" />
                        {new Date(event.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      {event.yer && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#5aaddc]" />
                          {event.yer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Geçmiş Etkinlikler */}
          {past.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-gray-500 mb-6">Geçmiş Etkinlikler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                {past.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kategoriRenk[event.kategori] || kategoriRenk.genel}`}>
                        {kategoriEtiket[event.kategori] || event.kategori}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-600 mb-2">{event.baslik}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Calendar size={13} />
                      {new Date(event.tarih).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
