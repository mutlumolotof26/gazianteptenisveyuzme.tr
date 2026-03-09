import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ad, email, telefon, konu, mesaj } = body;

    if (!ad || !email || !mesaj) {
      return NextResponse.json({ error: "Ad, email ve mesaj zorunludur." }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: { ad, email, telefon: telefon || null, konu: konu || null, mesaj },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(contacts);
}
