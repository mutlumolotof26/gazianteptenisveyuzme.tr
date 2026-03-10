import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const session = await getAdminSession();

  const sessions = await prisma.session.findMany({
    where: all && session ? {} : { aktif: true },
    include: { coach: { select: { id: true, ad: true } } },
    orderBy: [{ sira: "asc" }, { gun: "asc" }, { baslangic: "asc" }],
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  const body = await req.json();
  const created = await prisma.session.create({ data: body, include: { coach: { select: { id: true, ad: true } } } });
  return NextResponse.json(created, { status: 201 });
}
