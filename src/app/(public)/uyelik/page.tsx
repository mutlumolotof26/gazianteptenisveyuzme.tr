import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import UyelikClient from "./UyelikClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Üyelik | Gaziantep Yüzme Kursu ve Tenis Kayıt",
  description: "Gaziantep yüzme kursu ve tenis eğitimi için GTY Spor Kulübü üyelik planları. Çocuk, yetişkin ve aile üyelikleri. Hemen kayıt olun.",
};

async function getSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: 1 } });
  } catch {
    return null;
  }
}

export default async function UyelikPage() {
  const s = await getSettings();

  const plans = [
    {
      title: "Yetişkin",
      price: s?.fiyatYetiskin ?? "₺800",
      period: "/ay",
      color: "blue",
      features: ["Tenis veya Yüzme (seçiniz)", "Haftada 5 ders", "Tüm tesisler", "Soyunma odası kullanımı"],
    },
    {
      title: "Çocuk",
      price: s?.fiyatCocuk ?? "₺600",
      period: "/ay",
      color: "green",
      popular: true,
      features: ["Tenis veya Yüzme (seçiniz)", "Aylık 8 ders", "Haftada 2 gün (Cumartesi - Pazar)", "Uzman çocuk antrenörleri"],
    },
    {
      title: "Yaz Kursu",
      price: s?.fiyatYazKursu ?? "₺1.500",
      period: "/kurs",
      color: "amber",
      features: ["Tenis veya Yüzme (seçiniz)", "Yoğun yaz programı", "Tüm tesisler", "Sertifika"],
    },
    {
      title: "Kardeş",
      price: s?.fiyatKardes ?? "₺500",
      period: "/ay",
      color: "purple",
      features: ["2. kardeş için indirimli fiyat", "Tenis veya Yüzme (seçiniz)", "Haftada 5 ders", "Tüm tesisler"],
    },
  ];

  return <UyelikClient plans={plans} />;
}
