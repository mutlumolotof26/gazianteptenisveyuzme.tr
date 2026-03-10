import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.sessionRequest.update({ where: { id }, data: { okundu: body.okundu } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  const { id } = await params;
  await prisma.sessionRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
