import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const showArchived = searchParams.get('archived') === 'true';

  const client = supabase();
  const { data, error } = await client
    .from('conversations')
    .select('*')
    .neq('user_id', '__bot_settings__')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = (data || []).filter((conv) => {
    const isArchived = (conv.messages || []).some(
      (m: { role: string; content: string }) => m.role === 'system' && m.content === '__ARCHIVED__'
    );
    return showArchived ? isArchived : !isArchived;
  });

  return NextResponse.json(filtered);
}

// PATCH: arşivle / arşivden çıkar
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { userId, archive } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });

  const client = supabase();
  const { data } = await client.from('conversations').select('messages').eq('user_id', userId).single();
  if (!data) return NextResponse.json({ error: 'Konuşma bulunamadı' }, { status: 404 });

  let messages = data.messages || [];
  if (archive) {
    if (!messages.some((m: { role: string; content: string }) => m.content === '__ARCHIVED__')) {
      messages = [...messages, { role: 'system', content: '__ARCHIVED__' }];
    }
  } else {
    messages = messages.filter((m: { role: string; content: string }) => m.content !== '__ARCHIVED__');
  }

  const { error } = await client.from('conversations').update({ messages }).eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE: konuşmayı sil
export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });

  const client = supabase();
  const { error } = await client.from('conversations').delete().eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
