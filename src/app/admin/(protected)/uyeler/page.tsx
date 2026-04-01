"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search, Plus, Trash2, Edit, Check, X, UserCheck, UserX,
  ChevronLeft, ChevronRight, TrendingUp, Users, CheckCircle, XCircle,
  Phone, Mail, Calendar, CreditCard, ChevronDown, ArrowLeft, Waves, Eye, EyeOff, AlertTriangle, Send,
} from "lucide-react";

type Member = {
  id: string; ad: string; soyad: string; email: string; telefon?: string;
  tcKimlik?: string; dogumTarihi?: string; uyeTipi: string; spor: string; durum: string;
  kayitTarihi: string; notlar?: string; dogumTarihi2?: string;
};
type MemberDetail = Member & { aidatlar: AidatRecord[] };
type AidatRecord = {
  id: string; donem: string; tutar: number; odendi: boolean; odemeTarihi: string | null; notlar?: string;
};
type AidatRow = {
  memberId: string; ad: string; soyad: string; telefon?: string;
  uyeTipi: string; spor: string;
  aidatId: string | null; tutar: number; odendi: boolean;
  odemeTarihi: string | null; notlar: string;
};
type SessionRequest = {
  id: string; ad: string; telefon: string; email?: string | null; mesaj?: string | null;
  okundu: boolean; createdAt: string;
  session: { program: string; gun: string; baslangic: string; bitis: string };
};
type Coach = { id: string; ad: string };
type Session = {
  id: string; gun: string; baslangic: string; bitis: string;
  program: string; seviye: string; kapasite: number;
  coachId: string | null; coach: Coach | null; aktif: boolean; sira: number;
};

const durumEtiket: Record<string, { label: string; cls: string }> = {
  aktif: { label: "Aktif", cls: "bg-orange-50 text-[#e5500a]" },
  pasif: { label: "Pasif", cls: "bg-gray-100 text-gray-600" },
  beklemede: { label: "Beklemede", cls: "bg-amber-100 text-amber-700" },
};
const sporLabel: Record<string, string> = { tenis: "Tenis", yuzme: "Yüzme", her_ikisi: "Tenis + Yüzme" };
const tipLabel: Record<string, string> = { ogrenci: "Öğrenci", standart: "Standart", premium: "Premium", aile: "Aile", takim: "Takım", kursiyerler: "Kursiyer" };
const aylar = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const gunler = ["pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi", "pazar"];
const gunLabel: Record<string, string> = { pazartesi: "Pazartesi", sali: "Salı", carsamba: "Çarşamba", persembe: "Perşembe", cuma: "Cuma", cumartesi: "Cumartesi", pazar: "Pazar" };
const seviyeRenk: Record<string, string> = { baslangic: "bg-orange-50 text-[#e5500a]", orta: "bg-[#e0f3fc] text-[#3a8fbf]", ileri: "bg-purple-100 text-purple-700", her_seviye: "bg-gray-100 text-gray-600" };
const seviyeAdLabel: Record<string, string> = { baslangic: "Başlangıç", orta: "Orta", ileri: "İleri", her_seviye: "Her Seviye" };
const emptySeansForm = { gun: "pazartesi", baslangic: "09:00", bitis: "10:00", program: "", seviye: "her_seviye", kapasite: 20, coachId: "", aktif: true, sira: 0 };

function formatPhone(tel?: string) {
  if (!tel) return null;
  const digits = tel.replace(/\D/g, "");
  const normalized = digits.startsWith("90") ? "0" + digits.slice(2) : digits.startsWith("0") ? digits : "0" + digits;
  if (normalized.length === 11) return `${normalized.slice(0,4)} ${normalized.slice(4,7)} ${normalized.slice(7,9)} ${normalized.slice(9)}`;
  return tel;
}

function tcValid(tc?: string) {
  if (!tc) return false;
  const d = tc.replace(/\D/g, "");
  return d.length === 11;
}

function donemLabel(d: string) { const [y, m] = d.split("-"); return `${aylar[parseInt(m)]} ${y}`; }
function prevDonem(d: string) { const [y, m] = d.split("-").map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`; }
function nextDonem(d: string) { const [y, m] = d.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; }
function currentDonem() { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; }

export default function UyelerPage() {
  const [tab, setTab] = useState<"takim" | "kursiyerler" | "on_kayit" | "aidat" | "seanslar" | "basvurular">("takim");
  const [basvurular, setBasvurular] = useState<SessionRequest[]>([]);
  const [basvurularLoading, setBasvurularLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [durumFilter, setDurumFilter] = useState("");
  const [tipFilter, setTipFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ad: "", soyad: "", email: "", telefon: "", tcKimlik: "", dogumTarihi: "", kayitTarihi: "", uyeTipi: "standart", spor: "yuzme", durum: "aktif", notlar: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const [donem, setDonem] = useState(currentDonem());
  const [rows, setRows] = useState<AidatRow[]>([]);
  const [aidatLoading, setAidatLoading] = useState(true);
  const [modalRow, setModalRow] = useState<AidatRow | null>(null);
  const [modalForm, setModalForm] = useState({ tutar: 0, notlar: "" });
  const [saving, setSaving] = useState(false);
  const [aidatSearch, setAidatSearch] = useState("");
  const [sporFilter, setSporFilter] = useState("");

  // Seanslar
  const [sessions, setSessions] = useState<Session[]>([]);
  const [seansLoading, setSeansLoading] = useState(false);
  const [seansCoaches, setSeansCoaches] = useState<Coach[]>([]);
  const [seansShowForm, setSeansShowForm] = useState(false);
  const [seansEditId, setSeansEditId] = useState<string | null>(null);
  const [seansForm, setSeansForm] = useState({ ...emptySeansForm });
  const [seansSaving, setSeansSaving] = useState(false);

  // Edit modal – aidat bölümü
  const [editMemberAidatlar, setEditMemberAidatlar] = useState<AidatRecord[]>([]);
  const [editAidatLoading, setEditAidatLoading] = useState(false);
  const [newAidatForm, setNewAidatForm] = useState({ donem: currentDonem(), tutar: 0, odendi: false });
  const [showAddAidat, setShowAddAidat] = useState(false);

  const [waMessage, setWaMessage] = useState("");
  const [waSending, setWaSending] = useState(false);
  const [waResult, setWaResult] = useState<"ok" | "err" | null>(null);

  async function sendWaMessage() {
    if (!waMessage.trim() || !form.telefon) return;
    setWaSending(true); setWaResult(null);
    const digits = form.telefon.replace(/\D/g, "");
    const to = digits.startsWith("90") ? digits : digits.startsWith("0") ? "9" + digits : "90" + digits;
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, text: waMessage.trim(), channel: "whatsapp" }),
      });
      const data = await res.json();
      setWaResult(data.ok ? "ok" : "err");
      if (data.ok) setWaMessage("");
    } catch { setWaResult("err"); }
    setWaSending(false);
  }

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const activeDurum = durumFilter || (tab === "on_kayit" ? "beklemede" : "");
    if (activeDurum) params.set("durum", activeDurum);
    const activeTip = tipFilter || (tab === "takim" ? "takim" : tab === "kursiyerler" ? "kursiyerler" : "");
    if (activeTip) params.set("uyeTipi", activeTip);
    const res = await fetch(`/api/members?${params}`);
    setMembers(await res.json());
    setLoading(false);
  }, [search, durumFilter, tipFilter, tab]);

  async function fetchAidat(d: string) {
    setAidatLoading(true);
    const res = await fetch(`/api/aidat?donem=${d}`);
    setRows(await res.json());
    setAidatLoading(false);
  }

  async function fetchBasvurular() {
    setBasvurularLoading(true);
    const res = await fetch("/api/sessions/request");
    setBasvurular(await res.json());
    setBasvurularLoading(false);
  }

  async function toggleOkundu(req: SessionRequest) {
    await fetch(`/api/sessions/request/${req.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ okundu: !req.okundu }),
    });
    fetchBasvurular();
  }

  async function deleteBasvuru(id: string) {
    if (!confirm("Bu başvuruyu silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/sessions/request/${id}`, { method: "DELETE" });
    fetchBasvurular();
  }

  async function openProfile(member: Member) {
    const res = await fetch(`/api/members/${member.id}`);
    setSelectedMember(await res.json());
  }

  async function fetchSessions() {
    setSeansLoading(true);
    const res = await fetch("/api/sessions?all=true");
    setSessions(await res.json());
    setSeansLoading(false);
  }
  async function fetchSeansCoaches() {
    const res = await fetch("/api/coaches?all=true");
    setSeansCoaches(await res.json());
  }
  function openNewSeans() { setSeansForm({ ...emptySeansForm }); setSeansEditId(null); setSeansShowForm(true); }
  function openEditSeans(s: Session) { setSeansForm({ gun: s.gun, baslangic: s.baslangic, bitis: s.bitis, program: s.program, seviye: s.seviye, kapasite: s.kapasite, coachId: s.coachId || "", aktif: s.aktif, sira: s.sira }); setSeansEditId(s.id); setSeansShowForm(true); }
  async function handleSeansSave() {
    if (!seansForm.program) return;
    setSeansSaving(true);
    const payload = { ...seansForm, coachId: seansForm.coachId || null };
    if (seansEditId) { await fetch(`/api/sessions/${seansEditId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
    else { await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
    setSeansSaving(false); setSeansShowForm(false); fetchSessions();
  }
  async function handleSeansDelete(id: string) {
    if (!confirm("Bu seansı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" }); fetchSessions();
  }
  async function toggleSeansAktif(s: Session) {
    await fetch(`/api/sessions/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aktif: !s.aktif }) }); fetchSessions();
  }

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { if (tab === "aidat") fetchAidat(donem); }, [donem, tab]);
  useEffect(() => { if (tab === "basvurular") fetchBasvurular(); }, [tab]);
  useEffect(() => { if (tab === "seanslar") { fetchSessions(); fetchSeansCoaches(); } }, [tab]);

  async function handleSave() {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/members/${editId}` : "/api/members";
    const payload = { ...form, dogumTarihi: form.dogumTarihi || null, kayitTarihi: form.kayitTarihi ? new Date(form.kayitTarihi).toISOString() : undefined };
    if (!payload.kayitTarihi) delete (payload as Record<string, unknown>).kayitTarihi;
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setShowForm(false); setEditId(null);
    setForm({ ad: "", soyad: "", email: "", telefon: "", tcKimlik: "", dogumTarihi: "", kayitTarihi: "", uyeTipi: "standart", spor: "yuzme", durum: "aktif", notlar: "" });
    fetchMembers();
    if (selectedMember && editId === selectedMember.id) openProfile(selectedMember);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu üyeyi silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (selectedMember?.id === id) setSelectedMember(null);
    fetchMembers();
  }

  async function handleStatusChange(id: string, newDurum: string) {
    await fetch(`/api/members/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: newDurum }) });
    fetchMembers();
    if (selectedMember?.id === id) setSelectedMember({ ...selectedMember, durum: newDurum });
  }

  async function startEdit(member: Member) {
    const kt = member.kayitTarihi ? new Date(member.kayitTarihi).toISOString().split("T")[0] : "";
    setForm({ ad: member.ad, soyad: member.soyad, email: member.email, telefon: member.telefon || "", tcKimlik: member.tcKimlik || "", dogumTarihi: member.dogumTarihi || "", kayitTarihi: kt, uyeTipi: member.uyeTipi, spor: member.spor, durum: member.durum, notlar: member.notlar || "" });
    setEditId(member.id);
    setShowAddAidat(false);
    setNewAidatForm({ donem: currentDonem(), tutar: 0, odendi: false });
    setShowForm(true);
    setEditAidatLoading(true);
    const res = await fetch(`/api/members/${member.id}`);
    const data = await res.json();
    setEditMemberAidatlar(data.aidatlar ?? []);
    setEditAidatLoading(false);
  }

  async function toggleEditAidat(a: AidatRecord) {
    setSaving(true);
    await fetch(`/api/aidat/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tutar: a.tutar, odendi: !a.odendi, notlar: a.notlar ?? "" }) });
    setSaving(false);
    if (editId) {
      const res = await fetch(`/api/members/${editId}`);
      const data = await res.json();
      setEditMemberAidatlar(data.aidatlar ?? []);
    }
  }

  async function saveNewAidat() {
    if (!editId) return;
    setSaving(true);
    await fetch("/api/aidat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: editId, donem: newAidatForm.donem, tutar: newAidatForm.tutar, odendi: newAidatForm.odendi }) });
    setSaving(false);
    setShowAddAidat(false);
    setNewAidatForm({ donem: currentDonem(), tutar: 0, odendi: false });
    const res = await fetch(`/api/members/${editId}`);
    const data = await res.json();
    setEditMemberAidatlar(data.aidatlar ?? []);
  }

  async function toggleOdendi(row: AidatRow) {
    setSaving(true);
    const newOdendi = !row.odendi;
    if (row.aidatId) {
      await fetch(`/api/aidat/${row.aidatId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tutar: row.tutar, odendi: newOdendi, notlar: row.notlar }) });
    } else {
      await fetch("/api/aidat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: row.memberId, donem, tutar: row.tutar, odendi: newOdendi, notlar: row.notlar }) });
    }
    setSaving(false); fetchAidat(donem);
  }

  async function saveModal() {
    if (!modalRow) return;
    setSaving(true);
    if (modalRow.aidatId) {
      await fetch(`/api/aidat/${modalRow.aidatId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tutar: modalForm.tutar, odendi: modalRow.odendi, notlar: modalForm.notlar }) });
    } else {
      await fetch("/api/aidat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: modalRow.memberId, donem, tutar: modalForm.tutar, odendi: false, notlar: modalForm.notlar }) });
    }
    setSaving(false); setModalRow(null); fetchAidat(donem);
  }

  const filteredRows = rows
    .filter((r) => !aidatSearch || `${r.ad} ${r.soyad}`.toLowerCase().includes(aidatSearch.toLowerCase()))
    .filter((r) => !sporFilter || r.spor === sporFilter);
  const odendi = filteredRows.filter((r) => r.odendi);
  const odenmedi = filteredRows.filter((r) => !r.odendi);
  const toplamTahsilat = odendi.reduce((s, r) => s + r.tutar, 0);

  const profilOdendi = selectedMember?.aidatlar.filter((a) => a.odendi) ?? [];
  const profilBorc = selectedMember?.aidatlar.filter((a) => !a.odendi) ?? [];
  const profilToplamOdenen = profilOdendi.reduce((s, a) => s + a.tutar, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h1>
          <p className="text-gray-500 text-sm">Üyeleri ve aidat durumlarını yönetin</p>
        </div>
        {(tab === "takim" || tab === "kursiyerler" || tab === "on_kayit") && !selectedMember && (
          <button onClick={() => { setShowForm(true); setEditId(null); }} className="flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163050]">
            <Plus size={16} /> Yeni Üye
          </button>
        )}
        {tab === "seanslar" && (
          <button onClick={openNewSeans} className="flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163050]">
            <Plus size={16} /> Yeni Seans
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit flex-wrap">
        <button onClick={() => { setTab("takim"); setSelectedMember(null); setDurumFilter(""); setSearch(""); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "takim" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Users size={16} /> Takım
        </button>
        <button onClick={() => { setTab("kursiyerler"); setSelectedMember(null); setDurumFilter(""); setSearch(""); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "kursiyerler" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Users size={16} /> Kursiyerler
        </button>
        <button onClick={() => { setTab("on_kayit"); setSelectedMember(null); setDurumFilter(""); setSearch(""); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "on_kayit" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <UserCheck size={16} /> Ön Kayıt
        </button>
        <button onClick={() => setTab("aidat")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "aidat" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <TrendingUp size={16} /> Aidat Takibi
        </button>
        <button onClick={() => setTab("seanslar")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "seanslar" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Waves size={16} /> Seanslar
        </button>
        <button onClick={() => setTab("basvurular")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "basvurular" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Waves size={16} /> Seans Başvuruları
          {basvurular.filter(b => !b.okundu).length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {basvurular.filter(b => !b.okundu).length}
            </span>
          )}
        </button>
      </div>

      {/* ── ÜYE PROFİL ── */}
      {(tab === "takim" || tab === "kursiyerler" || tab === "on_kayit") && selectedMember && (
        <div>
          <button onClick={() => setSelectedMember(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft size={16} /> Üye listesine dön
          </button>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-[#e0f3fc] rounded-full flex items-center justify-center text-[#3a8fbf] font-bold text-xl shrink-0">{selectedMember.ad[0]}{selectedMember.soyad[0]}</div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">{selectedMember.ad} {selectedMember.soyad}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${durumEtiket[selectedMember.durum]?.cls}`}>{durumEtiket[selectedMember.durum]?.label}</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600"><Mail size={14} className="text-gray-400 shrink-0" /><a href={`mailto:${selectedMember.email}`} className="hover:text-[#3a8fbf] truncate">{selectedMember.email}</a></div>
                  {selectedMember.telefon && <div className="flex items-center gap-2 text-gray-600"><Phone size={14} className="text-gray-400 shrink-0" /><a href={`tel:${selectedMember.telefon}`} className="hover:text-[#3a8fbf]">{selectedMember.telefon}</a></div>}
                  {selectedMember.dogumTarihi && <div className="flex items-center gap-2 text-gray-600"><Calendar size={14} className="text-gray-400 shrink-0" /><span>{selectedMember.dogumTarihi}</span></div>}
                  <div className="flex items-center gap-2 text-gray-600"><CreditCard size={14} className="text-gray-400 shrink-0" /><span>{tipLabel[selectedMember.uyeTipi]} · {sporLabel[selectedMember.spor]}</span></div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs"><Calendar size={12} className="text-gray-300 shrink-0" /><span>Kayıt: {new Date(selectedMember.kayitTarihi).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 flex gap-2 flex-wrap">
                  {selectedMember.durum === "beklemede" && (<><button onClick={() => handleStatusChange(selectedMember.id, "aktif")} className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"><UserCheck size={12} /> Onayla</button><button onClick={() => handleStatusChange(selectedMember.id, "pasif")} className="flex items-center gap-1.5 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"><UserX size={12} /> Reddet</button></>)}
                  {selectedMember.durum === "aktif" && <button onClick={() => handleStatusChange(selectedMember.id, "pasif")} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">Pasife Al</button>}
                  {selectedMember.durum === "pasif" && <button onClick={() => handleStatusChange(selectedMember.id, "aktif")} className="flex items-center gap-1.5 text-xs bg-orange-50 text-[#e5500a] px-3 py-1.5 rounded-lg hover:bg-green-200">Aktive Et</button>}
                  <button onClick={() => startEdit(selectedMember)} className="flex items-center gap-1.5 text-xs bg-[#e0f3fc] text-[#3a8fbf] px-3 py-1.5 rounded-lg hover:bg-blue-200"><Edit size={12} /> Düzenle</button>
                  <button onClick={() => handleDelete(selectedMember.id)} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100"><Trash2 size={12} /> Sil</button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Aidat Özeti</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Toplam Ödenen</span><span className="font-semibold text-[#e5500a]">{profilToplamOdenen.toLocaleString("tr-TR")} ₺</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Bekleyen Kayıt</span><span className="font-semibold text-red-600">{profilBorc.length} ay</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Son Ödeme</span><span className="font-semibold text-gray-700">{profilOdendi[0]?.odemeTarihi ? new Date(profilOdendi[0].odemeTarihi).toLocaleDateString("tr-TR") : "—"}</span></div>
                </div>
              </div>
              {selectedMember.notlar && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                  <h3 className="font-semibold text-amber-800 text-sm mb-1">Not</h3>
                  <p className="text-sm text-amber-700">{selectedMember.notlar}</p>
                </div>
              )}
            </div>
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-700">Aidat Geçmişi</h3></div>
                {selectedMember.aidatlar.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">Henüz aidat kaydı yok.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dönem</th><th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tutar</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ödeme Tarihi</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th></tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedMember.aidatlar.map((a) => (
                          <tr key={a.id} className={a.odendi ? "bg-orange-50/20" : ""}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{donemLabel(a.donem)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-700">{a.tutar > 0 ? `${a.tutar.toLocaleString("tr-TR")} ₺` : "—"}</td>
                            <td className="px-4 py-3 text-xs text-center text-gray-500">{a.odemeTarihi ? new Date(a.odemeTarihi).toLocaleDateString("tr-TR") : "—"}</td>
                            <td className="px-4 py-3 text-center">{a.odendi ? <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-[#e5500a] px-2 py-0.5 rounded-full font-medium"><Check size={10} /> Ödendi</span> : <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium"><X size={10} /> Ödenmedi</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ÜYE LİSTESİ ── */}
      {(tab === "takim" || tab === "kursiyerler" || tab === "on_kayit") && !selectedMember && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-48"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad, soyad veya e-posta ara..." className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
<select value={durumFilter} onChange={(e) => setDurumFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Tüm Durumlar</option><option value="aktif">Aktif</option><option value="beklemede">Beklemede</option><option value="pasif">Pasif</option></select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Toplam", value: members.length, cls: "bg-[#f0f9ff] text-[#3a8fbf]", icon: <Users size={16} /> },
              { label: "Aktif", value: members.filter(m => m.durum === "aktif").length, cls: "bg-orange-50 text-[#e5500a]", icon: <CheckCircle size={16} /> },
              { label: "Beklemede", value: members.filter(m => m.durum === "beklemede").length, cls: "bg-amber-50 text-amber-700", icon: <ChevronDown size={16} /> },
              { label: "Pasif", value: members.filter(m => m.durum === "pasif").length, cls: "bg-gray-50 text-gray-600", icon: <XCircle size={16} /> },
            ].map((c) => (
              <div key={c.label} className={`rounded-xl border border-transparent p-4 flex items-center gap-3 ${c.cls}`}>
                <div className="opacity-70">{c.icon}</div>
                <div><div className="text-2xl font-bold">{c.value}</div><div className="text-xs opacity-70">{c.label}</div></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Üye</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">TC Kimlik</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Telefon</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tip</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Kayıt</th><th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
                    : members.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Üye bulunamadı.</td></tr>
                    : members.map((m) => (
                      <tr key={m.id} className="hover:bg-[#f0f9ff]/30 cursor-pointer" onClick={() => openProfile(m)}>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${m.uyeTipi === "takim" ? "bg-purple-100 text-purple-700" : m.uyeTipi === "kursiyerler" ? "bg-green-100 text-green-700" : "bg-[#e0f3fc] text-[#3a8fbf]"}`}>{m.ad[0]}{m.soyad[0]}</div><span className="font-medium text-gray-800 text-sm">{m.ad} {m.soyad}</span></div></td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell font-mono">
                          {tcValid(m.tcKimlik)
                            ? <span className="text-gray-500">{m.tcKimlik}</span>
                            : <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertTriangle size={13} />{m.tcKimlik || "Eksik"}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell">
                          {m.telefon
                            ? <span className="text-gray-500">{formatPhone(m.telefon)}</span>
                            : <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertTriangle size={13} />Eksik</span>}
                        </td>
                        <td className="px-4 py-3 text-sm"><span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${m.uyeTipi === "takim" ? "bg-purple-100 text-purple-700" : m.uyeTipi === "kursiyerler" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{tipLabel[m.uyeTipi] || m.uyeTipi}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${durumEtiket[m.durum]?.cls}`}>{durumEtiket[m.durum]?.label}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{new Date(m.kayitTarihi).toLocaleDateString("tr-TR")}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {m.durum === "beklemede" && (<><button onClick={() => handleStatusChange(m.id, "aktif")} title="Onayla" className="p-1.5 text-[#e5500a] hover:bg-orange-50 rounded"><UserCheck size={15} /></button><button onClick={() => handleStatusChange(m.id, "pasif")} title="Reddet" className="p-1.5 text-red-500 hover:bg-red-50 rounded"><UserX size={15} /></button></>)}
                            <button onClick={() => startEdit(m)} className="p-1.5 text-[#3a8fbf] hover:bg-[#f0f9ff] rounded"><Edit size={15} /></button>
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

      {/* ── AİDAT TAKİBİ ── */}
      {tab === "aidat" && (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <button onClick={() => setDonem(prevDonem(donem))} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} className="text-gray-600" /></button>
              <span className="font-semibold text-gray-800 min-w-32 text-center text-sm">{donemLabel(donem)}</span>
              <button onClick={() => setDonem(nextDonem(donem))} disabled={donem >= currentDonem()} className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-30"><ChevronRight size={18} className="text-gray-600" /></button>
            </div>
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={aidatSearch} onChange={(e) => setAidatSearch(e.target.value)} placeholder="Üye ara..." className="border border-gray-300 rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <select value={sporFilter} onChange={(e) => setSporFilter(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Tüm Sporlar</option><option value="tenis">Tenis</option><option value="yuzme">Yüzme</option><option value="her_ikisi">Her İkisi</option></select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"><div className="w-10 h-10 bg-[#e0f3fc] rounded-lg flex items-center justify-center shrink-0"><Users size={18} className="text-[#3a8fbf]" /></div><div><div className="text-2xl font-bold text-gray-800">{filteredRows.length}</div><div className="text-xs text-gray-500">Toplam</div></div></div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"><div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0"><CheckCircle size={18} className="text-[#e5500a]" /></div><div><div className="text-2xl font-bold text-[#e5500a]">{odendi.length}</div><div className="text-xs text-gray-500">Ödendi</div></div></div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><CheckCircle size={18} className="text-red-600" /></div><div><div className="text-2xl font-bold text-red-600">{odenmedi.length}</div><div className="text-xs text-gray-500">Ödenmedi</div></div></div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0"><TrendingUp size={18} className="text-amber-700" /></div><div><div className="text-xl font-bold text-gray-800">{toplamTahsilat > 0 ? `${toplamTahsilat.toLocaleString("tr-TR")} ₺` : "—"}</div><div className="text-xs text-gray-500">Tahsilat</div></div></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Üye</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Telefon</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Tip / Spor</th><th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tutar</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Ödeme Tarihi</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th><th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {aidatLoading ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
                    : filteredRows.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Üye bulunamadı.</td></tr>
                    : filteredRows.map((row) => (
                      <tr key={row.memberId} className={`hover:bg-gray-50 ${row.odendi ? "bg-orange-50/20" : ""}`}>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${row.odendi ? "bg-orange-50 text-[#e5500a]" : "bg-[#e0f3fc] text-[#3a8fbf]"}`}>{row.ad[0]}{row.soyad[0]}</div><span className="font-medium text-gray-800 text-sm">{row.ad} {row.soyad}</span></div></td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{row.telefon ? <a href={`tel:${row.telefon}`} className="hover:text-[#3a8fbf]">{row.telefon}</a> : "—"}</td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell"><span className="block text-gray-700">{tipLabel[row.uyeTipi]}</span><span className="text-xs text-gray-400">{sporLabel[row.spor]}</span></td>
                        <td className="px-4 py-3 text-right"><button onClick={() => { setModalRow(row); setModalForm({ tutar: row.tutar, notlar: row.notlar }); }} className="text-sm font-medium text-gray-700 hover:text-[#3a8fbf]">{row.tutar > 0 ? `${row.tutar.toLocaleString("tr-TR")} ₺` : <span className="text-gray-300 text-xs">Gir</span>}</button></td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500 hidden md:table-cell">{row.odemeTarihi ? new Date(row.odemeTarihi).toLocaleDateString("tr-TR") : "—"}</td>
                        <td className="px-4 py-3 text-center">{row.odendi ? <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-[#e5500a] px-2.5 py-1 rounded-full font-medium"><Check size={11} /> Ödendi</span> : <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium"><X size={11} /> Ödenmedi</span>}</td>
                        <td className="px-4 py-3 text-center"><button onClick={() => toggleOdendi(row)} disabled={saving} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${row.odendi ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}>{row.odendi ? "Geri Al" : "Ödendi"}</button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── SEANSLAR ── */}
      {tab === "seanslar" && (
        seansLoading ? <div className="text-center py-16 text-gray-400">Yükleniyor...</div> : (
          <div className="space-y-6">
            {gunler.map((gun) => {
              const list = sessions.filter((s) => s.gun === gun).sort((a, b) => a.baslangic.localeCompare(b.baslangic));
              if (!list.length) return null;
              return (
                <div key={gun}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{gunLabel[gun]}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {list.map((s) => (
                      <div key={s.id} className={`bg-white rounded-xl border p-4 shadow-sm ${s.aktif ? "border-gray-100" : "border-dashed border-gray-300 opacity-60"}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{s.program}</p>
                            <p className="text-[#3a8fbf] font-medium text-sm">{s.baslangic} – {s.bitis}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${seviyeRenk[s.seviye] || "bg-gray-100 text-gray-600"}`}>{seviyeAdLabel[s.seviye] || s.seviye}</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          {s.coach && <p>Antrenör: <span className="text-gray-700">{s.coach.ad}</span></p>}
                          <p>Kapasite: <span className="text-gray-700">{s.kapasite} kişi</span></p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleSeansAktif(s)} title={s.aktif ? "Pasife Al" : "Aktive Et"} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            {s.aktif ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => openEditSeans(s)} className="p-1.5 text-[#3a8fbf] hover:bg-[#f0f9ff] rounded"><Edit size={14} /></button>
                          <button onClick={() => handleSeansDelete(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Waves size={40} className="mx-auto mb-3 text-gray-300" />
                <p>Henüz seans eklenmemiş.</p>
                <button onClick={openNewSeans} className="mt-4 text-[#3a8fbf] text-sm hover:underline">İlk seansı ekle</button>
              </div>
            )}
          </div>
        )
      )}

      {/* ── SEANS BAŞVURULARI ── */}
      {tab === "basvurular" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{basvurular.length} başvuru · {basvurular.filter(b => !b.okundu).length} okunmamış</p>
            {basvurular.filter(b => !b.okundu).length > 0 && (
              <button
                onClick={async () => {
                  await Promise.all(basvurular.filter(b => !b.okundu).map(b =>
                    fetch(`/api/sessions/request/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ okundu: true }) })
                  ));
                  fetchBasvurular();
                }}
                className="text-xs text-[#3a8fbf] hover:text-[#163050] font-medium"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {basvurularLoading ? (
              <div className="text-center py-10 text-gray-400">Yükleniyor...</div>
            ) : basvurular.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Henüz başvuru yok.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {basvurular.map((b) => (
                  <div key={b.id} className={`p-4 flex items-start gap-4 ${!b.okundu ? "bg-[#f0f9ff]/40" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800 text-sm">{b.ad}</span>
                          {!b.okundu && <span className="text-xs bg-[#e0f3fc] text-[#3a8fbf] px-1.5 py-0.5 rounded-full font-medium">Yeni</span>}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{new Date(b.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                        <span className="flex items-center gap-1"><Waves size={11} className="text-[#5aaddc]" />{b.session.program} · {b.session.gun} {b.session.baslangic}–{b.session.bitis}</span>
                        <a href={`tel:${b.telefon}`} className="flex items-center gap-1 hover:text-[#3a8fbf]"><Phone size={11} />{b.telefon}</a>
                        {b.email && <a href={`mailto:${b.email}`} className="flex items-center gap-1 hover:text-[#3a8fbf]"><Mail size={11} />{b.email}</a>}
                      </div>
                      {b.mesaj && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 italic">"{b.mesaj}"</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleOkundu(b)} title={b.okundu ? "Okunmadı işaretle" : "Okundu işaretle"} className="p-1.5 text-gray-400 hover:text-[#3a8fbf] hover:bg-[#f0f9ff] rounded-lg transition-colors">
                        {b.okundu ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => deleteBasvuru(b.id)} title="Sil" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* SEANS FORM MODAL */}
      {seansShowForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">{seansEditId ? "Seansı Düzenle" : "Yeni Seans Ekle"}</h3>
              <button onClick={() => setSeansShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Program Adı *</label><input value={seansForm.program} onChange={(e) => setSeansForm({ ...seansForm, program: e.target.value })} placeholder="ör. Çocuk Programı" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Gün *</label>
                <select value={seansForm.gun} onChange={(e) => setSeansForm({ ...seansForm, gun: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {gunler.map((g) => <option key={g} value={g}>{gunLabel[g]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Başlangıç *</label><input type="time" value={seansForm.baslangic} onChange={(e) => setSeansForm({ ...seansForm, baslangic: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Bitiş *</label><input type="time" value={seansForm.bitis} onChange={(e) => setSeansForm({ ...seansForm, bitis: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Seviye</label>
                  <select value={seansForm.seviye} onChange={(e) => setSeansForm({ ...seansForm, seviye: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="her_seviye">Her Seviye</option>
                    <option value="baslangic">Başlangıç</option>
                    <option value="orta">Orta</option>
                    <option value="ileri">İleri</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Kapasite</label><input type="number" min={1} value={seansForm.kapasite} onChange={(e) => setSeansForm({ ...seansForm, kapasite: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Antrenör</label>
                <select value={seansForm.coachId} onChange={(e) => setSeansForm({ ...seansForm, coachId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Antrenör seçin —</option>
                  {seansCoaches.map((c) => <option key={c.id} value={c.id}>{c.ad}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Sıra</label><input type="number" min={0} value={seansForm.sira} onChange={(e) => setSeansForm({ ...seansForm, sira: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={seansForm.aktif} onChange={(e) => setSeansForm({ ...seansForm, aktif: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm text-gray-700">Aktif</span></label></div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setSeansShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button>
              <button onClick={handleSeansSave} disabled={seansSaving || !seansForm.program} className="flex-1 bg-[#1d3a5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163050] disabled:opacity-60 flex items-center justify-center gap-2">
                <Check size={15} /> {seansEditId ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÜYE FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white"><h3 className="font-bold text-gray-800">{editId ? "Üyeyi Düzenle" : "Yeni Üye Ekle"}</h3><button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Ad *</label><input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Soyad *</label><input value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">E-posta</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">TC Kimlik No</label><input value={form.tcKimlik} onChange={(e) => setForm({ ...form, tcKimlik: e.target.value })} placeholder="11 haneli TC" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Telefon</label><input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Doğum Tarihi</label><input value={form.dogumTarihi} onChange={(e) => setForm({ ...form, dogumTarihi: e.target.value })} placeholder="ör. 01.01.1990" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                {editId && <div><label className="block text-xs font-medium text-gray-700 mb-1">Kayıt / Başlangıç Tarihi</label><input type="date" value={form.kayitTarihi} onChange={(e) => setForm({ ...form, kayitTarihi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Üyelik Tipi</label><select value={form.uyeTipi} onChange={(e) => setForm({ ...form, uyeTipi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="takim">Takım</option><option value="kursiyerler">Kursiyer</option><option value="ogrenci">Öğrenci</option><option value="standart">Standart</option><option value="premium">Premium</option><option value="aile">Aile</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Spor</label><select value={form.spor} onChange={(e) => setForm({ ...form, spor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="tenis">Tenis</option><option value="yuzme">Yüzme</option><option value="her_ikisi">Her İkisi</option></select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Durum</label><select value={form.durum} onChange={(e) => setForm({ ...form, durum: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="aktif">Aktif</option><option value="beklemede">Beklemede</option><option value="pasif">Pasif</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Not</label><textarea value={form.notlar} onChange={(e) => setForm({ ...form, notlar: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Opsiyonel not..." /></div>

              {/* WhatsApp Mesaj – sadece düzenlemede ve telefon varsa */}
              {editId && form.telefon && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone size={11} className="text-white" />
                    </span>
                    WhatsApp Mesajı Gönder
                  </h4>
                  <textarea
                    value={waMessage}
                    onChange={(e) => { setWaMessage(e.target.value); setWaResult(null); }}
                    placeholder="Mesajınızı yazın..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={sendWaMessage}
                      disabled={waSending || !waMessage.trim()}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Phone size={14} /> {waSending ? "Gönderiliyor..." : "Gönder"}
                    </button>
                    {waResult === "ok" && <span className="text-green-600 text-xs font-medium">✓ Gönderildi</span>}
                    {waResult === "err" && <span className="text-red-500 text-xs font-medium">✗ Gönderilemedi</span>}
                  </div>
                </div>
              )}

              {/* Aidat Bölümü – sadece düzenlemede göster */}
              {editId && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><CreditCard size={14} className="text-[#5aaddc]" /> Aidat Geçmişi</h4>
                    <button onClick={() => setShowAddAidat((v) => !v)} className="text-xs text-[#3a8fbf] hover:text-[#163050] font-medium flex items-center gap-1"><Plus size={12} /> Ekle</button>
                  </div>

                  {showAddAidat && (
                    <div className="bg-[#f0f9ff] rounded-lg p-3 mb-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Dönem (YYYY-AA)</label>
                          <input value={newAidatForm.donem} onChange={(e) => setNewAidatForm({ ...newAidatForm, donem: e.target.value })} placeholder="2025-01" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tutar (₺)</label>
                          <input type="number" min={0} value={newAidatForm.tutar} onChange={(e) => setNewAidatForm({ ...newAidatForm, tutar: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={newAidatForm.odendi} onChange={(e) => setNewAidatForm({ ...newAidatForm, odendi: e.target.checked })} className="rounded" />
                        Ödendi olarak işaretle
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddAidat(false)} className="flex-1 text-xs border border-gray-300 rounded-lg py-1.5 text-gray-600 hover:bg-gray-50">İptal</button>
                        <button onClick={saveNewAidat} disabled={saving} className="flex-1 text-xs bg-[#3a8fbf] text-white rounded-lg py-1.5 font-medium hover:bg-[#163050] disabled:opacity-60">Kaydet</button>
                      </div>
                    </div>
                  )}

                  {editAidatLoading ? (
                    <p className="text-xs text-gray-400 text-center py-3">Yükleniyor...</p>
                  ) : editMemberAidatlar.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">Henüz aidat kaydı yok.</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {editMemberAidatlar.map((a) => (
                        <div key={a.id} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${a.odendi ? "bg-orange-50" : "bg-red-50/50"}`}>
                          <span className="font-medium text-gray-700">{donemLabel(a.donem)}</span>
                          <span className="text-gray-500">{a.tutar > 0 ? `${a.tutar.toLocaleString("tr-TR")} ₺` : "—"}</span>
                          <button onClick={() => toggleEditAidat(a)} disabled={saving} className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${a.odendi ? "bg-orange-50 text-[#e5500a] hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                            {a.odendi ? <><Check size={10} /> Ödendi</> : <><X size={10} /> Ödenmedi</>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {editId && form.telefon && (
              <div className="px-5 pb-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                    <Phone size={13} /> WhatsApp Mesajı Gönder
                  </p>
                  <textarea
                    value={waMessage}
                    onChange={(e) => { setWaMessage(e.target.value); setWaResult(null); }}
                    placeholder="Mesajınızı yazın..."
                    rows={3}
                    className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {waResult === "ok" && <span className="text-xs text-green-600 font-medium">Gönderildi ✓</span>}
                    {waResult === "err" && <span className="text-xs text-red-500">Gönderilemedi</span>}
                    {!waResult && <span />}
                    <button
                      onClick={sendWaMessage}
                      disabled={waSending || !waMessage.trim()}
                      className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Send size={12} /> {waSending ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white"><button onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button><button onClick={handleSave} className="flex-1 bg-[#1d3a5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163050] flex items-center justify-center gap-2"><Check size={15} /> {editId ? "Kaydet" : "Ekle"}</button></div>
          </div>
        </div>
      )}

      {/* AİDAT TUTAR MODAL */}
      {modalRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b"><h3 className="font-bold text-gray-800">{modalRow.ad} {modalRow.soyad}</h3><button onClick={() => setModalRow(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Aidat Tutarı (₺)</label><input type="number" min={0} value={modalForm.tutar} onChange={(e) => setModalForm({ ...modalForm, tutar: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Not</label><input value={modalForm.notlar} onChange={(e) => setModalForm({ ...modalForm, notlar: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
            <div className="flex gap-3 p-5 border-t"><button onClick={() => setModalRow(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">İptal</button><button onClick={saveModal} disabled={saving} className="flex-1 bg-[#1d3a5c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163050] disabled:opacity-60">Kaydet</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
