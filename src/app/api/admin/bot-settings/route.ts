import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const SETTINGS_KEY = '__bot_settings__';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const client = supabase();
  const { data } = await client
    .from('conversations')
    .select('messages')
    .eq('user_id', SETTINGS_KEY)
    .single();

  const enabled = data ? data.messages?.[0]?.bot_enabled !== false : true;
  return NextResponse.json({ enabled });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { enabled } = await req.json();
  const client = supabase();

  await client.from('conversations').upsert(
    {
      user_id: SETTINGS_KEY,
      messages: [{ bot_enabled: enabled }],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  return NextResponse.json({ enabled });
}
