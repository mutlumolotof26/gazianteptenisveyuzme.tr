import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Telefon numarasını normalize et: her türlü formatı 10 haneli yerel forma çevir
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return digits.slice(2); // 905331403076 → 5331403076
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);  // 05331403076 → 5331403076
  return digits;
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const phone = req.nextUrl.searchParams.get("phone");

  if (!key || key !== process.env.BOT_API_KEY) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!phone) {
    return NextResponse.json({ error: "phone gerekli" }, { status: 400 });
  }

  const normalized = normalizePhone(phone);

  // DB'deki tüm telefon formatlarını kontrol et
  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { telefon: { contains: normalized } },
        { telefon: { contains: "0" + normalized } },
        { telefon: { contains: "90" + normalized } },
      ],
    },
    select: { id: true, ad: true, soyad: true, uyeTipi: true, durum: true },
  });

  if (!member) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, uyeTipi: member.uyeTipi, durum: member.durum, ad: member.ad, soyad: member.soyad });
}
