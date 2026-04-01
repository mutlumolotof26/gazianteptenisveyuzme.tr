import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL ve SUPABASE_KEY env değişkenleri eksik');
    _client = createClient(url, key);
  }
  return _client;
}

export { getClient as supabase };

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  user_id: string;
  messages: Message[];
  updated_at: string;
}
