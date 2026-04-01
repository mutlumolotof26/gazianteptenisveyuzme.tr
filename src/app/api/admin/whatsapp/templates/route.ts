import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const wabaId = process.env.WHATSAPP_WABA_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!wabaId) {
    return NextResponse.json({ error: 'WHATSAPP_WABA_ID env var eksik' }, { status: 500 });
  }

  const res = await fetch(
    `${GRAPH_API}/${wabaId}/message_templates?fields=name,status,language,components&limit=50&access_token=${token}`
  );
  const data = await res.json();

  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 400 });
  }

  // Sadece APPROVED template'leri döndür
  const approved = (data.data || []).filter(
    (t: { status: string }) => t.status === 'APPROVED'
  );

  return NextResponse.json(approved);
}
