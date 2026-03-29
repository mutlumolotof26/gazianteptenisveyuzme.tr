import type { Metadata } from "next";
import { Waves, Clock, Users, Droplets, Star, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/db";
import SeansBasvuruForm from "./SeansBasvuruForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gaziantep Yüzme Kursu | Olimpik Yüzme Havuzu ve Programlar",
  description: "Gaziantep yüzme kursu — çocuk, bebek ve yetişkin yüzme programları. Olimpik yüzme havuzu, uzman antrenörler. Şehitkamil, Gaziantep'te yüzme öğrenin.",
  keywords: [
    "Gaziantep yüzme kursu",
    "Gaziantep yüzme havuzu",
    "yüzme kursu Gaziantep",
    "çocuk yüzme kursu Gaziantep",
    "bebek yüzme Gaziantep",
    "yetişkin yüzme kursu Gaziantep",
    "olimpik yüzme havuzu Gaziantep",
    "yüzme okulu Gaziantep",
    "Şehitkamil yüzme kursu",
    "Gaziantep yüzme okulu",
  ],
  openGraph: {
    title: "Gaziantep Yüzme Kursu | Olimpik Yüzme Havuzu | GTY Spor Kulübü",
    description: "Çocuk, bebek ve yetişkin yüzme programları. Şehitkamil, Gaziantep'te olimpik yüzme havuzu ve uzman antrenörler.",
  },
};

async function getYuzmeCoaches() {
  return prisma.coach.findMany({
    where: { aktif: true, spor: { in: ["yuzme", "her_ikisi"] } },
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
  });
}

async function getSeanslar() {
  return prisma.session.findMany({
    where: { aktif: true },
    include: { coach: { select: { id: true, ad: true } } },
    orderBy: [{ sira: "asc" }, { gun: "asc" }, { baslangic: "asc" }],
  });
}

const gunSirasi = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const seviyeLabel: Record<string, string> = {
  baslangic: "Başlangıç",
  orta: "Orta",
  ileri: "İleri",
  her_seviye: "Her Seviye",
};

const seviyeColor: Record<string, string> = {
  baslangic: "bg-orange-50 text-[#e5500a]",
  orta: "bg-yellow-100 text-yellow-700",
  ileri: "bg-red-100 text-red-700",
  her_seviye: "bg-[#e0f3fc] text-[#3a8fbf]",
};

const yuzmeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "Gaziantep Yüzme Kursu",
      description: "Gaziantep'te çocuk, bebek ve yetişkin yüzme kursları. Olimpik yüzme havuzu, uzman antrenörler. Şehitkamil, Gaziantep.",
      url: "https://gazianteptenisveyuzme.tr/yuzme",
      provider: {
        "@type": "SportsClub",
        name: "GTY Gaziantep Tenis ve Yüzme Spor Kulübü",
        url: "https://gazianteptenisveyuzme.tr",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Batıkent, Muhsin Yazıcıoğlu Cd. No:18",
          addressLocality: "Şehitkamil",
          addressRegion: "Gaziantep",
          postalCode: "27560",
          addressCountry: "TR",
        },
        telephone: "+905512458274",
      },
      hasCourseInstance: [
        { "@type": "CourseInstance", name: "Yüzme Okulu (Baby)", courseMode: "Onsite", courseWorkload: "PT30M", audience: { "@type": "Audience", audienceType: "2-4 yaş çocuklar" } },
        { "@type": "CourseInstance", name: "Küçükler Programı", courseMode: "Onsite", courseWorkload: "PT45M", audience: { "@type": "Audience", audienceType: "5-8 yaş çocuklar" } },
        { "@type": "CourseInstance", name: "Çocuk Programı", courseMode: "Onsite", courseWorkload: "PT60M", audience: { "@type": "Audience", audienceType: "9-14 yaş çocuklar" } },
        { "@type": "CourseInstance", name: "Yetişkin Yüzme Kursu", courseMode: "Onsite", courseWorkload: "PT60M", audience: { "@type": "Audience", audienceType: "18 yaş üstü yetişkinler" } },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Gaziantep'te yüzme kursu nerede var?",
          acceptedAnswer: { "@type": "Answer", text: "GTY Spor Kulübü, Batıkent Muhsin Yazıcıoğlu Cd. No:18, Şehitkamil, Gaziantep adresinde olimpik yüzme havuzu ve yüzme kursları sunmaktadır." },
        },
        {
          "@type": "Question",
          name: "Çocuklar için Gaziantep yüzme kursu var mı?",
          acceptedAnswer: { "@type": "Answer", text: "Evet. GTY Spor Kulübü'nde 2 yaşından itibaren bebek yüzme, çocuk yüzme okulu ve 9-14 yaş çocuk programları mevcuttur." },
        },
        {
          "@type": "Question",
          name: "Gaziantep yüzme kursu ücretleri ne kadar?",
          acceptedAnswer: { "@type": "Answer", text: "Yüzme kursu ücretleri için GTY Spor Kulübü'nü +90 551 245 82 74 numaralı telefondan veya web sitesindeki iletişim formu aracılığıyla arayabilirsiniz." },
        },
        {
          "@type": "Question",
          name: "Yetişkinler için yüzme kursu var mı?",
          acceptedAnswer: { "@type": "Answer", text: "Evet. GTY Spor Kulübü'nde 18 yaş üstü yetişkinler için haftada 3 gün, 60 dakikalık yüzme kursları ve özel dersler verilmektedir." },
        },
        {
          "@type": "Question",
          name: "Havuz kaç metre?",
          acceptedAnswer: { "@type": "Answer", text: "GTY Spor Kulübü'nde 50 metre olimpik yüzme havuzu, 25 metre ısınma havuzu ve çocuklar için güvenli çocuk havuzu bulunmaktadır. Havuzlar yıl boyu 28°C sıcaklıkta tutulmaktadır." },
        },
      ],
    },
  ],
};

export default async function YuzmePage() {
  const [coaches, seanslar] = await Promise.all([getYuzmeCoaches(), getSeanslar()]);

  // Group sessions by day
  const seansByGun = gunSirasi.reduce<Record<string, typeof seanslar>>((acc, gun) => {
    const list = seanslar.filter((s) => s.gun.toLowerCase() === gun.toLowerCase());
    if (list.length > 0) acc[gun] = list;
    return acc;
  }, {});

  const programs = [
    { title: "Yüzme Okulu (Baby)", age: "2-4 yaş", saat: "Haftada 2 gün", sure: "30 dk", seviye: "Başlangıç" },
    { title: "Küçükler Programı", age: "5-8 yaş", saat: "Haftada 3 gün", sure: "45 dk", seviye: "Başlangıç" },
    { title: "Çocuk Programı", age: "9-14 yaş", saat: "Haftada 3 gün", sure: "60 dk", seviye: "Her seviye" },
    { title: "Yetişkin Kursu", age: "18 yaş üstü", saat: "Haftada 3 gün", sure: "60 dk", seviye: "Her seviye" },
    { title: "Rekabetçi Yüzme", age: "10 yaş üstü", saat: "Haftada 5 gün", sure: "90 dk", seviye: "İleri" },
    { title: "Özel Ders", age: "Tüm yaşlar", saat: "Randevuya göre", sure: "60 dk", seviye: "Her seviye" },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(yuzmeJsonLd) }}
      />
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1d3a5c] to-[#3a8fbf] text-white pb-16 pt-36">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <Waves size={48} className="text-cyan-300" />
            <div>
              <h1 className="text-4xl font-bold mb-1">Gaziantep Yüzme Kursu</h1>
              <p className="text-[#8fd0f0] text-lg">Olimpik yüzme havuzu, çocuk ve yetişkin yüzme kursları – Şehitkamil, Gaziantep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Havuz Bilgisi */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] mb-10 text-center">Havuz Tesislerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Droplets size={32} className="text-[#3a8fbf]" />, title: "50m Olimpik Yüzme Havuzu", desc: "Uluslararası standartta olimpik yüzme havuzu" },
              { icon: <Waves size={32} className="text-cyan-600" />, title: "25m Isınma Havuzu", desc: "Antrenman öncesi ısınma havuzu" },
              { icon: <Users size={32} className="text-[#5aaddc]" />, title: "Çocuk Havuzu", desc: "Küçük yüzücüler için güvenli havuz" },
              { icon: "🌡️", title: "Isıtmalı Havuz", desc: "Yıl boyu 28°C sabit sıcaklık" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
                <div className="text-4xl mb-3 flex justify-center">{typeof item.icon === "string" ? item.icon : item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Haftalık Seans Programı */}
      {Object.keys(seansByGun).length > 0 && (
        <section className="py-16 bg-[#f0f9ff]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CalendarDays size={28} className="text-[#3a8fbf]" />
              <h2 className="text-3xl font-bold text-[#1d3a5c]">Haftalık Seans Programı</h2>
            </div>
            <p className="text-center text-gray-500 mb-10">İlgilendiğiniz seansı seçip başvurunuzu yapabilirsiniz</p>

            <div className="space-y-8">
              {gunSirasi.filter((gun) => seansByGun[gun]).map((gun) => (
                <div key={gun}>
                  <h3 className="text-xl font-bold text-[#163050] mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[#f0f9ff]0 rounded-full inline-block" />
                    {gun}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seansByGun[gun].map((seans) => (
                      <div key={seans.id} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-gray-800">{seans.program}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${seviyeColor[seans.seviye] ?? "bg-gray-100 text-gray-600"}`}>
                            {seviyeLabel[seans.seviye] ?? seans.seviye}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-500 mb-1">
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-[#5aaddc] flex-shrink-0" />
                            <span>{seans.baslangic} – {seans.bitis}</span>
                          </div>
                          {seans.coach && (
                            <div className="flex items-center gap-2">
                              <Star size={13} className="text-amber-400 flex-shrink-0" />
                              <span>{seans.coach.ad}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-[#5aaddc] flex-shrink-0" />
                            <span>Kapasite: {seans.kapasite} kişi</span>
                          </div>
                        </div>
                        <SeansBasvuruForm session={seans} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programlar */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] text-center mb-3">Yüzme Programları</h2>
          <p className="text-center text-gray-500 mb-10">2 yaşından itibaren tüm yaşlara yüzme eğitimi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div key={prog.title} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-blue-400 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">{prog.title}</h3>
                  <span className="text-xs bg-[#e0f3fc] text-[#3a8fbf] px-2 py-1 rounded-full font-semibold">{prog.seviye}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#3a8fbf]" />
                    <span>{prog.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#3a8fbf]" />
                    <span>{prog.saat} - {prog.sure}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Antrenörler */}
      {coaches.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#1d3a5c] text-center mb-10">Antrenörlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <div key={coach.id} className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-[#e0f3fc] flex items-center justify-center border-2 border-[#c7e9f7]">
                    {coach.resimUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.resimUrl} alt={coach.ad} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={36} className="text-[#5aaddc]" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{coach.ad}</h3>
                  <p className="text-[#3a8fbf] font-medium text-sm mt-1">{coach.unvan}</p>
                  {coach.deneyim && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-gray-400 text-sm">
                      <Star size={12} fill="currentColor" className="text-amber-400" />
                      {coach.deneyim}
                    </div>
                  )}
                  {coach.biyografi && (
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">{coach.biyografi}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SSS / FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] text-center mb-10">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              { q: "Gaziantep'te yüzme kursu nerede var?", a: "GTY Spor Kulübü, Batıkent Muhsin Yazıcıoğlu Cd. No:18, Şehitkamil, Gaziantep adresinde olimpik yüzme havuzu ve yüzme kursları sunmaktadır." },
              { q: "Çocuklar için yüzme kursu var mı?", a: "Evet. 2 yaşından itibaren bebek yüzme, 5-8 yaş küçükler programı ve 9-14 yaş çocuk programları mevcuttur." },
              { q: "Yetişkinler için yüzme kursu var mı?", a: "Evet. 18 yaş üstü yetişkinler için haftada 3 gün, 60 dakikalık kurslar ve özel ders seçenekleri sunulmaktadır." },
              { q: "Havuz kaç metre?", a: "50m olimpik yüzme havuzu, 25m ısınma havuzu ve çocuk havuzu bulunmaktadır. Tüm havuzlar yıl boyu 28°C sıcaklıkta tutulur." },
              { q: "Yüzme kursu ücretleri ne kadar?", a: "Güncel ücretler için 0551 245 82 74 numaralı hattı arayabilir veya iletişim formundan bize ulaşabilirsiniz." },
            ].map((item) => (
              <details key={item.q} className="bg-[#f0f9ff] rounded-xl p-5 group">
                <summary className="font-semibold text-[#1d3a5c] cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-[#5aaddc] text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Gaziantep'te Yüzme Öğrenmek */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] mb-6">Gaziantep'te Yüzme Öğrenmek</h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              Gaziantep'te yüzme kursu arayanlar için GTY Gençlik Spor Kulübü, Şehitkamil ilçesinde profesyonel yüzme eğitimi sunmaktadır.
              50 metre olimpik yüzme havuzumuz ve uzman antrenör kadromuzla 2 yaşından itibaren her yaş grubuna yüzme öğretiyoruz.
            </p>
            <p>
              Şehitkamil, Batıkent, Güneykent, Gaziantep merkez ve çevre mahallelerden öğrencilerimiz kulübümüze ulaşmaktadır.
              Tesisimiz hafta içi ve hafta sonu açık olup geniş otopark imkânı sunmaktadır.
            </p>
            <p>
              Çocuğunuzun yüzme öğrenmesi için doğru yaş 2-4 yaştır. GTY Spor Kulübü'ndeki bebek yüzme programımız,
              su korkusunu yenmeye ve temel yüzme becerilerini kazanmaya yönelik tasarlanmıştır.
              Yetişkinler için de başlangıçtan ileri seviyeye kadar kurslarımız mevcuttur.
            </p>
            <p>
              Gaziantep yüzme kursu fiyatları hakkında bilgi almak için <strong>0551 245 82 74</strong> numaralı hattımızı arayabilir
              veya aşağıdaki iletişim formunu kullanabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Neden GTY */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1d3a5c] mb-10 text-center">Neden GTY Spor Kulübü?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Olimpik Yüzme Havuzu", desc: "50m olimpik, 25m ısınma ve çocuk havuzu ile tam donanımlı tesis. Yıl boyu 28°C." },
              { title: "Uzman Antrenörler", desc: "Milli sporcu ve federasyon lisanslı antrenörlerden birebir ilgi." },
              { title: "Her Yaşa Uygun Program", desc: "2 yaşından itibaren bebek, çocuk, genç ve yetişkin yüzme kursları." },
              { title: "Şehitkamil'de Merkezi Konum", desc: "Batıkent, Güneykent ve Gaziantep merkeze kolay ulaşım. Geniş otopark." },
              { title: "Küçük Grup Eğitimi", desc: "Az kişilik gruplarla kişisel ilgi ve hızlı gelişim." },
              { title: "Yıl Boyu Açık", desc: "Kapalı havuz sayesinde kış-yaz aralıksız yüzme eğitimi." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 bg-[#f0f9ff] rounded-xl">
                <div className="w-2 h-2 rounded-full bg-[#f0f9ff]0 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#1d3a5c] mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyat */}
      <section className="py-16 bg-[#f0f9ff]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1d3a5c] mb-4">Gaziantep Yüzme Kursu Fiyatları</h2>
          <p className="text-gray-600 mb-8">
            Yüzme kursu ücretleri program türüne, seans sayısına ve yaş grubuna göre değişmektedir.
            Güncel fiyat bilgisi ve kayıt için bizi arayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:05512458274" className="bg-[#3a8fbf] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#3a8fbf] transition-colors">
              0551 245 82 74
            </a>
            <a href="/iletisim" className="bg-white text-[#3a8fbf] border border-[#3a8fbf] px-8 py-3 rounded-lg font-bold hover:bg-[#f0f9ff] transition-colors">
              İletişim Formu
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#3a8fbf] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Yüzmeye Başlayın</h2>
          <p className="text-[#8fd0f0] mb-8">Ücretsiz deneme dersi için kaydolun.</p>
          <a href="/iletisim" className="bg-amber-400 text-[#1d3a5c] px-8 py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors inline-block">
            İletişime Geç
          </a>
        </div>
      </section>
    </div>
  );
}
