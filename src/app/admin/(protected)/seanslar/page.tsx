"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Check, Waves, Eye, EyeOff } from "lucide-react";

type Coach = { id: string; ad: string };
type Session = {
  id: string; gun: string; baslangic: string; bitis: string;
  program: string; seviye: string; kapasite: number;
  coachId: string | null; coach: Coach | null; aktif: boolean; sira: number;
};
type SessionRequest = {
  id: string; ad: string; telefon: string; email?: string; mesaj?: string;
  okundu: boolean; createdAt: string;
  session: { program: string; gun: string; baslangic: string; bitis: string };
};

const gunler = ["pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi", "pazar"];
const gunLabel: Record<string, string> = {
  pazartesi: "Pazartesi", sali: "Salı", carsamba: "Çarşamba",
  persembe: "Perşembe", cuma: "Cuma", cumartesi: "Cumartesi", pazar: "Pazar",
};
const seviyeLabel: Record<string, string> = {
  baslangic: "Başlangıç", orta: "Orta", ileri: "İleri", her_seviye: "Her Seviye",
};
const seviyeRenk: Record<string, string> = {
  baslangic: "bg-orange-50 text-[#e5500a]", orta: "bg-[#e0f3fc] text-[#3a8fbf]",
  ileri: "bg-purple-100 text-purple-700", her_seviye: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  gun: "pazartesi", baslangic: "09:00", bitis: "10:00",
  program: "", seviye: "her_seviye", kapasite: 20, coachId: "", aktif: true, sira: 0,
};

export default function SeanslarPage() {
  const [tab, setTab] = useState<"seanslar" | "basvurular">("seanslar");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  async function fetchSessions() {
    setLoading(true);
    const res = await fetch("/api/sessions?all=true");
    setSessions(await res.json());
    setLoading(false);
  }
  async function fetchCoaches() {
    const res = await fetch("/api/coaches?all=true");
    setCoaches(await res.json());
  }
  async function fetchRequests() {
    const res = await fetch("/api/sessions/request");
    setRequests(await res.json());
  }

  useEffect(() => { fetchSessions(); fetchCoaches(); fetchRequests(); }, []);

  function openNew() {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(true);
  }
  function openEdit(s: Session) {
    setForm({ gun: s.gun, baslangic: s.baslangic, bitis: s.bitis, program: s.program, seviye: s.seviye, kapasite: s.kapasite, coachId: s.coachId || "", aktif: s.aktif, sira: s.sira });
    setEditId(s.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.program || !form.gun || !form.baslangic || !form.bitis) return;
    setSaving(true);
    const payload = { ...form, coachId: form.coachId || null };
    if (editId) {
      await fetch(`/api/sessions/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false);
    setShowForm(false);
    fetchSessions();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu seansı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    fetchSessions();
  }

  async function toggleAktif(s: Session) {
    await fetch(`/api/sessions/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aktif: !s.aktif }) });
    fetchSessions();
  }

  // Günlere göre seansları grupla
  const byGun: Record<string, Session[]> = {};
  gunler.forEach((g) => { byGun[g] = sessions.filter((s) => s.gun === g).sort((a, b) => a.baslangic.localeCompare(b.baslangic)); });
  const unreadCount = requests.filter((r) => !r.okundu).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seans Yönetimi</h1>
          <p className="text-gray-500 text-sm">Yüzme seanslarını ve başvuruları yönetin</p>
        </div>
        {tab === "seanslar" && (
          <button onClick={openNew} className="flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163050]">
            <Plus size={16} /> Yeni Seans
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab("seanslar")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "seanslar" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Waves size={16} /> Seanslar
        </button>
        <button onClick={() => setTab("basvurular")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "basvurular" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Başvurular {unreadCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
        </button>
      </div>

      {/* SEANSLAR TAB */}
      {tab === "seanslar" && (
        loading ? (
          <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="space-y-6">
            {gunler.map((gun) => (
              byGun[gun].length === 0 ? null : (
                <div key={gun}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{gunLabel[gun]}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {byGun[gun].map((s) => (
                      <div key={s.id} className={`bg-white rounded-xl border p-4 shadow-sm ${s.aktif ? "border-gray-100" : "border-dashed border-gray-300 opacity-60"}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{s.program}</p>
                            <p className="text-[#3a8fbf] font-medium text-sm">{s.baslangic} – {s.bitis}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${seviyeRenk[s.seviye] || "bg-gray-100 text-gray-600"}`}>{seviyeLabel[s.seviye] || s.seviye}</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          {s.coach && <p>Antrenör: <span className="text-gray-700">{s.coach.ad}</span></p>}
                          <p>Kapasite: <span className="text-gray-700">{s.kapasite} kişi</span></p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleAktif(s)} title={s.aktif ? "Pasife Al" : "Aktive Et"} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            {s.aktif ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => openEdit(s)} className="p-1.5 text-[#3a8fbf] hover:bg-[#f0f9ff] rounded"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Waves size={40} className="mx-auto mb-3 text-gray-300" />
                <p>Henüz seans eklenmemiş.</p>
                <button onClick={openNew} className="mt-4 text-[#3a8fbf] text-sm hover:underline">İlk seansı ekle</button>
              </div>
            )}
          </div>
        )
      )}

      {/* BAŞVURULAR TAB */}
      {tab === "basvurular" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">Henüz başvuru yok.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.map((r) => (
                <div key={r.id} className={`p-4 ${!r.okundu ? "bg-[#f0f9ff]/40" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!r.okundu && <span className="w-2 h-2 bg-[#f0f9ff]0 rounded-full shrink-0" />}
                        <span className="font-semibold text-gray-800 text-sm">{r.ad}</span>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-[#3a8fbf] font-medium mb-1">{r.session.program} · {gunLabel[r.session.gun]} {r.session.baslangic}–{r.session.bitis}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <a href={`tel:${r.telefon}`} className="hover:text-[#3a8fbf]">{r.telefon}</a>
                        {r.email && <a href={`mailto:${r.email}`} className="hover:text-[#3a8fbf]">{r.email}</a>}
                      </div>
                      {r.mesaj && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">{r.mesaj}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">{editId ? "Seansı Düzenle" : "Yeni Seans Ekle"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Program Adı *</label>
                <input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="ör. Çocuk Programı" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gün *</label>
                <select value={form.gun} onChange={(e) => setForm({ ...form, gun: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {gunler.map((g) => <option key={g} value={g}>{gunLabel[g]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Başlangıç *</label>
                  <input type="time" value={form.baslangic} onChange={(e) => setForm({ ...form, baslangic: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bitiş *</label>
                  <input type="time" value={form.bitis} onChange={(e) => setForm({ ...form, bitis: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Seviye</label>
                  <select value={form.seviye} onChange={(e) => setForm({ ...form, seviye: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="her_seviye">Her Seviye</option>
                    <option value="baslangic">Başlangıç</option>
                    <option value="orta">Orta</option>
                    <option value="ileri">İleri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kapasite</label>
                  <input type="number" min={1} value={form.kapasite} onChange={(e) => setForm({ ...form, kapasite: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Antrenör</label>
                <select value={form.coachId} onChange={(e) => setForm({ ...form, coachId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Antrenör seçin —</option>
                  {coaches.map((c) => <option key={c.id} value={c.id}>{c.ad}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sıra</label>
                  <input type="number" min={0} value={form.sira} onChange={(e) => setForm({ ...form, sira: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={handleSave} disabled={saving || !form.program} className="flex-1 bg-[#1d3a5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163050] disabled:opacity-60 flex items-center justify-center gap-2">
                <Check size={15} /> {editId ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
