import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, ad, telefon, email, mesaj } = body;
  if (!sessionId || !ad || !telefon) {
    return NextResponse.json({ error: "sessionId, ad ve telefon zorunludur" }, { status: 400 });
  }
  const request = await prisma.sessionRequest.create({
    data: { sessionId, ad, telefon, email: email || null, mesaj: mesaj || null },
  });
  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  const requests = await prisma.sessionRequest.findMany({
    include: { session: { select: { program: true, gun: true, baslangic: true, bitis: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
