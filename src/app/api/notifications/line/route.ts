import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ROLES, LINE_NOTIFY_TOKEN_KEY } from '@/lib/constants';
import { getStoreSetting } from '@/lib/storeSettings';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message } = body;
  if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 });

  const [{ data: profile }, token] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    getStoreSetting(supabase, LINE_NOTIFY_TOKEN_KEY),
  ]);

  if (!profile || (profile.role !== ROLES.ADMIN && profile.role !== ROLES.MANAGER)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!token) {
    return NextResponse.json(
      { error: 'Line Notify token is not configured' },
      { status: 422 },
    );
  }

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
    return NextResponse.json(
      { error: `Line API error: ${text}` },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}
