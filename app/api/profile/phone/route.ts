import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ unauthenticated: true });

    const adminSupabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await adminSupabase
      .from('users')
      .select('phone_number')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ hasPhone: !!data?.phone_number });
  } catch (err: any) {
    return NextResponse.json({ hasPhone: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get user from session (uses cookies)
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use service role to bypass RLS on the users table
    const adminSupabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await adminSupabase
      .from('users')
      .update({ phone_number: phoneNumber.trim() })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating phone number:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also sync to auth metadata
    await supabase.auth.updateUser({ data: { phone_number: phoneNumber.trim() } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Profile phone route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
