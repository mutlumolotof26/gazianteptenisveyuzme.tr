"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, ChevronLeft, RefreshCw, User, Bot, Plus, X } from "lucide-react";

interface Template {
  name: string;
  language: string;
  status: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  mediaId?: string;
  mediaType?: string;
}

interface Conversation {
  user_id: string;
  messages: Message[];
  updated_at: string;
  channel?: "whatsapp" | "instagram";
}

function formatPhone(userId: string) {
  if (/^\d{10,15}$/.test(userId)) {
    const local = userId.startsWith("90") ? "0" + userId.slice(2) : userId;
    return local.replace(/^(0\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4") || userId;
  }
  return userId;
}

function isWhatsApp(userId: string) {
  return /^\d{10,15}$/.test(userId);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

export default function KonusmalarPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [botEnabled, setBotEnabled] = useState(true);
  const [togglingBot, setTogglingBot] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startingConv, setStartingConv] = useState(false);
  const [newConvError, setNewConvError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/konusmalar");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConversations(data);
      if (selected) {
        const updated = data.find((c: Conversation) => c.user_id === selected.user_id);
        if (updated) setSelected(updated);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
    fetch("/api/admin/bot-settings")
      .then((r) => r.json())
      .then((d) => setBotEnabled(d.enabled ?? true));

    const interval = setInterval(() => {
      loadConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function openNewConv() {
    setNewConvError("");
    setNewPhone("");
    setSelectedTemplate("");
    setShowNewConv(true);
    if (templates.length === 0) {
      const res = await fetch("/api/admin/whatsapp/templates");
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    }
  }

  async function startConversation() {
    if (!newPhone.trim() || !selectedTemplate) return;
    setStartingConv(true);
    setNewConvError("");
    try {
      const tmpl = templates.find(t => t.name === selectedTemplate);
      const res = await fetch("/api/admin/whatsapp/new-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: newPhone.trim(),
          templateName: selectedTemplate,
          templateLanguage: tmpl?.language || "tr",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setShowNewConv(false);
      await loadConversations();
    } catch (e: unknown) {
      setNewConvError(e instanceof Error ? e.message : "Gönderilemedi");
    } finally {
      setStartingConv(false);
    }
  }

  async function toggleBot() {
    setTogglingBot(true);
    const next = !botEnabled;
    await fetch("/api/admin/bot-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setBotEnabled(next);
    setTogglingBot(false);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  async function sendReply() {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    setError("");
    try {
      const channel = isWhatsApp(selected.user_id) ? "whatsapp" : "instagram";
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.user_id, text: replyText.trim(), channel }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReplyText("");
      await loadConversations();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  }

  function stripMarker(text: string) {
    return text.replace(/\s*\[KAYIT_TAMAMLANDI\][\s\S]*$/, "").trim();
  }

  const lastMessage = (conv: Conversation) => {
    const msgs = (conv.messages || []).filter(m => m.role !== "system" && m.content && !m.content.startsWith("__"));
    if (!msgs.length) return "—";
    const text = stripMarker(msgs[msgs.length - 1].content || "");
    return text.slice(0, 60) + (text.length > 60 ? "…" : "");
  };

  return (
    <>
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — konuşma listesi */}
      <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 bg-white border-r border-gray-200`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Konuşmalar</h1>
            <p className="text-xs text-gray-400">{conversations.length} konuşma</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBot}
              disabled={togglingBot}
              title={botEnabled ? "Botu durdur" : "Botu başlat"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${botEnabled ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${botEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-xs font-medium ${botEnabled ? "text-green-600" : "text-gray-400"}`}>
              {botEnabled ? "Bot açık" : "Bot kapalı"}
            </span>
            <button
              onClick={openNewConv}
              className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
              title="Yeni konuşma başlat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={loadConversations}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Yenile"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Yükleniyor...</div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <MessageCircle size={40} className="mb-2 opacity-40" />
              <p className="text-sm">Henüz konuşma yok</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => setSelected(conv)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selected?.user_id === conv.user_id ? "bg-blue-50 border-l-4 border-l-[#3a8fbf]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isWhatsApp(conv.user_id) ? "bg-green-100 text-green-600" : "bg-pink-100 text-pink-600"
                  }`}>
                    <span className="text-xs font-bold">{isWhatsApp(conv.user_id) ? "WA" : "IG"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-800 truncate">
                        {formatPhone(conv.user_id)}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{timeAgo(conv.updated_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{lastMessage(conv)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Sohbet alanı */}
      <div className={`${selected ? "flex" : "hidden lg:flex"} flex-1 flex-col bg-gray-50`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
            <MessageCircle size={56} className="opacity-30" />
            <p>Bir konuşma seçin</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <ChevronLeft size={20} />
              </button>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                isWhatsApp(selected.user_id) ? "bg-green-100 text-green-600" : "bg-pink-100 text-pink-600"
              }`}>
                <span className="text-xs font-bold">{isWhatsApp(selected.user_id) ? "WA" : "IG"}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{formatPhone(selected.user_id)}</p>
                <p className="text-xs text-gray-400">
                  {isWhatsApp(selected.user_id) ? "WhatsApp" : "Instagram"} · {selected.messages?.length || 0} mesaj
                </p>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(selected.messages || []).filter(m => m.role !== "system" && m.content).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "assistant" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[75%] ${msg.role === "assistant" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "assistant" ? "bg-[#3a8fbf] text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-[#3a8fbf] text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}>
                      {msg.mediaId ? (
                        <a
                          href={`/api/admin/whatsapp/media?id=${msg.mediaId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium hover:opacity-80"
                        >
                          {msg.content}
                        </a>
                      ) : (
                        stripMarker(msg.content)
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Cevap kutusu */}
            <div className="bg-white border-t border-gray-200 p-3">
              {error && (
                <p className="text-red-500 text-xs mb-2 px-1">{error}</p>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  placeholder="Mesajınızı yazın... (Enter gönderin, Shift+Enter yeni satır)"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a8fbf] focus:border-transparent"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="p-3 bg-[#3a8fbf] text-white rounded-xl hover:bg-[#2d7aa8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send size={18} className={sending ? "opacity-50" : ""} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Yeni Konuşma Modalı */}

    {showNewConv && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Yeni WhatsApp Konuşması</h2>
            <button onClick={() => setShowNewConv(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Telefon Numarası</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="05xx xxx xx xx veya 905xx..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a8fbf]"
              />
              <p className="text-xs text-gray-400 mt-1">0 ile başlıyorsa otomatik 90 eklenir</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Şablon Mesaj</label>
              {templates.length === 0 ? (
                <p className="text-sm text-gray-400">Yükleniyor...</p>
              ) : (
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a8fbf]"
                >
                  <option value="">Şablon seçin</option>
                  {templates.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.language})
                    </option>
                  ))}
                </select>
              )}
            </div>
            {newConvError && <p className="text-red-500 text-xs">{newConvError}</p>}
          </div>
          <div className="px-5 pb-5 flex gap-2 justify-end">
            <button
              onClick={() => setShowNewConv(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              onClick={startConversation}
              disabled={startingConv || !newPhone.trim() || !selectedTemplate}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={14} />
              {startingConv ? "Gönderiliyor..." : "Mesaj Gönder"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
