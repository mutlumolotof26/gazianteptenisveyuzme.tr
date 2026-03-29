import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HaberDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id, aktif: true } });
  if (!news) notFound();

  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/haberler" className="inline-flex items-center gap-2 text-[#3a8fbf] font-medium mb-6 hover:gap-3 transition-all">
          <ArrowLeft size={18} /> Haberlere Dön
        </Link>

        {news.resimUrl && (
          <img src={news.resimUrl} alt={news.baslik} className="w-full h-64 object-cover rounded-2xl mb-6" />
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-[#e0f3fc] text-[#3a8fbf] px-2 py-0.5 rounded-full font-medium capitalize">{news.kategori}</span>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Calendar size={14} />
            {new Date(news.yayinTarihi).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.baslik}</h1>
        {news.ozet && <p className="text-lg text-gray-500 mb-6 font-medium">{news.ozet}</p>}

        <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{news.icerik}</div>
      </div>
    </div>
  );
}
