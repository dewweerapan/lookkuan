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

export async function getStoreSetting(
  supabase: SupabaseClient<any>,
  key: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function getStoreSettings(
  supabase: SupabaseClient<any>,
  keys: string[],
): Promise<Record<string, string | null>> {
  const { data } = await supabase
    .from('store_settings')
    .select('key, value')
    .in('key', keys);
  if (!data) return {};
  return Object.fromEntries(
    (data as { key: string; value: string | null }[]).map((r) => [r.key, r.value]),
  );
}
