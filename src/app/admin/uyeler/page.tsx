"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, Check, X, UserCheck, UserX } from "lucide-react";

type Member = {
  id: string; ad: string; soyad: string; email: string; telefon?: string;
  uyeTipi: string; spor: string; durum: string; kayitTarihi: string;
};

const durumEtiket: Record<string, { label: string; cls: string }> = {
  aktif: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  pasif: { label: "Pasif", cls: "bg-gray-100 text-gray-600" },
  beklemede: { label: "Beklemede", cls: "bg-amber-100 text-amber-700" },
};

export default function UyelerPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [durum, setDurum] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ad: "", soyad: "", email: "", telefon: "", uyeTipi: "standart", spor: "her_ikisi", durum: "aktif" });
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchMembers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (durum) params.set("durum", durum);
    const res = await fetch(`/api/members?${params}`);
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  }

  useEffect(() => { fetchMembers(); }, [search, durum]);

  async function handleSave() {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/members/${editId}` : "/api/members";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditId(null);
    setForm({ ad: "", soyad: "", email: "", telefon: "", uyeTipi: "standart", spor: "her_ikisi", durum: "aktif" });
    fetchMembers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu üyeyi silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    fetchMembers();
  }

  async function handleStatusChange(id: string, newDurum: string) {
    await fetch(`/api/members/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: newDurum }) });
    fetchMembers();
  }

  function startEdit(member: Member) {
    setForm({ ad: member.ad, soyad: member.soyad, email: member.email, telefon: member.telefon || "", uyeTipi: member.uyeTipi, spor: member.spor, durum: member.durum });
    setEditId(member.id);
    setShowForm(true);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h1>
          <p className="text-gray-500 text-sm">{members.length} üye listeleniyor</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); }} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
          <Plus size={16} /> Yeni Üye
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad, soyad veya e-posta ara..." className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={durum} onChange={(e) => setDurum(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tüm Durumlar</option>
          <option value="aktif">Aktif</option>
          <option value="beklemede">Beklemede</option>
          <option value="pasif">Pasif</option>
        </select>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Üye</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">E-posta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tip</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Spor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kayıt</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Üye bulunamadı.</td></tr>
              ) : members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                        {m.ad[0]}{m.soyad[0]}
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{m.ad} {m.soyad}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{m.uyeTipi}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.spor === "her_ikisi" ? "Tenis + Yüzme" : m.spor === "tenis" ? "Tenis" : "Yüzme"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${durumEtiket[m.durum]?.cls || "bg-gray-100 text-gray-600"}`}>
                      {durumEtiket[m.durum]?.label || m.durum}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(m.kayitTarihi).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {m.durum === "beklemede" && (
                        <>
                          <button onClick={() => handleStatusChange(m.id, "aktif")} title="Onayla" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                            <UserCheck size={15} />
                          </button>
                          <button onClick={() => handleStatusChange(m.id, "pasif")} title="Reddet" className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                            <UserX size={15} />
                          </button>
                        </>
                      )}
                      <button onClick={() => startEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={15} />
                      </button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">{editId ? "Üyeyi Düzenle" : "Yeni Üye Ekle"}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ad *</label>
                  <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Soyad *</label>
                  <input value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">E-posta *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Telefon</label>
                <input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Üyelik Tipi</label>
                  <select value={form.uyeTipi} onChange={(e) => setForm({ ...form, uyeTipi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="ogrenci">Öğrenci</option>
                    <option value="standart">Standart</option>
                    <option value="premium">Premium</option>
                    <option value="aile">Aile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Spor</label>
                  <select value={form.spor} onChange={(e) => setForm({ ...form, spor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="tenis">Tenis</option>
                    <option value="yuzme">Yüzme</option>
                    <option value="her_ikisi">Her İkisi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Durum</label>
                  <select value={form.durum} onChange={(e) => setForm({ ...form, durum: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="aktif">Aktif</option>
                    <option value="beklemede">Beklemede</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                İptal
              </button>
              <button onClick={handleSave} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 flex items-center justify-center gap-2">
                <Check size={15} /> {editId ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
