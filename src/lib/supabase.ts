import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client. Row-level security (supabase/migrations) decides what each maker can read and write,
// so the public anon key is safe here. Returns null until .env.local has the project URL and key.
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Only the project address is wanted; a pasted ".../rest/v1/" ending breaks sign-in.
  client = url && key ? createClient(new URL(url).origin, key) : null;
  return client;
}
