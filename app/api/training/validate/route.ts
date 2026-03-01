// GET /api/training/validate?token=xxx
// Public endpoint — validates an employee invite token
// No authentication required (employee has no account)

import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invite, error } = await supabaseAdmin
      .from('employee_invites')
      .select(`
        id,
        name,
        email,
        role_title,
        status,
        organization_id,
        token_expires_at,
        organizations (
          name
        )
      `)
      .eq('invite_token', token)
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired training link.' },
        { status: 404 }
      );
    }

    if (invite.status === 'completed') {
      return NextResponse.json(
        { error: 'Training already completed.', completed: true },
        { status: 409 }
      );
    }

    if (invite.status === 'expired') {
      return NextResponse.json(
        { error: 'This training link has expired. Please contact your administrator for a new invite.' },
        { status: 410 }
      );
    }

    // Check token expiry
    if (invite.token_expires_at && new Date(invite.token_expires_at) < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from('employee_invites')
        .update({ status: 'expired' })
        .eq('invite_token', token);

      return NextResponse.json(
        { error: 'This training link has expired. Please contact your administrator for a new invite.' },
        { status: 410 }
      );
    }

    const org = invite.organizations as any;

    return NextResponse.json({
      valid: true,
      invite: {
        id: invite.id,
        name: invite.name,
        email: invite.email,
        role_title: invite.role_title,
        organization_name: org?.name || 'Your Organization',
      },
    });
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
