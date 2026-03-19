import type { Metadata } from "next";
import { Award, Target, Heart, Users } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda | GTY Gaziantep Tenis ve Yüzme Spor Kulübü",
  description: "GTY Gaziantep Tenis ve Yüzme Spor Kulübü hakkında. 2014'ten bu yana Gaziantep'te yüzme kursu ve tenis eğitimi veriyoruz. Uzman kadromuz ve olimpik tesislerimizle tanışın.",
};

export default async function HakkimizdaPage() {
  const [uyeSayisi, antrenorSayisi] = await Promise.all([
    prisma.member.count({ where: { durum: "aktif" } }),
    prisma.coach.count({ where: { aktif: true } }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">Hakkımızda</h1>
          <p className="text-blue-200 text-lg">Gaziantep'in köklü spor kulübü</p>
        </div>
      </section>

      {/* Tarihçe */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Kulüp Tarihçemiz</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Gaziantep Tenis ve Yüzme Kulübü, 2014 yılında bir grup sporsever tarafından kurulmuştur.
                  Kuruluşundan bu yana şehrimizin spor hayatına önemli katkılar sağlamıştır.
                </p>
                <p>
                  Yıllar içinde büyüyerek gelişen kulübümüz, bugün {uyeSayisi} aktif üyesiyle
                  Gaziantep'in en köklü spor kulüplerinden biri haline gelmiştir.
                </p>
                <p>
                  Profesyonel antrenörlerimiz ve modern tesislerimizle her yaştan sporsevere
                  kaliteli eğitim sunmaya devam etmekteyiz.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "2014", label: "Kuruluş Yılı" },
                  { value: `${uyeSayisi}`, label: "Aktif Üye" },
                  { value: `${antrenorSayisi}`, label: "Antrenör" },
                  { value: "50+", label: "Turnuva" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-black text-blue-700">{stat.value}</div>
                    <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misyon & Vizyon */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-blue-700" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Misyonumuz</h3>
              <p className="text-gray-600 leading-relaxed">
                Her yaştan bireye kaliteli spor eğitimi sunarak sağlıklı bir toplumun oluşmasına
                katkı sağlamak ve Gaziantep'i sporda önemli bir merkez haline getirmek.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="text-amber-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Vizyonumuz</h3>
              <p className="text-gray-600 leading-relaxed">
                Türkiye'nin önde gelen tenis ve yüzme kulüplerinden biri olarak uluslararası
                standartlarda sporcular yetiştirmek ve bölgemizi sporda ön sıralara taşımak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-10">Değerlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Tutku", desc: "Spora olan sevgimiz ve bağlılığımız her zaman ön plandadır.", color: "red" },
              { icon: Users, title: "Topluluk", desc: "Birlikte güçlüyüz. Her üyemiz ailemizin bir parçasıdır.", color: "blue" },
              { icon: Award, title: "Mükemmellik", desc: "En yüksek standartlarda eğitim ve tesisler sunmayı hedefliyoruz.", color: "amber" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 bg-white rounded-2xl shadow-md">
                <div className={`w-14 h-14 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`text-${color}-600`} size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
