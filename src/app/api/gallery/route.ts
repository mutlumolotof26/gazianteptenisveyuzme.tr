import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const gallery = await prisma.gallery.findMany({
    where: { aktif: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(gallery);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await req.json();
  const { baslik, resimUrl, kategori } = body;

  if (!baslik || !resimUrl) {
    return NextResponse.json({ error: "Başlık ve resim URL zorunludur." }, { status: 400 });
  }

  const item = await prisma.gallery.create({
    data: { baslik, resimUrl, kategori: kategori || "genel" },
  });

  return NextResponse.json(item, { status: 201 });
}
