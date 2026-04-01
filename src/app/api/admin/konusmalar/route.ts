import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const client = supabase();
  const { data, error } = await client
    .from('conversations')
    .select('*')
    .neq('user_id', '__bot_settings__')
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
