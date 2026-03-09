import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "logo" | "image"

  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const allowed = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
  }

  let filename: string;
  if (type === "logo") {
    filename = `logo.${ext}`;
  } else {
    filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
