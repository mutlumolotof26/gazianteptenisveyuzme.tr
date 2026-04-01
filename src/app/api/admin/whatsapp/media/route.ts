import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const mediaId = req.nextUrl.searchParams.get('id');
  if (!mediaId) {
    return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  // 1) Media URL'sini al
  const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta = await metaRes.json();
  if (!meta.url) {
    return NextResponse.json({ error: 'Medya bulunamadı' }, { status: 404 });
  }

  // 2) Dosyayı indir ve tarayıcıya ilet
  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
  const buffer = await fileRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
    },
  });
}
