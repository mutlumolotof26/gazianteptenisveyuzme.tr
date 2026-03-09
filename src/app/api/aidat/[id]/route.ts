import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// PUT /api/aidat/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { tutar, odendi, odemeTarihi, notlar } = body;

  const aidat = await prisma.aidat.update({
    where: { id },
    data: {
      tutar: tutar ?? 0,
      odendi: odendi ?? false,
      odemeTarihi: odendi ? (odemeTarihi ? new Date(odemeTarihi) : new Date()) : null,
      notlar: notlar ?? "",
    },
  });

  return NextResponse.json(aidat);
}

// DELETE /api/aidat/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  const { id } = await params;
  await prisma.aidat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
