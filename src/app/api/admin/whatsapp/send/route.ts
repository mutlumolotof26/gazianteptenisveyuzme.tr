import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { to, text, channel } = await req.json();

  if (!to || !text) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
  }

  if (channel === 'instagram') {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const res = await fetch(`${GRAPH_API}/me/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: to },
        message: { text },
        access_token: token,
      }),
    });
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 400 });
  } else {
    // WhatsApp
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      }),
    });
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 400 });
  }

  // Supabase'deki konuşmaya mesajı ekle
  const client = supabase();
  const { data: conv } = await client
    .from('conversations')
    .select('messages')
    .eq('user_id', to)
    .single();

  const messages = conv?.messages || [];
  // Admin bu konuşmayı devraldı — bot artık cevap vermeyecek
  if (!messages.some((m: { role: string; content: string }) => m.content === '__ADMIN_TAKEOVER__')) {
    messages.push({ role: 'system', content: '__ADMIN_TAKEOVER__' });
  }
  messages.push({ role: 'assistant', content: text });

  await client.from('conversations').upsert(
    { user_id: to, messages, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );

  return NextResponse.json({ ok: true });
}
