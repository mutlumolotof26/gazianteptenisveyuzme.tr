"use client";
import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, X, Check, Upload, GripVertical, Users } from "lucide-react";

type Coach = {
  id: string;
  ad: string;
  unvan: string;
  spor: string;
  deneyim: string;
  biyografi: string;
  resimUrl: string;
  aktif: boolean;
  sira: number;
};

const emptyForm = {
  ad: "",
  unvan: "",
  spor: "her_ikisi",
  deneyim: "",
  biyografi: "",
  resimUrl: "",
  aktif: true,
  sira: 0,
};

const sporEtiket: Record<string, string> = {
  tenis: "Tenis",
  yuzme: "Yüzme",
  her_ikisi: "Tenis & Yüzme",
};

const sporRenk: Record<string, string> = {
  tenis: "bg-orange-50 text-[#e5500a]",
  yuzme: "bg-[#e0f3fc] text-[#3a8fbf]",
  her_ikisi: "bg-purple-100 text-purple-700",
};

export default function AntrenorlerPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Admin için tüm antrenörleri getir (aktif filtresi olmadan)
  async function fetchAllCoaches() {
    setLoading(true);
    const res = await fetch("/api/coaches?all=true");
    setCoaches(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAllCoaches(); }, []);

  function openNew() {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function openEdit(c: Coach) {
    setEditId(c.id);
    setForm({
      ad: c.ad, unvan: c.unvan, spor: c.spor,
      deneyim: c.deneyim, biyografi: c.biyografi,
      resimUrl: c.resimUrl, aktif: c.aktif, sira: c.sira,
    });
    setShowForm(true);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, resimUrl: data.url }));
      } else {
        alert(data.error || "Fotoğraf yükleme başarısız.");
      }
    } catch {
      alert("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
      setUploadingImg(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/coaches/${editId}` : "/api/coaches";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    fetchAllCoaches();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu antrenörü silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/coaches/${id}`, { method: "DELETE" });
    fetchAllCoaches();
  }

  async function toggleAktif(c: Coach) {
    await fetch(`/api/coaches/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !c.aktif }),
    });
    fetchAllCoaches();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Antrenörler</h1>
          <p className="text-gray-500 text-sm">Kulüp antrenörlerini yönetin.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#163050] transition-colors text-sm"
        >
          <Plus size={16} />
          Yeni Antrenör
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editId ? "Antrenörü Düzenle" : "Yeni Antrenör Ekle"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Fotoğraf */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotoğraf</label>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {form.resimUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.resimUrl} alt="Önizleme" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={28} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      value={form.resimUrl}
                      onChange={(e) => setForm({ ...form, resimUrl: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder="https://... veya /uploads/..."
                    />
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingImg}
                      className="flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
                    >
                      <Upload size={13} />
                      {uploadingImg ? "Yükleniyor..." : "Fotoğraf Yükle"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  required
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              {/* Unvan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unvan / Görev *</label>
                <input
                  required
                  value={form.unvan}
                  onChange={(e) => setForm({ ...form, unvan: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Baş Antrenör"
                />
              </div>

              {/* Spor & Deneyim */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branş</label>
                  <select
                    value={form.spor}
                    onChange={(e) => setForm({ ...form, spor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tenis">Tenis</option>
                    <option value="yuzme">Yüzme</option>
                    <option value="her_ikisi">Tenis & Yüzme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim</label>
                  <input
                    value={form.deneyim}
                    onChange={(e) => setForm({ ...form, deneyim: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15 yıl deneyim"
                  />
                </div>
              </div>

              {/* Biyografi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
                <textarea
                  value={form.biyografi}
                  onChange={(e) => setForm({ ...form, biyografi: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Antrenör hakkında kısa bilgi..."
                />
              </div>

              {/* Sıra & Aktif */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><GripVertical size={12} /> Sıra</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.sira}
                    onChange={(e) => setForm({ ...form, sira: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm({ ...form, aktif: !form.aktif })}
                      className={`w-10 h-6 rounded-full transition-colors ${form.aktif ? "bg-[#e5500a]" : "bg-gray-300"} relative cursor-pointer`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.aktif ? "translate-x-5" : "translate-x-1"}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {form.aktif ? "Aktif" : "Pasif"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.ad || !form.unvan}
                className="flex items-center gap-2 bg-[#1d3a5c] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#163050] transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Yükleniyor...</div>
        ) : coaches.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">Henüz antrenör eklenmemiş.</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 bg-[#1d3a5c] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#163050] transition-colors"
            >
              <Plus size={15} /> İlk Antrenörü Ekle
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {coaches.map((coach) => (
              <div key={coach.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                {/* Fotoğraf */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center border border-gray-200">
                  {coach.resimUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coach.resimUrl} alt={coach.ad} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={20} className="text-gray-400" />
                  )}
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{coach.ad}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sporRenk[coach.spor] ?? "bg-gray-100 text-gray-600"}`}>
                      {sporEtiket[coach.spor] ?? coach.spor}
                    </span>
                    {!coach.aktif && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Pasif</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">{coach.unvan}{coach.deneyim && ` · ${coach.deneyim}`}</div>
                </div>

                {/* Sıra */}
                <div className="text-xs text-gray-400 hidden sm:block">#{coach.sira}</div>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleAktif(coach)}
                    title={coach.aktif ? "Pasif yap" : "Aktif yap"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      coach.aktif ? "bg-orange-50 text-[#e5500a] hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {coach.aktif ? "A" : "P"}
                  </button>
                  <button
                    onClick={() => openEdit(coach)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f0f9ff] text-[#3a8fbf] hover:bg-[#e0f3fc] transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(coach.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
