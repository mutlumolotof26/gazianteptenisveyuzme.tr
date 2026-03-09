import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const spor = searchParams.get("spor");
  const all = searchParams.get("all") === "true";

  const coaches = await prisma.coach.findMany({
    where: {
      ...(all ? {} : { aktif: true }),
      ...(spor && spor !== "tümü" ? { spor: { in: [spor, "her_ikisi"] } } : {}),
    },
    orderBy: [{ sira: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(coaches);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }
  const body = await req.json();
  const coach = await prisma.coach.create({ data: body });
  return NextResponse.json(coach, { status: 201 });
}
