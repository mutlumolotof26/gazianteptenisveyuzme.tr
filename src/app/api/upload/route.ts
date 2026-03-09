import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const allowed = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Blob token ayarlanmamış. Vercel Storage kontrol edin." }, { status: 500 });
    }

    let filename: string;
    if (type === "logo") {
      filename = `logo.${ext}`;
    } else {
      filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    }

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      token,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Upload error:", message);
    return NextResponse.json({ error: `Yükleme hatası: ${message}` }, { status: 500 });
  }
}
