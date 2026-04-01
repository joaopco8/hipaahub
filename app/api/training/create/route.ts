import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Capture IP for forensic record
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const acknowledgementIp =
      forwarded?.split(',')[0]?.trim() || realIp || cfIp || 'unknown';

    // Use service role key — bypasses RLS and schema cache issues
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get organization for this user
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: trainingRecord, error } = await supabaseAdmin
      .from('training_records')
      .insert({
        user_id: user.id,
        organization_id: org?.id || body.organization_id || null,
        staff_member_id: body.staff_member_id || null,
        full_name: body.full_name,
        email: body.email,
        role_title: body.role_title,
        training_type: body.training_type,
        training_date: body.training_date,
        completion_status: body.completion_status,
        expiration_date: body.expiration_date,
        acknowledgement: body.acknowledgement,
        acknowledgement_date: body.acknowledgement_date,
        acknowledgement_ip: acknowledgementIp,
        recorded_by: body.recorded_by,
        record_timestamp: body.record_timestamp,
        training_content_version: body.training_content_version || '1.0',
        quiz_score: body.quiz_score || null,
        quiz_answers: body.quiz_answers || null,
        certificate_id: body.certificate_id || null,
        user_agent: body.user_agent || null,
        training_start_time: body.training_start_time || null,
        training_duration_minutes: body.training_duration_minutes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Training record insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: trainingRecord });
  } catch (error: any) {
    console.error('Error creating training record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create training record' },
      { status: 500 }
    );
  }
}
