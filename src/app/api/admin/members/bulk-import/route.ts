import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

interface ImportMember {
  ad: string;
  soyad: string;
  tcKimlik?: string;
  telefon?: string;
  dogumTarihi?: string;
  uyeTipi: string;
  spor?: string;
  notlar?: string;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { members }: { members: ImportMember[] } = await req.json();
  if (!Array.isArray(members) || members.length === 0) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const m of members) {
    if (!m.ad || !m.soyad) { skipped++; continue; }

    // TC varsa mükerrer kontrolü
    if (m.tcKimlik) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await (prisma.member as any).findFirst({ where: { tcKimlik: m.tcKimlik } });
      if (existing) { skipped++; continue; }
    }

    try {
      await prisma.member.create({
        data: {
          ad: m.ad,
          soyad: m.soyad,
          tcKimlik: m.tcKimlik || null,
          telefon: m.telefon || null,
          dogumTarihi: m.dogumTarihi || null,
          uyeTipi: m.uyeTipi || "standart",
          spor: m.spor || "yuzme",
          durum: "aktif",
          notlar: m.notlar || null,
          email: "",
        },
      });
      added++;
    } catch {
      errors.push(`${m.ad} ${m.soyad}: kayıt hatası`);
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, added, skipped, errors });
}
