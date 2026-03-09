import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// POST - Üye başvurusu (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ad, soyad, email, telefon, uyeTipi, spor, mesaj } = body;

    if (!ad || !soyad || !email) {
      return NextResponse.json({ error: "Ad, soyad ve email zorunludur." }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        ad,
        soyad,
        email,
        telefon: telefon || null,
        uyeTipi: uyeTipi || "standart",
        spor: spor || "her_ikisi",
        durum: "beklemede",
        notlar: mesaj || null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}

// GET - Tüm üyeler (admin only)
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const durum = searchParams.get("durum") || "";

  const members = await prisma.member.findMany({
    where: {
      AND: [
        durum ? { durum } : {},
        search ? {
          OR: [
            { ad: { contains: search } },
            { soyad: { contains: search } },
            { email: { contains: search } },
          ],
        } : {},
      ],
    },
    orderBy: { kayitTarihi: "desc" },
  });

  return NextResponse.json(members);
}
