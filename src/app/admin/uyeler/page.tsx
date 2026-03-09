"use client";
import { useEffect, useState } from "react";
import {
  Search, Plus, Trash2, Edit, Check, X, UserCheck, UserX,
  ChevronLeft, ChevronRight, TrendingUp, Users, CheckCircle, XCircle,
} from "lucide-react";

/* ─── Tipler ─── */
type Member = {
  id: string; ad: string; soyad: string; email: string; telefon?: string;
  uyeTipi: string; spor: string; durum: string; kayitTarihi: string;
};

type AidatRow = {
  memberId: string; ad: string; soyad: string; telefon?: string;
  uyeTipi: string; spor: string;
  aidatId: string | null; tutar: number; odendi: boolean;
  odemeTarihi: string | null; notlar: string;
};

/* ─── Sabitler ─── */
const durumEtiket: Record<string, { label: string; cls: string }> = {
  aktif: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  pasif: { label: "Pasif", cls: "bg-gray-100 text-gray-600" },
  beklemede: { label: "Beklemede", cls: "bg-amber-100 text-amber-700" },
};
const sporLabel: Record<string, string> = { tenis: "Tenis", yuzme: "Yüzme", her_ikisi: "Tenis + Yüzme" };
const tipLabel: Record<string, string> = { ogrenci: "Öğrenci", standart: "Standart", premium: "Premium", aile: "Aile" };

function donemLabel(d: string) {
  const [y, m] = d.split("-");
  const aylar = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `${aylar[parseInt(m)]} ${y}`;
}
function prevDonem(d: string) { const [y, m] = d.split("-").map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`; }
function nextDonem(d: string) { const [y, m] = d.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; }
function currentDonem() { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; }

/* ─── Sayfa ─── */
export default function UyelerPage() {
  const [tab, setTab] = useState<"uyeler" | "aidat">("uyeler");

  /* ── Üyeler state ── */
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [durum, setDurum] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ad: "", soyad: "", email: "", telefon: "", uyeTipi: "standart", spor: "her_ikisi", durum: "aktif" });
  const [editId, setEditId] = useState<string | null>(null);

  /* ── Aidat state ── */
  const [donem, setDonem] = useState(currentDonem());
  const [rows, setRows] = useState<AidatRow[]>([]);
  const [aidatLoading, setAidatLoading] = useState(true);
  const [modalRow, setModalRow] = useState<AidatRow | null>(null);
  const [modalForm, setModalForm] = useState({ tutar: 0, notlar: "" });
  const [saving, setSaving] = useState(false);

  /* ── Veri çekme ── */
  async function fetchMembers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (durum) params.set("durum", durum);
    const res = await fetch(`/api/members?${params}`);
    setMembers(await res.json());
    setLoading(false);
  }

  async function fetchAidat(d: string) {
    setAidatLoading(true);
    const res = await fetch(`/api/aidat?donem=${d}`);
    setRows(await res.json());
    setAidatLoading(false);
  }

  useEffect(() => { fetchMembers(); }, [search, durum]);
  useEffect(() => { if (tab === "aidat") fetchAidat(donem); }, [donem, tab]);

  /* ── Üye işlemleri ── */
  async function handleSave() {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/members/${editId}` : "/api/members";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setEditId(null);
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
    setEditId(member.id); setShowForm(true);
  }

  /* ── Aidat işlemleri ── */
  async function toggleOdendi(row: AidatRow) {
    const newOdendi = !row.odendi;
    setSaving(true);
    if (row.aidatId) {
      await fetch(`/api/aidat/${row.aidatId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tutar: row.tutar, odendi: newOdendi, notlar: row.notlar }) });
    } else {
      await fetch("/api/aidat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: row.memberId, donem, tutar: row.tutar, odendi: newOdendi, notlar: row.notlar }) });
    }
    setSaving(false);
    fetchAidat(donem);
  }

  async function saveModal() {
    if (!modalRow) return;
    setSaving(true);
    if (modalRow.aidatId) {
      await fetch(`/api/aidat/${modalRow.aidatId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tutar: modalForm.tutar, odendi: modalRow.odendi, notlar: modalForm.notlar }) });
    } else {
      await fetch("/api/aidat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: modalRow.memberId, donem, tutar: modalForm.tutar, odendi: false, notlar: modalForm.notlar }) });
    }
    setSaving(false); setModalRow(null);
    fetchAidat(donem);
  }

  const odendi = rows.filter((r) => r.odendi);
  const odenmedi = rows.filter((r) => !r.odendi);
  const toplamTahsilat = odendi.reduce((s, r) => s + r.tutar, 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h1>
          <p className="text-gray-500 text-sm">Üyeleri ve aidat durumlarını yönetin</p>
        </div>
        {tab === "uyeler" && (
          <button onClick={() => { setShowForm(true); setEditId(null); }} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
            <Plus size={16} /> Yeni Üye
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab("uyeler")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "uyeler" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Users size={16} /> Üye Listesi
        </button>
        <button
          onClick={() => setTab("aidat")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "aidat" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <TrendingUp size={16} /> Aidat Takibi
        </button>
      </div>

      {/* ═══════════ ÜYE LİSTESİ TAB ═══════════ */}
      {tab === "uyeler" && (
        <>
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
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">{m.ad[0]}{m.soyad[0]}</div>
                          <span className="font-medium text-gray-800 text-sm">{m.ad} {m.soyad}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{m.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{m.uyeTipi}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sporLabel[m.spor] || m.spor}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${durumEtiket[m.durum]?.cls || "bg-gray-100 text-gray-600"}`}>{durumEtiket[m.durum]?.label || m.durum}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(m.kayitTarihi).toLocaleDateString("tr-TR")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {m.durum === "beklemede" && (
                            <>
                              <button onClick={() => handleStatusChange(m.id, "aktif")} title="Onayla" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><UserCheck size={15} /></button>
                              <button onClick={() => handleStatusChange(m.id, "pasif")} title="Reddet" className="p-1.5 text-red-500 hover:bg-red-50 rounded"><UserX size={15} /></button>
                            </>
                          )}
                          <button onClick={() => startEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ AİDAT TAKİBİ TAB ═══════════ */}
      {tab === "aidat" && (
        <>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-fit mb-6">
            <button onClick={() => setDonem(prevDonem(donem))} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={18} className="text-gray-600" /></button>
            <span className="font-semibold text-gray-800 min-w-32 text-center text-sm">{donemLabel(donem)}</span>
            <button onClick={() => setDonem(nextDonem(donem))} disabled={donem >= currentDonem()} className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"><ChevronRight size={18} className="text-gray-600" /></button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><Users size={18} className="text-blue-700" /></div>
              <div><div className="text-2xl font-bold text-gray-800">{rows.length}</div><div className="text-xs text-gray-500">Toplam Üye</div></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0"><CheckCircle size={18} className="text-green-700" /></div>
              <div><div className="text-2xl font-bold text-green-700">{odendi.length}</div><div className="text-xs text-gray-500">Ödendi</div></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><XCircle size={18} className="text-red-600" /></div>
              <div><div className="text-2xl font-bold text-red-600">{odenmedi.length}</div><div className="text-xs text-gray-500">Ödenmedi</div></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0"><TrendingUp size={18} className="text-amber-700" /></div>
              <div><div className="text-2xl font-bold text-gray-800">{toplamTahsilat > 0 ? `${toplamTahsilat.toLocaleString("tr-TR")} ₺` : "—"}</div><div className="text-xs text-gray-500">Tahsilat</div></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Üye</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tip / Spor</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tutar</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ödeme Tarihi</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {aidatLoading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">Aktif üye bulunamadı.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.memberId} className={`hover:bg-gray-50 ${row.odendi ? "bg-green-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${row.odendi ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{row.ad[0]}{row.soyad[0]}</div>
                          <span className="font-medium text-gray-800 text-sm">{row.ad} {row.soyad}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.telefon || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="block">{tipLabel[row.uyeTipi] || row.uyeTipi}</span>
                        <span className="text-xs text-gray-400">{sporLabel[row.spor] || row.spor}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setModalRow(row); setModalForm({ tutar: row.tutar, notlar: row.notlar }); }} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                          {row.tutar > 0 ? `${row.tutar.toLocaleString("tr-TR")} ₺` : <span className="text-gray-300 text-xs">Gir</span>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{row.odemeTarihi ? new Date(row.odemeTarihi).toLocaleDateString("tr-TR") : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {row.odendi
                          ? <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium"><Check size={11} /> Ödendi</span>
                          : <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium"><X size={11} /> Ödenmedi</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleOdendi(row)} disabled={saving}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${row.odendi ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}>
                          {row.odendi ? "Geri Al" : "Ödendi İşaretle"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ ÜYE FORM MODAL ═══════════ */}
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
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={handleSave} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 flex items-center justify-center gap-2"><Check size={15} /> {editId ? "Kaydet" : "Ekle"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ AİDAT TUTAR MODAL ═══════════ */}
      {modalRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">{modalRow.ad} {modalRow.soyad}</h3>
              <button onClick={() => setModalRow(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Aidat Tutarı (₺)</label>
                <input type="number" min={0} value={modalForm.tutar} onChange={(e) => setModalForm({ ...modalForm, tutar: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Not (opsiyonel)</label>
                <input value={modalForm.notlar} onChange={(e) => setModalForm({ ...modalForm, notlar: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Açıklama..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModalRow(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={saveModal} disabled={saving} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 disabled:opacity-60">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
