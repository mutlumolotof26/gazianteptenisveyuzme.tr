import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  await requireAdmin();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "logo" | "image"

  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const allowed = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
  }

  let filename: string;
  if (type === "logo") {
    filename = `logo.${ext}`;
  } else {
    filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  }

  const blob = await put(filename, file, {
    access: "public",
    allowOverwrite: type === "logo",
  });

  return NextResponse.json({ url: blob.url });
}
