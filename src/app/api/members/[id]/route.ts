import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      aidatlar: { orderBy: { donem: "desc" }, take: 24 },
    },
  });
  if (!member) return NextResponse.json({ error: "Üye bulunamadı." }, { status: 404 });
  return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const member = await prisma.member.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  await prisma.member.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
