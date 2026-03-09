import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/aidat?donem=2026-03
export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const donem = searchParams.get("donem");

  if (!donem) {
    return NextResponse.json({ error: "donem gerekli" }, { status: 400 });
  }

  // Aktif üyeleri çek
  const members = await prisma.member.findMany({
    where: { durum: "aktif" },
    orderBy: [{ ad: "asc" }, { soyad: "asc" }],
  });

  // O dönem için mevcut aidat kayıtlarını çek
  const aidatlar = await prisma.aidat.findMany({
    where: { donem },
  });

  const aidatMap = new Map(aidatlar.map((a) => [a.memberId, a]));

  // Tüm aktif üyeler için birleşik liste oluştur
  const result = members.map((m) => {
    const aidat = aidatMap.get(m.id);
    return {
      memberId: m.id,
      ad: m.ad,
      soyad: m.soyad,
      telefon: m.telefon,
      uyeTipi: m.uyeTipi,
      spor: m.spor,
      aidatId: aidat?.id ?? null,
      tutar: aidat?.tutar ?? 0,
      odendi: aidat?.odendi ?? false,
      odemeTarihi: aidat?.odemeTarihi ?? null,
      notlar: aidat?.notlar ?? "",
    };
  });

  return NextResponse.json(result);
}

// POST /api/aidat — yeni aidat kaydı oluştur
export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const { memberId, donem, tutar, odendi, odemeTarihi, notlar } = body;

  if (!memberId || !donem) {
    return NextResponse.json({ error: "memberId ve donem gerekli" }, { status: 400 });
  }

  const aidat = await prisma.aidat.upsert({
    where: { memberId_donem: { memberId, donem } },
    update: {
      tutar: tutar ?? 0,
      odendi: odendi ?? false,
      odemeTarihi: odendi && odemeTarihi ? new Date(odemeTarihi) : odendi ? new Date() : null,
      notlar: notlar ?? "",
    },
    create: {
      memberId,
      donem,
      tutar: tutar ?? 0,
      odendi: odendi ?? false,
      odemeTarihi: odendi ? new Date() : null,
      notlar: notlar ?? "",
    },
  });

  return NextResponse.json(aidat);
}
