import type { SupabaseClient } from '@supabase/supabase-js';

export function upsertStoreSettings(
  supabase: SupabaseClient<any>,
  entries: Record<string, string | null>,
) {
  const now = new Date().toISOString();
  return supabase
    .from('store_settings')
    .upsert(
      Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: now })),
      { onConflict: 'key' },
    );
}
