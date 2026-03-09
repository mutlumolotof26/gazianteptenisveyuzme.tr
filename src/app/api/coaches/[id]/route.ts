import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const coach = await prisma.coach.update({ where: { id }, data: body });
  return NextResponse.json(coach);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.coach.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
