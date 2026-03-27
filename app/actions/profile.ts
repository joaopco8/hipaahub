'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

export async function savePhoneNumber(
  phoneNumber: string
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Use service role to bypass any RLS restrictions on the users table
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await adminSupabase
    .from('users')
    .update({ phone_number: phoneNumber.trim() })
    .eq('id', user.id);

  if (error) {
    console.error('savePhoneNumber error:', error.message);
    return { error: error.message };
  }

  // Also update auth metadata for redundancy
  await supabase.auth.updateUser({ data: { phone_number: phoneNumber.trim() } });

  return {};
}
