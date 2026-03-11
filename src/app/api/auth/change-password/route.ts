import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { mevcutSifre, yeniSifre } = await req.json();
  if (!mevcutSifre || !yeniSifre) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu." }, { status: 400 });
  }
  if (yeniSifre.length < 6) {
    return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

  const valid = await bcrypt.compare(mevcutSifre, user.password);
  if (!valid) return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });

  const hashed = await bcrypt.hash(yeniSifre, 12);
  await prisma.adminUser.update({ where: { id: session.id }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
