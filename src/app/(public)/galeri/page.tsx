"use client";
import { useEffect, useState } from "react";
import { Images } from "lucide-react";

type GalleryItem = { id: string; baslik: string; resimUrl: string; kategori: string };

export default function GaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("tümü");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
  }, []);

  const filtered = filter === "tümü" ? items : items.filter((i) => i.kategori === filter);
  const kategoriler = ["tümü", "tenis", "yuzme", "etkinlik", "genel"];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1d3a5c] to-[#163050] text-white pb-16 pt-36">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Galeri</h1>
          <p className="text-[#8fd0f0]">Kulübümüzden fotoğraflar</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filtreler */}
          <div className="flex flex-wrap gap-2 mb-8">
            {kategoriler.map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === k ? "bg-[#1d3a5c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {k === "tümü" ? "Tümü" : k === "yuzme" ? "Yüzme" : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Images size={64} className="mx-auto mb-4 opacity-40" />
              <p>Bu kategoride fotoğraf bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-md aspect-square bg-gray-100">
                  <img src={item.resimUrl} alt={item.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-sm font-medium">{item.baslik}</span>
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
