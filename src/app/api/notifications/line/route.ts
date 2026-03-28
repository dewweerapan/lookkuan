import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check — admin/manager only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Read message from body
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 });

  // Get Line Notify token from store_settings
  const { data: setting } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'line_notify_token')
    .maybeSingle();

  const token = setting?.value;
  if (!token) {
    return NextResponse.json({ error: 'Line Notify token is not configured' }, { status: 422 });
  }

  // Send via Line Notify API
  const form = new URLSearchParams({ message: `\n${message}` });
  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: `Line API error: ${text}` }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
