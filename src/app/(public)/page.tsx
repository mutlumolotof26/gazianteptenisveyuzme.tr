import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Calendar, MapPin, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getLatestNews() {
  return prisma.news.findMany({ where: { aktif: true }, orderBy: { yayinTarihi: "desc" }, take: 3 });
}
async function getUpcomingEvents() {
  return prisma.event.findMany({ where: { aktif: true, tarih: { gte: new Date() } }, orderBy: { tarih: "asc" }, take: 3 });
}
async function getStats() {
  const [members, coaches, events] = await Promise.all([
    prisma.member.count({ where: { durum: "aktif" } }),
    prisma.coach.count({ where: { aktif: true } }),
    prisma.event.count({ where: { aktif: true } }),
  ]);
  return { members, coaches, events };
}
async function getSettings() {
  try { return await prisma.siteSettings.findUnique({ where: { id: 1 } }); } catch { return null; }
}

export default async function HomePage() {
  const [news, events, stats, settings] = await Promise.all([
    getLatestNews(), getUpcomingEvents(), getStats(), getSettings(),
  ]);

  const logoUrl = settings?.logoUrl ?? "/logo.png";

  return (
    <div>

      {/* ===== HERO ===== */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, var(--navy-dark) 0%, var(--navy) 50%, #1a4a7a 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingTop: 80,
      }}>
        {/* Radial glows */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 75% 25%, rgba(229,80,10,.18) 0%, transparent 50%), radial-gradient(circle at 15% 75%, rgba(90,173,220,.18) 0%, transparent 50%)",
        }} />
        {/* Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => <div key={i} className="bubble" />)}
        </div>
        {/* Wave bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 100, zIndex: 1,
          background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100'%3E%3Cpath fill='%23f4f7fb' d='M0,50L48,55C96,60,192,70,288,65C384,60,480,40,576,35C672,30,768,40,864,50C960,60,1056,70,1152,65C1248,60,1344,40,1392,30L1440,20L1440,100L0,100Z'/%3E%3C/svg%3E\") no-repeat bottom / cover",
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center w-full" style={{ paddingBottom: 120 }}>
          {/* Logo */}
          <div className="animate-float mx-auto mb-6" style={{
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            border: "3px solid rgba(255,255,255,.2)",
            padding: 8,
            boxShadow: "0 8px 40px rgba(0,0,0,.3), 0 0 0 8px rgba(229,80,10,.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image src={logoUrl} alt="Logo" width={144} height={144} className="w-full h-full object-contain rounded-full" priority unoptimized />
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-sm font-semibold" style={{
            background: "rgba(229,80,10,.2)", border: "1px solid rgba(229,80,10,.4)", color: "#ffb38a",
            fontFamily: "Montserrat,sans-serif",
          }}>
            ★ Gaziantep&apos;in Köklü Spor Kulübü
          </span>

          <h1 className="font-black text-white mb-5 leading-tight" style={{ fontSize: "clamp(2.2rem,5.5vw,4rem)", fontFamily: "Montserrat,sans-serif" }}>
            Sporda Mükemmelliğe<br />
            <span style={{ background: "linear-gradient(90deg,var(--orange),var(--blue-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ulaşmanın Adresi
            </span>
          </h1>
          <p className="mb-8 text-lg mx-auto" style={{ color: "rgba(255,255,255,.72)", maxWidth: 540 }}>
            Profesyonel tenis kortları ve olimpik yüzme havuzlarıyla her yaşa uygun spor deneyimi sunuyoruz.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-14">
            <Link href="/yuzme" className="font-bold rounded-full text-white transition-all hover:-translate-y-0.5"
              style={{ padding: "14px 32px", background: "var(--orange)", border: "2px solid var(--orange)", fontFamily: "Montserrat,sans-serif", boxShadow: "0 8px 24px rgba(229,80,10,.4)" }}>
              Programları Keşfet
            </Link>
            <Link href="/hakkimizda" className="font-bold rounded-full text-white transition-all hover:-translate-y-0.5"
              style={{ padding: "14px 32px", background: "transparent", border: "2px solid rgba(255,255,255,.6)", fontFamily: "Montserrat,sans-serif" }}>
              Hakkımızda
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 justify-center items-center flex-wrap">
            {[
              { value: "2014", label: "Kuruluş Yılı" },
              { value: `${stats.members}+`, label: "Aktif Üye" },
              { value: `${stats.coaches}`, label: "Uzman Antrenör" },
              { value: `${stats.events}+`, label: "Etkinlik" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="block font-black text-white" style={{ fontSize: "2.2rem", fontFamily: "Montserrat,sans-serif" }}>{s.value}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--blue-light)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HIZMETLER ===== */}
      <section style={{ padding: "96px 0", background: "var(--light)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Hizmetlerimiz</span>
            <h2 className="font-black" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--navy)", fontFamily: "Montserrat,sans-serif" }}>
              Dünya Standartlarında<br />Spor Altyapısı
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Yüzme */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ border: "2px solid transparent" }}>
              <div className="p-8 text-white" style={{ background: "linear-gradient(135deg,var(--navy),var(--blue-dark))" }}>
                <div className="text-5xl mb-4">🏊</div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "Montserrat,sans-serif" }}>Yüzme</h3>
                <p style={{ color: "var(--blue-light)" }}>Olimpik standartlarda yüzme havuzu ve eğitim</p>
              </div>
              <div className="p-6">
                <ul className="flex flex-col gap-2 mb-6">
                  {["50m olimpik yüzme havuzu", "Çocuk ve yetişkin kursları", "Yüzme okulu programı", "Profesyonel antrenörler"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--gray)" }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--blue-dark)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/yuzme" className="flex items-center gap-1 font-semibold text-sm hover:gap-2 transition-all"
                  style={{ color: "var(--navy)" }}>
                  Detaylı Bilgi <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Tenis */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
              style={{ border: "2px solid var(--orange)", transform: "translateY(-8px)" }}>
              <div className="relative">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--orange)", fontFamily: "Montserrat,sans-serif" }}>
                  Profesyonel
                </span>
              </div>
              <div className="p-8 text-white" style={{ background: "linear-gradient(135deg,var(--orange-dark),var(--orange))" }}>
                <div className="text-5xl mb-4">🎾</div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "Montserrat,sans-serif" }}>Tenis</h3>
                <p className="text-orange-100">Profesyonel tenis kortları ve uzman antrenörler</p>
              </div>
              <div className="p-6">
                <ul className="flex flex-col gap-2 mb-6">
                  {["6 adet profesyonel tenis kortu", "Bireysel ve grup dersleri", "Tüm yaş grupları için program", "Turnuva organizasyonları"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--gray)" }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--orange)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/tenis" className="flex items-center gap-1 font-semibold text-sm hover:gap-2 transition-all"
                  style={{ color: "var(--orange)" }}>
                  Detaylı Bilgi <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Destek */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="p-8 text-white" style={{ background: "linear-gradient(135deg,#2d6a4f,#40916c)" }}>
                <div className="text-5xl mb-4">🏋️</div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "Montserrat,sans-serif" }}>Destek Tesisleri</h3>
                <p className="text-green-100">Tam donanımlı spor merkezi</p>
              </div>
              <div className="p-6">
                <ul className="flex flex-col gap-2 mb-6">
                  {["Fitness salonu", "Soyunma odaları & sauna", "Kafeterya", "Ücretsiz otopark", "Güvenli aile ortamı"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--gray)" }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#40916c" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/iletisim" className="flex items-center gap-1 font-semibold text-sm hover:gap-2 transition-all"
                  style={{ color: "#2d6a4f" }}>
                  Bilgi Al <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEDEN BİZ ===== */}
      <section style={{ padding: "96px 0", background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-tag">Hakkımızda</span>
              <h2 className="font-black mb-5 leading-tight" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--navy)", fontFamily: "Montserrat,sans-serif" }}>
                Gaziantep&apos;te Sporun<br />Merkezi Olarak Yıllardır
              </h2>
              <p className="mb-4" style={{ color: "var(--gray)" }}>
                2014 yılında kurulan kulübümüz, Gaziantep&apos;te tenis ve yüzme sporlarının gelişimine öncülük etmektedir.
                Modern tesislerimiz ve deneyimli kadromuzla her yaştan sporcu için mükemmel bir ortam sunuyoruz.
              </p>
              <p className="mb-8" style={{ color: "var(--gray)" }}>
                Milli takım sporcuları yetiştirmiş kulübümüz, amatörden profesyonele her seviyede eğitim imkânı sağlamaktadır.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Olimpik standartlarda tesisler",
                  "Federasyon onaylı eğitmenler",
                  "Çocuk, genç ve yetişkin programları",
                  "Yıllık turnuvalar ve etkinlikler",
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle size={20} style={{ color: "var(--orange)", flexShrink: 0 }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/hakkimizda" className="inline-flex items-center gap-2 mt-8 font-bold rounded-full text-white"
                style={{ padding: "14px 32px", background: "var(--navy)", fontFamily: "Montserrat,sans-serif" }}>
                Daha Fazla Bilgi <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: "🏊", label: "Olimpik Havuz", bg: "linear-gradient(135deg,var(--navy),var(--blue-dark))" },
                { emoji: "🎾", label: "Tenis Kortları", bg: "linear-gradient(135deg,var(--orange-dark),var(--orange))" },
                { emoji: "🏆", label: "Turnuvalar", bg: "linear-gradient(135deg,#d4a017,#e76f51)" },
                { emoji: "👨‍👩‍👧", label: "Aile Ortamı", bg: "linear-gradient(135deg,#2d6a4f,#40916c)" },
              ].map(card => (
                <div key={card.label} className="rounded-2xl flex flex-col items-center justify-center gap-3 text-white font-bold text-center"
                  style={{ height: 160, background: card.bg, fontFamily: "Montserrat,sans-serif" }}>
                  <span style={{ fontSize: "2.5rem" }}>{card.emoji}</span>
                  <span className="text-sm">{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SON HABERLER ===== */}
      {news.length > 0 && (
        <section style={{ padding: "96px 0", background: "var(--light)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="section-tag">Haberler</span>
                <h2 className="font-black" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "var(--navy)", fontFamily: "Montserrat,sans-serif" }}>
                  Son Haberler
                </h2>
              </div>
              <Link href="/haberler" className="flex items-center gap-1 font-semibold text-sm"
                style={{ color: "var(--orange)" }}>
                Tümü <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                  style={{ borderTop: "4px solid var(--blue)" }}>
                  {item.resimUrl
                    ? <img src={item.resimUrl} alt={item.baslik} className="w-full h-48 object-cover" />
                    : <div className="w-full h-48 flex items-center justify-center text-5xl"
                        style={{ background: "linear-gradient(135deg,var(--navy),var(--blue-dark))" }}>🏊</div>
                  }
                  <div className="p-5">
                    <div className="text-xs mb-2" style={{ color: "var(--gray)" }}>
                      {new Date(item.yayinTarihi).toLocaleDateString("tr-TR")}
                    </div>
                    <h3 className="font-bold mb-2 line-clamp-2" style={{ color: "var(--navy)" }}>{item.baslik}</h3>
                    {item.ozet && <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--gray)" }}>{item.ozet}</p>}
                    <Link href={`/haberler/${item.id}`} className="flex items-center gap-1 text-sm font-semibold"
                      style={{ color: "var(--orange)" }}>
                      Devamını Oku <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ETKİNLİKLER ===== */}
      {events.length > 0 && (
        <section style={{ padding: "96px 0", background: "linear-gradient(160deg,var(--navy-dark),var(--navy))" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="section-tag" style={{ background: "rgba(229,80,10,.2)", color: "#ffb38a" }}>Etkinlikler</span>
                <h2 className="font-black text-white" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontFamily: "Montserrat,sans-serif" }}>
                  Yaklaşan Etkinlikler
                </h2>
              </div>
              <Link href="/etkinlikler" className="flex items-center gap-1 font-semibold text-sm"
                style={{ color: "var(--orange)" }}>
                Tümü <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--orange)", fontFamily: "Montserrat,sans-serif" }}>
                    {event.kategori === "tenis" ? "Tenis" : event.kategori === "yuzme" ? "Yüzme" : event.kategori === "turnuva" ? "Turnuva" : "Etkinlik"}
                  </div>
                  <h3 className="font-bold text-lg text-white mb-3" style={{ fontFamily: "Montserrat,sans-serif" }}>{event.baslik}</h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--blue-light)" }}>
                    <Calendar size={14} />
                    {new Date(event.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  {event.yer && (
                    <div className="flex items-center gap-2 text-sm mt-1" style={{ color: "rgba(255,255,255,.5)" }}>
                      <MapPin size={13} /> {event.yer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ÜYELİK CTA ===== */}
      <section style={{ padding: "96px 0", background: "linear-gradient(135deg,var(--orange-dark),var(--orange))" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", fontFamily: "Montserrat,sans-serif" }}>
            Ailemize Katılın
          </h2>
          <p className="text-lg mb-8 text-orange-100">
            Üye olun, profesyonel antrenörlerimiz ve modern tesislerimizden yararlanın.
          </p>
          <Link href="/uyelik" className="inline-block font-bold text-lg rounded-full transition-all hover:-translate-y-1"
            style={{ padding: "16px 44px", background: "var(--navy)", color: "#fff", fontFamily: "Montserrat,sans-serif", boxShadow: "0 8px 24px rgba(15,31,48,.4)" }}>
            Hemen Üye Ol
          </Link>
        </div>
      </section>

    </div>
  );
}
