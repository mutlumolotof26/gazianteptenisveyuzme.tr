import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { phone, templateName, templateLanguage } = await req.json();

  if (!phone || !templateName) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
  }

  // Telefon numarasını normalize et: 0 ile başlıyorsa 90 ekle
  const normalizedPhone = phone.startsWith('0')
    ? '9' + phone
    : phone.startsWith('+')
    ? phone.slice(1)
    : phone;

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
      to: normalizedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLanguage || 'tr' },
      },
    }),
  });

  const data = await res.json();
  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 400 });
  }

  // Konuşmayı Supabase'e kaydet
  const client = supabase();
  const { data: existing } = await client
    .from('conversations')
    .select('messages')
    .eq('user_id', normalizedPhone)
    .single();

  const messages = existing?.messages || [];
  if (!messages.some((m: { content: string }) => m.content === '__ADMIN_TAKEOVER__')) {
    messages.push({ role: 'system', content: '__ADMIN_TAKEOVER__' });
  }
  messages.push({ role: 'assistant', content: `[Şablon mesajı gönderildi: ${templateName}]` });

  await client.from('conversations').upsert(
    { user_id: normalizedPhone, messages, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );

  return NextResponse.json({ ok: true, phone: normalizedPhone });
}
