// POST /api/training/employee-complete
// Public endpoint — completes training for an invited employee (no account required)
// Validates the token, creates a training_record, and updates the invite status

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      signature_name,
      quiz_answers,
      quiz_score,
      training_start_time,
      training_duration_minutes,
    } = body;

    if (!token || !signature_name) {
      return NextResponse.json(
        { error: 'token and signature_name are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Validate invite token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('employee_invites')
      .select('*, organizations(id, name)')
      .eq('invite_token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid training link.' },
        { status: 404 }
      );
    }

    if (invite.status === 'completed') {
      return NextResponse.json(
        { error: 'Training already completed.' },
        { status: 409 }
      );
    }

    if (invite.status === 'expired' || new Date(invite.token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This training link has expired.' },
        { status: 410 }
      );
    }

    // Extract IP and user-agent for forensic record
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const ipAddress =
      forwarded?.split(',')[0]?.trim() || realIp || cfIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    const certificateId = `HIPAA-EMP-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

    // Insert training record using the admin client (no user auth required)
    // We store the invite's organization_id and link it back
    const { data: trainingRecord, error: recordError } = await supabaseAdmin
      .from('training_records')
      .insert({
        // training_records requires user_id — use a placeholder UUID from the invite's invited_by
        user_id: invite.invited_by,
        organization_id: invite.organization_id,
        full_name: invite.name,
        email: invite.email,
        role_title: invite.role_title,
        training_type: 'initial',
        training_date: now.toISOString(),
        completion_status: 'completed',
        expiration_date: expirationDate.toISOString(),
        acknowledgement: true,
        acknowledgement_date: now.toISOString(),
        acknowledgement_ip: ipAddress,
        recorded_by: 'System (HIPAAGuard — Employee Invite)',
        record_timestamp: now.toISOString(),
        training_content_version: '1.0',
        quiz_score: quiz_score || null,
        quiz_answers: quiz_answers || null,
        certificate_id: certificateId,
        user_agent: userAgent,
        training_start_time: training_start_time || null,
        training_duration_minutes: training_duration_minutes || null,
      })
      .select()
      .single();

    if (recordError || !trainingRecord) {
      console.error('Training record insert error:', recordError);
      return NextResponse.json(
        { error: 'Failed to save training record' },
        { status: 500 }
      );
    }

    // Update invite: mark completed, store metadata
    const { error: updateError } = await supabaseAdmin
      .from('employee_invites')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        signature_name: signature_name.trim(),
        training_record_id: trainingRecord.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        quiz_score: quiz_score || null,
        certificate_id: certificateId,
        updated_at: now.toISOString(),
      })
      .eq('invite_token', token);

    if (updateError) {
      console.error('Invite update error:', updateError);
      // Training record was saved — still return success
    }

    return NextResponse.json({
      success: true,
      certificate_id: certificateId,
      training_record_id: trainingRecord.id,
      completed_at: now.toISOString(),
      employee_name: invite.name,
      organization_name: (invite.organizations as any)?.name || 'Your Organization',
    });
  } catch (error: any) {
    console.error('Employee complete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
