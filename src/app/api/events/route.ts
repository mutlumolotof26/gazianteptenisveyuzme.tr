import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { aktif: true },
    orderBy: { tarih: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { baslik, aciklama, tarih, bitisTarihi, yer, kategori, resimUrl, aktif } = body;

  if (!baslik || !tarih) {
    return NextResponse.json({ error: "Başlık ve tarih zorunludur." }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      baslik, aciklama, tarih: new Date(tarih),
      bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : null,
      yer, kategori: kategori || "genel",
      resimUrl, aktif: aktif ?? true,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
