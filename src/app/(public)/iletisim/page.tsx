import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import IletisimForm from "./IletisimForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim | Gaziantep Yüzme Kursu Kayıt ve Bilgi",
  description: "Gaziantep yüzme kursu kayıt ve bilgi için bizimle iletişime geçin. GTY Spor Kulübü - Batıkent, Muhsin Yazıcıoğlu Cd. No:18, Şehitkamil/Gaziantep. Tel: 0551 245 82 74",
};

async function getSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: 1 } });
  } catch {
    return null;
  }
}

export default async function IletisimPage() {
  const s = await getSettings();

  const telefon = s?.telefon ?? "0551 245 82 74";
  const email = s?.email ?? "info@gazitenisyuzme.com";
  const adres = s?.adres ?? "Batıkent, Muhsin Yazıcıoğlu Cd. No:18, 27560 Şehitkamil/Gaziantep";
  const calismaHafta = s?.calismaHafta ?? "07:00 - 22:00";
  const calismaCumartesi = s?.calismaCumartesi ?? "08:00 - 20:00";
  const calismaPazar = s?.calismaPazar ?? "09:00 - 18:00";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">İletişim</h1>
          <p className="text-blue-200">Bizimle iletişime geçin</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* İletişim Bilgileri */}
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-6">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="text-blue-700" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Adres</div>
                    <p className="text-gray-500 text-sm whitespace-pre-line">{adres}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="text-blue-700" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Telefon</div>
                    <p className="text-gray-500 text-sm">{telefon}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="text-blue-700" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">E-posta</div>
                    <p className="text-gray-500 text-sm">{email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="text-blue-700" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Çalışma Saatleri</div>
                    <p className="text-gray-500 text-sm">
                      Hafta içi: {calismaHafta}<br />
                      Cumartesi: {calismaCumartesi}<br />
                      Pazar: {calismaPazar}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Mesaj Gönderin</h2>
              <IletisimForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
