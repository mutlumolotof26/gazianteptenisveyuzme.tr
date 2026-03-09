"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, Check, Images } from "lucide-react";

type GalleryItem = { id: string; baslik: string; resimUrl: string; kategori: string };
const emptyForm = { baslik: "", resimUrl: "", kategori: "genel" };

export default function GaleriAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  async function fetchGallery() {
    setLoading(true);
    const res = await fetch("/api/gallery");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchGallery(); }, []);

  async function handleSave() {
    await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ ...emptyForm });
    fetchGallery();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu resmi silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    fetchGallery();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Galeri Yönetimi</h1>
          <p className="text-gray-500 text-sm">{items.length} fotoğraf</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800">
          <Plus size={16} /> Fotoğraf Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Images size={64} className="mx-auto mb-4 opacity-40" />
          <p>Henüz fotoğraf eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-md aspect-square bg-gray-100">
              <img src={item.resimUrl} alt={item.baslik} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-xs font-medium text-center line-clamp-2">{item.baslik}</p>
                <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">Fotoğraf Ekle</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık *</label>
                <input value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resim URL *</label>
                <input value={form.resimUrl} onChange={(e) => setForm({ ...form, resimUrl: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
              {form.resimUrl && (
                <img src={form.resimUrl} alt="Önizleme" className="w-full h-40 object-cover rounded-lg border" onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="genel">Genel</option>
                  <option value="tenis">Tenis</option>
                  <option value="yuzme">Yüzme</option>
                  <option value="etkinlik">Etkinlik</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={handleSave} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 flex items-center justify-center gap-2">
                <Check size={15} /> Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
