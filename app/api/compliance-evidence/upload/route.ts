/**
 * Compliance Evidence Upload API
 * Handles upload of evidence files for the Evidence Center
 * (Independent of onboarding flow)
 */

// Force dynamic rendering - this route uses Supabase auth which requires cookies
export const dynamic = 'force-dynamic';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/db';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    // First, authenticate user with normal client (has access to cookies/session)
    const supabaseAuth = createServerClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Rate limiting
    const { complianceEvidenceUploadLimiter, getRateLimitIdentifier, createRateLimitResponse } = await import('@/lib/rate-limit');
    const identifier = getRateLimitIdentifier(user.id, request);
    const { success, limit, remaining, reset } = await complianceEvidenceUploadLimiter.limit(identifier);

    if (!success) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return createRateLimitResponse(limit, remaining, reset);
    }

    // Get organization using auth client
    const { data: organization, error: orgError } = await supabaseAuth
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (orgError) {
      console.error('Organization query error:', orgError);
    }

    const ownerId = organization?.id || user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const evidence_type = formData.get('evidence_type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Now use service_role client for storage upload (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase config missing for upload');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Upload to Supabase Storage
    // Path structure: {owner_id}/evidence/{timestamp}-{sanitized_name}
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
    const fileName = `${ownerId}/evidence/${timestamp}-${safeName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('evidence')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file_url: uploadData.path,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    });

  } catch (error: any) {
    console.error('Evidence upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}
