"use client";
import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function IletisimForm() {
  const [formData, setFormData] = useState({ ad: "", email: "", telefon: "", konu: "", mesaj: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSubmitted(true);
    } catch {}
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
        <Check size={48} className="text-[#e5500a] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#c44208] mb-2">Mesajınız Alındı!</h3>
        <p className="text-[#e5500a]">En kısa sürede size dönüş yapacağız.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
          <input required value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
          <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0555 000 00 00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
          <input value={formData.konu} onChange={(e) => setFormData({ ...formData, konu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Üyelik, bilgi, öneri..." />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız *</label>
        <textarea required value={formData.mesaj} onChange={(e) => setFormData({ ...formData, mesaj: e.target.value })} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mesajınızı buraya yazın..." />
      </div>
      <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#1d3a5c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#163050] transition-colors disabled:opacity-60">
        <Send size={18} />
        {loading ? "Gönderiliyor..." : "Mesaj Gönder"}
      </button>
    </form>
  );
}
