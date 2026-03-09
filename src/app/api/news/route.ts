import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const news = await prisma.news.findMany({
    where: { aktif: true },
    orderBy: { yayinTarihi: "desc" },
  });
  return NextResponse.json(news);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { baslik, ozet, icerik, resimUrl, kategori, aktif } = body;

  if (!baslik || !icerik) {
    return NextResponse.json({ error: "Başlık ve içerik zorunludur." }, { status: 400 });
  }

  const news = await prisma.news.create({
    data: { baslik, ozet, icerik, resimUrl, kategori: kategori || "genel", aktif: aktif ?? true },
  });

  return NextResponse.json(news, { status: 201 });
}
