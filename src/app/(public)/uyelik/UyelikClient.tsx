"use client";
import { useState } from "react";
import { Check, Users } from "lucide-react";

interface Plan {
  title: string;
  price: string;
  period: string;
  color: string;
  popular?: boolean;
  features: string[];
}

interface Props {
  plans: Plan[];
}

export default function UyelikClient({ plans }: Props) {
  const [formData, setFormData] = useState({ ad: "", soyad: "", email: "", telefon: "", uyeTipi: "yetiskin", spor: "her_ikisi", mesaj: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSubmitted(true);
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1d3a5c] to-[#163050] text-white pb-16 pt-36">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <Users size={48} className="text-amber-400" />
            <div>
              <h1 className="text-4xl font-bold mb-1">Üyelik</h1>
              <p className="text-[#8fd0f0] text-lg">Size uygun üyelik planını seçin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planlar */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] text-center mb-3">Üyelik Planları</h2>
          <p className="text-center text-gray-500 mb-10">Tüm planlar kayıt ve sigorta dahildir</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.title} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:border-green-500 hover:shadow-green-200 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? "border-green-500 scale-105" : "border-gray-100"}`}>
                {plan.popular && (
                  <div className="bg-[#e5500a] text-white text-center text-xs font-bold py-1.5">
                    EN POPÜLER
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.title}</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-black text-[#1d3a5c]">{plan.price}</span>
                    <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={14} className="text-[#e5500a] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => document.getElementById("basvuru")?.scrollIntoView({ behavior: "smooth" })}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${plan.popular ? "bg-[#e5500a] text-white hover:bg-[#c44208]" : "bg-[#1d3a5c] text-white hover:bg-[#163050]"}`}
                  >
                    Başvur
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Başvuru Formu */}
      <section id="basvuru" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] text-center mb-3">Üyelik Başvurusu</h2>
          <p className="text-center text-gray-500 mb-8">Formu doldurun, sizi arayalım.</p>
          {submitted ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
              <Check size={48} className="text-[#e5500a] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#c44208] mb-2">Başvurunuz Alındı!</h3>
              <p className="text-[#e5500a]">En kısa sürede sizinle iletişime geçeceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                  <input required value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                  <input required value={formData.soyad} onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0555 000 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Tipi</label>
                <select value={formData.uyeTipi} onChange={(e) => setFormData({ ...formData, uyeTipi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="yetiskin">Yetişkin</option>
                  <option value="cocuk">Çocuk</option>
                  <option value="yaz_kursu">Yaz Kursu</option>
                  <option value="kardes">Kardeş</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlgilendiğiniz Spor</label>
                <select value={formData.spor} onChange={(e) => setFormData({ ...formData, spor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="tenis">Tenis</option>
                  <option value="yuzme">Yüzme</option>
                  <option value="her_ikisi">Her İkisi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea value={formData.mesaj} onChange={(e) => setFormData({ ...formData, mesaj: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sorularınızı veya notlarınızı yazabilirsiniz..." />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1d3a5c] text-white py-3 rounded-lg font-bold hover:bg-[#163050] transition-colors disabled:opacity-60">
                {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
