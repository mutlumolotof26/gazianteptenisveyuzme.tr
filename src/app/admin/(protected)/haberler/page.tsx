"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Check, Eye, EyeOff } from "lucide-react";

type News = { id: string; baslik: string; ozet?: string; icerik: string; resimUrl?: string; kategori: string; aktif: boolean; yayinTarihi: string };

const emptyForm = { baslik: "", ozet: "", icerik: "", resimUrl: "", kategori: "genel", aktif: true };

export default function HaberlerAdminPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchNews() {
    setLoading(true);
    const res = await fetch("/api/news");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchNews(); }, []);

  async function handleSave() {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/news/${editId}` : "/api/news";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
    fetchNews();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu haberi silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    fetchNews();
  }

  function startEdit(item: News) {
    setForm({ baslik: item.baslik, ozet: item.ozet || "", icerik: item.icerik, resimUrl: item.resimUrl || "", kategori: item.kategori, aktif: item.aktif });
    setEditId(item.id);
    setShowForm(true);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Haber Yönetimi</h1>
          <p className="text-gray-500 text-sm">{items.length} haber</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} className="flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163050]">
          <Plus size={16} /> Yeni Haber
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Başlık</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Haber bulunamadı.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-sm">{item.baslik}</div>
                    {item.ozet && <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.ozet}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#e0f3fc] text-[#3a8fbf] px-2 py-0.5 rounded-full capitalize">{item.kategori}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.aktif ? "bg-orange-50 text-[#e5500a]" : "bg-gray-100 text-gray-500"}`}>
                      {item.aktif ? "Yayında" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(item.yayinTarihi).toLocaleDateString("tr-TR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-[#3a8fbf] hover:bg-[#f0f9ff] rounded"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800">{editId ? "Haberi Düzenle" : "Yeni Haber"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık *</label>
                <input value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Özet</label>
                <input value={form.ozet} onChange={(e) => setForm({ ...form, ozet: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kısa özet..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">İçerik *</label>
                <textarea value={form.icerik} onChange={(e) => setForm({ ...form, icerik: e.target.value })} rows={8} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resim URL</label>
                <input value={form.resimUrl} onChange={(e) => setForm({ ...form, resimUrl: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="genel">Genel</option>
                    <option value="tenis">Tenis</option>
                    <option value="yuzme">Yüzme</option>
                    <option value="etkinlik">Etkinlik</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="aktif" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="w-4 h-4 rounded" />
                  <label htmlFor="aktif" className="text-sm text-gray-700">Yayında</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={handleSave} className="flex-1 bg-[#1d3a5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163050] flex items-center justify-center gap-2">
                <Check size={15} /> {editId ? "Kaydet" : "Yayınla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
