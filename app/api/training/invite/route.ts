// POST /api/training/invite
// Creates an employee invite record and sends training invitation email via Resend

export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role_title } = body;

    if (!name || !email || !role_title) {
      return NextResponse.json(
        { error: 'name, email, and role_title are required' },
        { status: 400 }
      );
    }

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // Use service role to bypass RLS for insert
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if employee already has a pending or completed invite
    const { data: existing } = await supabaseAdmin
      .from('employee_invites')
      .select('id, status')
      .eq('organization_id', org.id)
      .eq('email', email.toLowerCase().trim())
      .in('status', ['invited', 'completed'])
      .single();

    if (existing) {
      const message =
        existing.status === 'completed'
          ? 'This employee has already completed the training.'
          : 'An invite has already been sent to this email.';
      return NextResponse.json({ error: message }, { status: 409 });
    }

    const token = generateInviteToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const trainingUrl = `${siteUrl}/training?token=${token}`;

    // Insert invite record
    const { data: invite, error: insertError } = await supabaseAdmin
      .from('employee_invites')
      .insert({
        organization_id: org.id,
        invited_by: user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role_title: role_title.trim(),
        invite_token: token,
        status: 'invited',
      })
      .select()
      .single();

    if (insertError || !invite) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invite record' },
        { status: 500 }
      );
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      // If Resend not configured, still return success with the link
      return NextResponse.json({
        success: true,
        invite_id: invite.id,
        training_url: trainingUrl,
        warning: 'RESEND_API_KEY not configured. Email not sent. Share this link manually.',
      });
    }

    const emailHtml = buildInviteEmailHtml({
      employeeName: name.trim(),
      organizationName: org.name,
      trainingUrl,
      roleTitle: role_title.trim(),
    });

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@hipaahubhealth.com',
        to: [email.toLowerCase().trim()],
        subject: `HIPAA Awareness Training Required — ${org.name}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('Resend error:', resendError);
      // Return success anyway — the invite was created, just email failed
      return NextResponse.json({
        success: true,
        invite_id: invite.id,
        training_url: trainingUrl,
        warning: `Email delivery failed: ${resendError}. Share the training link manually.`,
      });
    }

    return NextResponse.json({
      success: true,
      invite_id: invite.id,
      training_url: trainingUrl,
    });
  } catch (error: any) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildInviteEmailHtml(params: {
  employeeName: string;
  organizationName: string;
  trainingUrl: string;
  roleTitle: string;
}): string {
  const { employeeName, organizationName, trainingUrl, roleTitle } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HIPAA Training Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f3f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#0c0b1d;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:300;letter-spacing:0.5px;">
                HIPAA<span style="color:#1ad07a;">Guard</span>
              </p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:12px;font-weight:300;">
                HIPAA Compliance Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;color:#0c0b1d;font-size:24px;font-weight:300;">
                HIPAA Awareness Training
              </p>
              <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.6;font-weight:300;">
                Hello <strong style="font-weight:500;color:#0c0b1d;">${employeeName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.6;font-weight:300;">
                <strong style="font-weight:500;color:#0c0b1d;">${organizationName}</strong> requires all 
                staff members to complete HIPAA Awareness Training. As a <strong style="font-weight:500;color:#0c0b1d;">${roleTitle}</strong>, 
                this training is mandatory and covers your responsibilities regarding patient health information protection.
              </p>

              <!-- Training info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;margin:0 0 32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#0c0b1d;font-size:14px;font-weight:500;">What to expect:</p>
                    <p style="margin:0 0 6px;color:#666;font-size:14px;font-weight:300;">✓&nbsp;&nbsp;8 training modules covering HIPAA fundamentals</p>
                    <p style="margin:0 0 6px;color:#666;font-size:14px;font-weight:300;">✓&nbsp;&nbsp;Knowledge check questions after each section</p>
                    <p style="margin:0 0 6px;color:#666;font-size:14px;font-weight:300;">✓&nbsp;&nbsp;Digital acknowledgement &amp; signature</p>
                    <p style="margin:0;color:#666;font-size:14px;font-weight:300;">✓&nbsp;&nbsp;Estimated time: 30–45 minutes</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#1ad07a;">
                    <a href="${trainingUrl}" style="display:inline-block;padding:16px 40px;color:#0c0b1d;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Begin HIPAA Training →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#999;font-size:13px;font-weight:300;">
                If the button doesn't work, copy and paste this link:
              </p>
              <p style="margin:0 0 32px;color:#0c0b1d;font-size:13px;word-break:break-all;">
                ${trainingUrl}
              </p>

              <p style="margin:0;color:#aaa;font-size:12px;font-weight:300;line-height:1.6;border-top:1px solid #f0f0f0;padding-top:20px;">
                This training link is unique to you and expires in 30 days. 
                Do not forward this email to others. 
                This is a compliance requirement — completion is recorded and stored for audit purposes.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f5f9;padding:20px 40px;">
              <p style="margin:0;color:#aaa;font-size:12px;font-weight:300;text-align:center;">
                Sent by HIPAAGuard on behalf of ${organizationName}<br/>
                HIPAA Awareness Training Record — Not a certified legal training provider
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
