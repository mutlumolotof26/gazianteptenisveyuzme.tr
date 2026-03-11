import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const defaults = {
  logoUrl: "/logo.png",
  siteName: "Gaziantep Yüzme Spor Kulübü",
  siteAcik: "Tenis & Yüzme",
  telefon: "0551 245 82 74",
  email: "info@gazitenisyuzme.com",
  adres: "Batıkent, Muhsin Yazıcıoğlu Cd. No:18, 27560 Şehitkamil/Gaziantep",
  calismaHafta: "07:00 - 22:00",
  calismaCumartesi: "08:00 - 20:00",
  calismaPazar: "09:00 - 18:00",
  instagramUrl: "",
  facebookUrl: "",
  whatsappNo: "",
  fiyatYetiskin: "₺800",
  fiyatCocuk: "₺600",
  fiyatYazKursu: "₺1.500",
  fiyatKardes: "₺500",
};

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return NextResponse.json(settings ?? defaults);
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

  const body = await req.json();
  const fields = [
    "logoUrl", "siteName", "siteAcik",
    "telefon", "email", "adres",
    "calismaHafta", "calismaCumartesi", "calismaPazar",
    "instagramUrl", "facebookUrl", "whatsappNo",
    "fiyatYetiskin", "fiyatCocuk", "fiyatYazKursu", "fiyatKardes",
  ] as const;

  const update: Record<string, string> = {};
  for (const f of fields) {
    if (body[f] !== undefined) update[f] = body[f];
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update,
    create: { id: 1, ...defaults, ...update },
  });

  return NextResponse.json(settings);
}
