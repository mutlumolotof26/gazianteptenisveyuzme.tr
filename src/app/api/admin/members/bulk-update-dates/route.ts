import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { updates }: { updates: { tcKimlik: string; kayitTarihi: string }[] } = await req.json();

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  let updated = 0;
  let notFound = 0;

  for (const u of updates) {
    if (!u.tcKimlik || !u.kayitTarihi) continue;
    const result = await prisma.member.updateMany({
      where: { tcKimlik: u.tcKimlik },
      data: { kayitTarihi: new Date(u.kayitTarihi) },
    });
    if (result.count > 0) updated++;
    else notFound++;
  }

  return NextResponse.json({ ok: true, updated, notFound });
}
