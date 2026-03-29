"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Check, Calendar } from "lucide-react";

type Event = { id: string; baslik: string; aciklama?: string; tarih: string; yer?: string; kategori: string; aktif: boolean };
const emptyForm = { baslik: "", aciklama: "", tarih: "", yer: "", kategori: "genel", aktif: true };

export default function EtkinliklerAdminPage() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch("/api/events");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, []);

  async function handleSave() {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/events/${editId}` : "/api/events";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
    fetchEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  }

  function startEdit(item: Event) {
    setForm({ baslik: item.baslik, aciklama: item.aciklama || "", tarih: item.tarih.slice(0, 16), yer: item.yer || "", kategori: item.kategori, aktif: item.aktif });
    setEditId(item.id);
    setShowForm(true);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Etkinlik Yönetimi</h1>
          <p className="text-gray-500 text-sm">{items.length} etkinlik</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} className="flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163050]">
          <Plus size={16} /> Yeni Etkinlik
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Etkinlik</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Yer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Etkinlik bulunamadı.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-sm">{item.baslik}</div>
                    {item.aciklama && <div className="text-xs text-gray-400 line-clamp-1">{item.aciklama}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar size={13} className="text-[#5aaddc]" />
                      {new Date(item.tarih).toLocaleDateString("tr-TR")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.yer || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#e0f3fc] text-[#3a8fbf] px-2 py-0.5 rounded-full capitalize">{item.kategori}</span>
                  </td>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">{editId ? "Etkinliği Düzenle" : "Yeni Etkinlik"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık *</label>
                <input value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tarih/Saat *</label>
                  <input type="datetime-local" value={form.tarih} onChange={(e) => setForm({ ...form, tarih: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Yer</label>
                  <input value={form.yer} onChange={(e) => setForm({ ...form, yer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="genel">Genel</option>
                    <option value="tenis">Tenis</option>
                    <option value="yuzme">Yüzme</option>
                    <option value="turnuva">Turnuva</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="aktif2" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="w-4 h-4 rounded" />
                  <label htmlFor="aktif2" className="text-sm text-gray-700">Aktif</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={handleSave} className="flex-1 bg-[#1d3a5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163050] flex items-center justify-center gap-2">
                <Check size={15} /> {editId ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
