import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email ve şifre zorunludur." }, { status: 400 });
  }

  const user = await verifyAdmin(email, password);

  if (!user) {
    return NextResponse.json({ error: "Geçersiz email veya şifre." }, { status: 401 });
  }

  const token = createSessionToken(user);
  const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
