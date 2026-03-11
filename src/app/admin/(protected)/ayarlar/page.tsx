"use client";
import { useEffect, useState, useRef } from "react";
import { Save, Upload, Check, AlertCircle, Globe, Phone, Mail, MapPin, Clock, Share2, Image as ImageIcon, Lock, Eye, EyeOff, Tag } from "lucide-react";

type Settings = {
  logoUrl: string;
  siteName: string;
  siteAcik: string;
  telefon: string;
  email: string;
  adres: string;
  calismaHafta: string;
  calismaCumartesi: string;
  calismaPazar: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappNo: string;
  fiyatYetiskin: string;
  fiyatCocuk: string;
  fiyatYazKursu: string;
  fiyatKardes: string;
};

const defaultSettings: Settings = {
  logoUrl: "/logo.png",
  siteName: "Gaziantep Yüzme Spor Kulübü",
  siteAcik: "Tenis & Yüzme",
  telefon: "+90 (342) 000 00 00",
  email: "info@gazitenisyuzme.com",
  adres: "Şehitkamil Mahallesi, Gaziantep, Türkiye",
  calismaHafta: "07:00 - 22:00",
  calismaCumartesi: "08:00 - 20:00",
  calismaPazar: "09:00 - 18:00",
  instagramUrl: "",
  facebookUrl: "",
  whatsappNo: "",
  fiyatYetiskin: "₺800",
  fiyatCocuk: "₺600",
  fiyatYazKursu: "₺1.500",
  fiyatKardes: "₺500",
};

export default function AyarlarPage() {
  const [form, setForm] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  // Şifre değiştirme state
  const [sifreForm, setSifreForm] = useState({ mevcutSifre: "", yeniSifre: "", yeniSifreTekrar: "" });
  const [sifreGoster, setSifreGoster] = useState({ mevcut: false, yeni: false, tekrar: false });
  const [sifreSaving, setSifreSaving] = useState(false);
  const [sifreStatus, setSifreStatus] = useState<"idle" | "success" | "error">("idle");
  const [sifreHata, setSifreHata] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { setForm({ ...defaultSettings, ...data }); setLoading(false); });
  }, []);

  function set(key: keyof Settings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) set("logoUrl", data.url);
    } finally {
      setUploadingLogo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSifreChange() {
    setSifreHata("");
    if (!sifreForm.mevcutSifre || !sifreForm.yeniSifre || !sifreForm.yeniSifreTekrar) {
      setSifreHata("Tüm alanlar zorunludur."); return;
    }
    if (sifreForm.yeniSifre !== sifreForm.yeniSifreTekrar) {
      setSifreHata("Yeni şifreler eşleşmiyor."); return;
    }
    if (sifreForm.yeniSifre.length < 6) {
      setSifreHata("Yeni şifre en az 6 karakter olmalı."); return;
    }
    setSifreSaving(true);
    setSifreStatus("idle");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mevcutSifre: sifreForm.mevcutSifre, yeniSifre: sifreForm.yeniSifre }),
      });
      const data = await res.json();
      if (res.ok) {
        setSifreStatus("success");
        setSifreForm({ mevcutSifre: "", yeniSifre: "", yeniSifreTekrar: "" });
      } else {
        setSifreHata(data.error || "Bir hata oluştu.");
        setSifreStatus("error");
      }
    } catch {
      setSifreHata("Bir hata oluştu.");
      setSifreStatus("error");
    } finally {
      setSifreSaving(false);
      setTimeout(() => { setSifreStatus("idle"); setSifreHata(""); }, 4000);
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Site Ayarları</h1>
          <p className="text-gray-500 text-sm">Sitenin genel bilgilerini ve iletişim bilgilerini yönetin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : status === "success" ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Kaydediliyor..." : status === "success" ? "Kaydedildi!" : "Kaydet"}
        </button>
      </div>

      {status === "error" && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} />
          Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      <div className="space-y-6">
        {/* Logo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon size={16} className="text-blue-700" />
            </div>
            <h2 className="font-bold text-gray-800">Logo</h2>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                value={form.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                placeholder="/logo.png"
              />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingLogo}
                className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                <Upload size={14} />
                {uploadingLogo ? "Yükleniyor..." : "Dosya Yükle"}
              </button>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG — Maks. önerilen boyut: 200×200px</p>
            </div>
          </div>
        </div>

        {/* Site Bilgileri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-green-700" />
            </div>
            <h2 className="font-bold text-gray-800">Site Bilgileri</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Adı</label>
              <input
                value={form.siteName}
                onChange={(e) => set("siteName", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gaziantep Tenis ve Yüzme Kulübü"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık / Slogan</label>
              <input
                value={form.siteAcik}
                onChange={(e) => set("siteAcik", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tenis & Yüzme"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Phone size={16} className="text-amber-700" />
            </div>
            <h2 className="font-bold text-gray-800">İletişim Bilgileri</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Phone size={12} /> Telefon</span>
              </label>
              <input
                value={form.telefon}
                onChange={(e) => set("telefon", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+90 (342) 000 00 00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Mail size={12} /> E-posta</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@gazitenisyuzme.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><MapPin size={12} /> Adres</span>
              </label>
              <input
                value={form.adres}
                onChange={(e) => set("adres", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şehitkamil Mahallesi, Gaziantep, Türkiye"
              />
            </div>
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-purple-700" />
            </div>
            <h2 className="font-bold text-gray-800">Çalışma Saatleri</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hafta İçi (Pzt-Cum)</label>
              <input
                value={form.calismaHafta}
                onChange={(e) => set("calismaHafta", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="07:00 - 22:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cumartesi</label>
              <input
                value={form.calismaCumartesi}
                onChange={(e) => set("calismaCumartesi", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="08:00 - 20:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pazar</label>
              <input
                value={form.calismaPazar}
                onChange={(e) => set("calismaPazar", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09:00 - 18:00"
              />
            </div>
          </div>
        </div>

        {/* Sosyal Medya */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <Share2 size={16} className="text-pink-700" />
            </div>
            <h2 className="font-bold text-gray-800">Sosyal Medya</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input
                value={form.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input
                value={form.facebookUrl}
                onChange={(e) => set("facebookUrl", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Numarası</label>
              <input
                value={form.whatsappNo}
                onChange={(e) => set("whatsappNo", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="05XX XXX XX XX"
              />
              <p className="text-xs text-gray-400 mt-1">Boş bırakılırsa WhatsApp butonu görünmez.</p>
            </div>
          </div>
        </div>

        {/* Üyelik Fiyatları */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag size={16} className="text-orange-700" />
            </div>
            <h2 className="font-bold text-gray-800">Üyelik Fiyatları</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Yetişkin", key: "fiyatYetiskin" as const },
              { label: "Çocuk", key: "fiyatCocuk" as const },
              { label: "Yaz Kursu", key: "fiyatYazKursu" as const },
              { label: "Kardeş", key: "fiyatKardes" as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="₺800"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Fiyatları güncelledikten sonra sayfanın üstündeki "Kaydet" butonuna tıklayın.</p>
        </div>

        {/* Şifre Değiştir */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-red-700" />
            </div>
            <h2 className="font-bold text-gray-800">Şifre Değiştir</h2>
          </div>

          {sifreStatus === "success" && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <Check size={16} /> Şifre başarıyla değiştirildi.
            </div>
          )}
          {sifreHata && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} /> {sifreHata}
            </div>
          )}

          <div className="space-y-4 max-w-md">
            {[
              { label: "Mevcut Şifre", key: "mevcutSifre" as const, show: sifreGoster.mevcut, toggle: () => setSifreGoster(s => ({ ...s, mevcut: !s.mevcut })) },
              { label: "Yeni Şifre", key: "yeniSifre" as const, show: sifreGoster.yeni, toggle: () => setSifreGoster(s => ({ ...s, yeni: !s.yeni })) },
              { label: "Yeni Şifre (Tekrar)", key: "yeniSifreTekrar" as const, show: sifreGoster.tekrar, toggle: () => setSifreGoster(s => ({ ...s, tekrar: !s.tekrar })) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={sifreForm[key]}
                    onChange={(e) => setSifreForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleSifreChange}
              disabled={sifreSaving}
              className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 text-sm"
            >
              {sifreSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={15} />}
              {sifreSaving ? "Kaydediliyor..." : "Şifreyi Güncelle"}
            </button>
          </div>
        </div>

        {/* Alt kaydet butonu */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : status === "success" ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Kaydediliyor..." : status === "success" ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
