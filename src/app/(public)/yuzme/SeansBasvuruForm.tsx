"use client";

import { useState } from "react";
import { X, Send, CheckCircle } from "lucide-react";

interface Session {
  id: string;
  gun: string;
  baslangic: string;
  bitis: string;
  program: string;
  seviye: string;
  kapasite: number;
  coach?: { id: string; ad: string } | null;
}

interface Props {
  session: Session;
}

export default function SeansBasvuruForm({ session }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ad: "", telefon: "", email: "", mesaj: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          ad: form.ad,
          telefon: form.telefon,
          email: form.email || undefined,
          mesaj: form.mesaj || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu.");
      }
      setSuccess(true);
      setForm({ ad: "", telefon: "", email: "", mesaj: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSuccess(false);
    setError("");
    setForm({ ad: "", telefon: "", email: "", mesaj: "" });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full bg-[#3a8fbf] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#163050] transition-colors"
      >
        Başvur
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{session.program}</h3>
                <p className="text-sm text-gray-500">{session.gun} · {session.baslangic}–{session.bitis}</p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {success ? (
                <div className="text-center py-6">
                  <CheckCircle size={48} className="text-[#e5500a] mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 text-lg mb-2">Başvurunuz Alındı!</h4>
                  <p className="text-gray-500 text-sm">En kısa sürede sizinle iletişime geçeceğiz.</p>
                  <button
                    onClick={handleClose}
                    className="mt-5 bg-[#3a8fbf] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#163050] transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="ad"
                      value={form.ad}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="telefon"
                      value={form.telefon}
                      onChange={handleChange}
                      required
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ornek@email.com (isteğe bağlı)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj</label>
                    <textarea
                      name="mesaj"
                      value={form.mesaj}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Eklemek istediğiniz bilgiler... (isteğe bağlı)"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3a8fbf] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163050] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
