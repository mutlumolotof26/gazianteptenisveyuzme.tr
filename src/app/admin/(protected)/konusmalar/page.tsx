"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, ChevronLeft, RefreshCw, User, Bot, Plus, X, Trash2, Archive, ArchiveRestore } from "lucide-react";

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
  ts?: number;
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

function getDisplayName(conv: Conversation) {
  const nameMsg = (conv.messages || []).find(m => m.role === "system" && m.content?.startsWith("__NAME__:"));
  return nameMsg ? nameMsg.content.slice(9) : null;
}

function getConvLabels(conv: Conversation) {
  const labels: { text: string; cls: string }[] = [];
  const msgs = conv.messages || [];
  const hasRegistered = msgs.some(m => m.role === "system" && m.content === "__REGISTERED__");
  const memberType = msgs.find(m => m.role === "system" && m.content?.startsWith("__MEMBER_TYPE__:"))?.content?.slice(15);
  const source = msgs.find(m => m.role === "system" && m.content?.startsWith("__SOURCE__:"))?.content?.slice(10);
  if (hasRegistered) labels.push({ text: "Ön Kayıt", cls: "bg-green-100 text-green-700" });
  if (memberType === "takim") labels.push({ text: "Takım", cls: "bg-purple-100 text-purple-700" });
  if (memberType === "kursiyerler") labels.push({ text: "Kursiyer", cls: "bg-blue-100 text-blue-700" });
  if (source) labels.push({ text: "Reklam", cls: "bg-orange-100 text-orange-700" });
  return labels;
}

function isWhatsApp(userId: string) {
  return /^\d{10,15}$/.test(userId);
}

function getInitials(conv: Conversation) {
  const name = getDisplayName(conv);
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return isWhatsApp(conv.user_id) ? "WA" : "IG";
}

function getAvatarColors(conv: Conversation) {
  const name = getDisplayName(conv);
  if (name) {
    // İsme göre sabit renk seç
    const colors = [
      "bg-violet-100 text-violet-700",
      "bg-sky-100 text-sky-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
      "bg-teal-100 text-teal-700",
      "bg-orange-100 text-orange-700",
      "bg-indigo-100 text-indigo-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
    return colors[hash % colors.length];
  }
  return isWhatsApp(conv.user_id) ? "bg-green-100 text-green-600" : "bg-pink-100 text-pink-600";
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
  const [resettingBot, setResettingBot] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startingConv, setStartingConv] = useState(false);
  const [newConvError, setNewConvError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [newMsgMode, setNewMsgMode] = useState<"template" | "free">("free");
  const [newFreeText, setNewFreeText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadConversations(archived = showArchived, silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/konusmalar${archived ? "?archived=true" : ""}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConversations(data);
      if (selected) {
        const updated = data.find((c: Conversation) => c.user_id === selected.user_id);
        if (updated) setSelected(updated);
        else setSelected(null);
      }
    } catch (e: unknown) {
      if (!silent) setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function archiveConv(conv: Conversation, archive: boolean, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch("/api/admin/konusmalar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: conv.user_id, archive }),
    });
    if (selected?.user_id === conv.user_id) setSelected(null);
    loadConversations();
  }

  async function deleteConv(conv: Conversation, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`"${getDisplayName(conv) || formatPhone(conv.user_id)}" konuşmasını silmek istediğinizden emin misiniz?`)) return;
    await fetch("/api/admin/konusmalar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: conv.user_id }),
    });
    if (selected?.user_id === conv.user_id) setSelected(null);
    loadConversations();
  }

  useEffect(() => {
    loadConversations(showArchived);
    fetch("/api/admin/bot-settings")
      .then((r) => r.json())
      .then((d) => setBotEnabled(d.enabled ?? true));

    const interval = setInterval(() => {
      loadConversations(showArchived, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [showArchived]);

  async function openNewConv() {
    setNewConvError("");
    setNewPhone("");
    setSelectedTemplate("");
    setNewFreeText("");
    setShowNewConv(true);
    if (templates.length === 0) {
      const res = await fetch("/api/admin/whatsapp/templates");
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    }
  }

  async function startConversation() {
    if (!newPhone.trim()) return;
    const digits = newPhone.trim().replace(/\D/g, "");
    const to = digits.startsWith("90") ? digits : digits.startsWith("0") ? "9" + digits : "90" + digits;
    setStartingConv(true);
    setNewConvError("");
    try {
      if (newMsgMode === "free") {
        if (!newFreeText.trim()) return;
        const res = await fetch("/api/admin/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, text: newFreeText.trim(), channel: "whatsapp" }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
      } else {
        if (!selectedTemplate) return;
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
      }
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

  async function resetBotForConv() {
    if (!selected) return;
    setResettingBot(true);
    try {
      await fetch("/api/admin/reset-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.user_id }),
      });
      await loadConversations();
    } finally {
      setResettingBot(false);
    }
  }

  function convHasBlock(conv: Conversation) {
    return (conv.messages || []).some(m => m.role === "system" && (m.content === "__REGISTERED__" || m.content === "__ADMIN_TAKEOVER__"));
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
    const last = msgs[msgs.length - 1];
    const prefix = last.role === "assistant" ? "Bot: " : "";
    const text = stripMarker(last.content || "");
    return prefix + text.slice(0, 60) + (text.length > 60 ? "…" : "");
  };

  return (
    <>
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — konuşma listesi */}
      <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 bg-white border-r border-gray-200`}>
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Konuşmalar</h1>
              <p className="text-xs text-gray-400">{conversations.length} konuşma</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={openNewConv}
                className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                title="Yeni konuşma başlat"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`p-2 rounded-lg transition-colors ${showArchived ? "bg-amber-100 text-amber-600" : "hover:bg-gray-100 text-gray-500"}`}
                title={showArchived ? "Aktif konuşmaları göster" : "Arşivi göster"}
              >
                <Archive size={16} />
              </button>
              <button
                onClick={() => loadConversations()}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                title="Yenile"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBot}
              disabled={togglingBot}
              title={botEnabled ? "Botu durdur" : "Botu başlat"}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${botEnabled ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${botEnabled ? "translate-x-4" : "translate-x-1"}`} />
            </button>
            <span className={`text-xs font-medium ${botEnabled ? "text-green-600" : "text-gray-400"}`}>
              {botEnabled ? "Bot açık" : "Bot kapalı"}
            </span>
          </div>
        </div>
        {showArchived && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-medium flex items-center gap-1">
            <Archive size={12} /> Arşivlenmiş konuşmalar
          </div>
        )}

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
              <div
                key={conv.user_id}
                className={`group relative border-b border-gray-50 ${selected?.user_id === conv.user_id ? "bg-blue-50 border-l-4 border-l-[#3a8fbf]" : ""}`}
              >
                <button
                  onClick={() => setSelected(conv)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors pr-16"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColors(conv)}`}>
                      <span className="text-xs font-bold">{getInitials(conv)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="conv-name font-medium text-sm text-gray-800 truncate">
                          {getDisplayName(conv) || formatPhone(conv.user_id)}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{timeAgo(conv.updated_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{lastMessage(conv)}</p>
                      {getConvLabels(conv).length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {getConvLabels(conv).map(l => (
                            <span key={l.text} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${l.cls}`}>{l.text}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                {/* Sil / Arşiv butonları — hover'da görünür */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white/90 rounded-lg shadow-sm border border-gray-100 p-0.5">
                  <button
                    onClick={(e) => archiveConv(conv, !showArchived, e)}
                    title={showArchived ? "Arşivden çıkar" : "Arşivle"}
                    className="p-1.5 rounded hover:bg-amber-50 text-amber-500 transition-colors"
                  >
                    {showArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                  </button>
                  <button
                    onClick={(e) => deleteConv(conv, e)}
                    title="Sil"
                    className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
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
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColors(selected)}`}>
                <span className="text-xs font-bold">{getInitials(selected)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{getDisplayName(selected) || formatPhone(selected.user_id)}</p>
              {getDisplayName(selected) && <p className="text-xs text-gray-400">{formatPhone(selected.user_id)}</p>}
                <p className="text-xs text-gray-400">
                  {isWhatsApp(selected.user_id) ? "WhatsApp" : "Instagram"} · {selected.messages?.length || 0} mesaj
                </p>
              </div>
              {convHasBlock(selected) && (
                <button
                  onClick={resetBotForConv}
                  disabled={resettingBot}
                  title="Bot'u yeniden etkinleştir"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={resettingBot ? "animate-spin" : ""} />
                  Bot'u etkinleştir
                </button>
              )}
              <button
                onClick={(e) => archiveConv(selected, !showArchived, e)}
                title={showArchived ? "Arşivden çıkar" : "Arşivle"}
                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
              >
                {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              </button>
              <button
                onClick={(e) => deleteConv(selected, e)}
                title="Konuşmayı sil"
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(selected.messages || []).filter(m => m.role !== "system" && m.content).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "assistant" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[75%] ${msg.role === "assistant" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      msg.role === "assistant" ? "bg-[#3a8fbf] text-white" : getAvatarColors(selected)
                    }`}>
                      {msg.role === "assistant" ? <Bot size={14} /> : getInitials(selected)}
                    </div>
                    <div className="flex flex-col gap-1">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-[#3a8fbf] text-white rounded-br-sm"
                        : "chat-user-bubble bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}>
                      {msg.mediaType === "image" && msg.mediaId ? (
                        <img
                          src={`/api/admin/whatsapp/media?id=${msg.mediaId}`}
                          alt="Fotoğraf"
                          className="max-w-[240px] rounded-lg cursor-pointer"
                          onClick={() => window.open(`/api/admin/whatsapp/media?id=${msg.mediaId}`, "_blank")}
                        />
                      ) : msg.mediaId ? (
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
                    {msg.ts && (
                      <span className={`text-[10px] text-gray-400 px-1 ${msg.role === "assistant" ? "text-right" : "text-left"}`}>
                        {new Date(msg.ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        {new Date(msg.ts).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}
                      </span>
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
            {/* Mod seçici */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
              <button
                onClick={() => setNewMsgMode("free")}
                className={`flex-1 py-2 font-medium transition-colors ${newMsgMode === "free" ? "bg-[#3a8fbf] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Serbest Mesaj
              </button>
              <button
                onClick={() => setNewMsgMode("template")}
                className={`flex-1 py-2 font-medium transition-colors ${newMsgMode === "template" ? "bg-[#3a8fbf] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Şablon
              </button>
            </div>
            {newMsgMode === "free" ? (
              <div>
                <textarea
                  value={newFreeText}
                  onChange={(e) => setNewFreeText(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a8fbf] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Not: Serbest mesaj yalnızca son 24 saatte mesaj atan kişilere gönderilebilir.</p>
              </div>
            ) : (
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
            )}
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
              disabled={startingConv || !newPhone.trim() || (newMsgMode === "free" ? !newFreeText.trim() : !selectedTemplate)}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={14} />
              {startingConv ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
