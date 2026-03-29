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
      price: s?.fiyatYetiskin ?? "₺5.000",
      period: "/8 ders",
      color: "blue",
      features: ["Tenis veya Yüzme (seçiniz)", "Haftada 2 gün", "Erkek: Salı - Perşembe 21:00-22:00", "Kadın: Çarşamba - Cuma 21:00-22:00"],
    },
    {
      title: "Çocuk (6-12 yaş)",
      price: s?.fiyatCocuk ?? "₺4.000",
      period: "/8 ders",
      color: "green",
      popular: true,
      features: ["Olimpik yüzme havuzu", "Cumartesi - Pazar", "09:00-10:00 veya 16:00-17:00", "Uzman çocuk antrenörleri"],
    },
    {
      title: "Birey Okulu (3-5 yaş)",
      price: s?.fiyatYazKursu ?? "₺5.000",
      period: "/8 ders",
      color: "amber",
      features: ["Tenis veya Yüzme (seçiniz)", "Küçük çocuklara özel program", "Uzman çocuk antrenörü", "Kayıt ve sigorta dahil"],
    },
    {
      title: "Kardeş",
      price: s?.fiyatKardes ?? "₺8.500",
      period: "/ay",
      color: "purple",
      features: ["2. kardeş için indirimli fiyat", "Tenis veya Yüzme (seçiniz)", "Haftada 5 ders", "Tüm tesisler"],
    },
  ];

  return <UyelikClient plans={plans} />;
}
