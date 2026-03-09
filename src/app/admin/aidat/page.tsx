"use client";
import { useEffect, useState } from "react";
import { Check, X, ChevronLeft, ChevronRight, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react";

type AidatRow = {
  memberId: string;
  ad: string;
  soyad: string;
  telefon?: string;
  uyeTipi: string;
  spor: string;
  aidatId: string | null;
  tutar: number;
  odendi: boolean;
  odemeTarihi: string | null;
  notlar: string;
};

const sporLabel: Record<string, string> = {
  tenis: "Tenis",
  yuzme: "Yüzme",
  her_ikisi: "Tenis + Yüzme",
};

const tipLabel: Record<string, string> = {
  ogrenci: "Öğrenci",
  standart: "Standart",
  premium: "Premium",
  aile: "Aile",
};

function donemLabel(donem: string) {
  const [y, m] = donem.split("-");
  const aylar = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `${aylar[parseInt(m)]} ${y}`;
}

function prevDonem(donem: string) {
  const [y, m] = donem.split("-").map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

function nextDonem(donem: string) {
  const [y, m] = donem.split("-").map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function currentDonem() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function AidatPage() {
  const [donem, setDonem] = useState(currentDonem());
  const [rows, setRows] = useState<AidatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalRow, setModalRow] = useState<AidatRow | null>(null);
  const [modalForm, setModalForm] = useState({ tutar: 0, notlar: "" });
  const [saving, setSaving] = useState(false);

  async function fetchData(d: string) {
    setLoading(true);
    const res = await fetch(`/api/aidat?donem=${d}`);
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  useEffect(() => { fetchData(donem); }, [donem]);

  async function toggleOdendi(row: AidatRow) {
    const newOdendi = !row.odendi;
    setSaving(true);
    if (row.aidatId) {
      await fetch(`/api/aidat/${row.aidatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutar: row.tutar, odendi: newOdendi, notlar: row.notlar }),
      });
    } else {
      await fetch("/api/aidat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: row.memberId, donem, tutar: row.tutar, odendi: newOdendi, notlar: row.notlar }),
      });
    }
    setSaving(false);
    fetchData(donem);
  }

  function openModal(row: AidatRow) {
    setModalRow(row);
    setModalForm({ tutar: row.tutar, notlar: row.notlar });
  }

  async function saveModal() {
    if (!modalRow) return;
    setSaving(true);
    if (modalRow.aidatId) {
      await fetch(`/api/aidat/${modalRow.aidatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutar: modalForm.tutar, odendi: modalRow.odendi, notlar: modalForm.notlar }),
      });
    } else {
      await fetch("/api/aidat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: modalRow.memberId, donem, tutar: modalForm.tutar, odendi: false, notlar: modalForm.notlar }),
      });
    }
    setSaving(false);
    setModalRow(null);
    fetchData(donem);
  }

  const odendi = rows.filter((r) => r.odendi);
  const odenmedi = rows.filter((r) => !r.odendi);
  const toplamTahsilat = odendi.reduce((s, r) => s + r.tutar, 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Başlık & Dönem seçici */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Aidat Takibi</h1>
          <p className="text-gray-500 text-sm">Aylık üye aidat durumlarını yönetin</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <button onClick={() => setDonem(prevDonem(donem))} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800 min-w-32 text-center text-sm">{donemLabel(donem)}</span>
          <button
            onClick={() => setDonem(nextDonem(donem))}
            disabled={donem >= currentDonem()}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Users size={18} className="text-blue-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{rows.length}</div>
            <div className="text-xs text-gray-500">Toplam Üye</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle size={18} className="text-green-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{odendi.length}</div>
            <div className="text-xs text-gray-500">Ödendi</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <XCircle size={18} className="text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{odenmedi.length}</div>
            <div className="text-xs text-gray-500">Ödenmedi</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-amber-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {toplamTahsilat > 0 ? `${toplamTahsilat.toLocaleString("tr-TR")} ₺` : "—"}
            </div>
            <div className="text-xs text-gray-500">Tahsilat</div>
          </div>
        </div>
      </div>

      {/* Tablo */}
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
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Yükleniyor...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Aktif üye bulunamadı.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.memberId} className={`hover:bg-gray-50 ${row.odendi ? "bg-green-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${row.odendi ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {row.ad[0]}{row.soyad[0]}
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{row.ad} {row.soyad}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{row.telefon || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="block">{tipLabel[row.uyeTipi] || row.uyeTipi}</span>
                    <span className="text-xs text-gray-400">{sporLabel[row.spor] || row.spor}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openModal(row)} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                      {row.tutar > 0 ? `${row.tutar.toLocaleString("tr-TR")} ₺` : <span className="text-gray-300 text-xs">Gir</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {row.odemeTarihi
                      ? new Date(row.odemeTarihi).toLocaleDateString("tr-TR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.odendi ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                        <Check size={11} /> Ödendi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                        <X size={11} /> Ödenmedi
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleOdendi(row)}
                      disabled={saving}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        row.odendi
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {row.odendi ? "Geri Al" : "Ödendi İşaretle"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tutar & Not Modal */}
      {modalRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">
                {modalRow.ad} {modalRow.soyad}
              </h3>
              <button onClick={() => setModalRow(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Aidat Tutarı (₺)</label>
                <input
                  type="number"
                  min={0}
                  value={modalForm.tutar}
                  onChange={(e) => setModalForm({ ...modalForm, tutar: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Not (opsiyonel)</label>
                <input
                  value={modalForm.notlar}
                  onChange={(e) => setModalForm({ ...modalForm, notlar: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Açıklama..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModalRow(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                İptal
              </button>
              <button onClick={saveModal} disabled={saving} className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 disabled:opacity-60">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
