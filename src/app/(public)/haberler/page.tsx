import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Haberler",
  description: "Gaziantep Tenis ve Yüzme Kulübü güncel haberleri ve duyurular.",
};

export default async function HaberlerPage() {
  const news = await prisma.news.findMany({
    where: { aktif: true },
    orderBy: { yayinTarihi: "desc" },
  });

  const kategoriler = ["tümü", "genel", "tenis", "yuzme", "etkinlik"];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Haberler</h1>
          <p className="text-blue-200">Kulübümüzden güncel haberler ve duyurular</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {news.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar size={64} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg">Henüz haber bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                  {item.resimUrl ? (
                    <img src={item.resimUrl} alt={item.baslik} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Calendar size={48} className="text-blue-400" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{item.kategori}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.yayinTarihi).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <h2 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.baslik}</h2>
                    {item.ozet && <p className="text-gray-500 text-sm line-clamp-2 mb-3">{item.ozet}</p>}
                    <Link href={`/haberler/${item.id}`} className="text-blue-700 text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Devamını Oku <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
