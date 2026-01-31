/**
 * Evidence Upload API
 * Handles upload of evidence files and metadata
 */

// Force dynamic rendering - this route uses Supabase auth which requires cookies
export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_LOG_TYPES = ['text/csv', 'application/json', 'text/plain', 'text/log'];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const { evidenceUploadLimiter, getRateLimitIdentifier, createRateLimitResponse } = await import('@/lib/rate-limit');
    const identifier = getRateLimitIdentifier(user.id, request);
    const { success, limit, remaining, reset } = await evidenceUploadLimiter.limit(identifier);

    if (!success) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return createRateLimitResponse(limit, remaining, reset);
    }

    const formData = await request.formData();
    const questionId = formData.get('question_id') as string;
    const riskAssessmentId = formData.get('risk_assessment_id') as string;
    const answer = formData.get('answer') as string;
    const evidenceType = formData.get('evidence_type') as string;
    const file = formData.get('file') as File | null;
    const link = formData.get('link') as string | null;
    const attestation = formData.get('attestation') as string | null; // JSON string

    if (!questionId || !riskAssessmentId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: question_id, risk_assessment_id, answer' },
        { status: 400 }
      );
    }

    // Get organization_id
    const { data: organization } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Prepare evidence data
    let evidenceData: Record<string, any> = {};
    let fileId: string | null = null;
    let storagePath: string | null = null;

    // Handle file uploads
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        );
      }

      // Validate file type based on evidence type
      if (evidenceType === 'document' && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid document type. Allowed: PDF, DOC, DOCX' },
          { status: 400 }
        );
      }

      if (evidenceType === 'screenshot' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Allowed: PNG, JPEG, JPG' },
          { status: 400 }
        );
      }

      if (evidenceType === 'log' && !ALLOWED_LOG_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid log type. Allowed: CSV, JSON, TXT, LOG' },
          { status: 400 }
        );
      }

      // Upload to Supabase Storage
      // Path structure: {user_id}/{question_id}/{timestamp}.{ext}
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${questionId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, file, {
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

      fileId = uploadData.path;
      storagePath = fileName;

      // Add to evidence_data based on type
      if (evidenceType === 'document' || evidenceType === 'screenshot' || evidenceType === 'log') {
        evidenceData[`${evidenceType}s`] = [{
          file_id: fileId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString(),
          uploaded_by: user.email,
          storage_path: storagePath
        }];
      }
    }

    // Handle link
    if (link) {
      evidenceData.links = [{
        url: link,
        verified_at: new Date().toISOString()
      }];
    }

    // Handle attestation
    if (attestation) {
      try {
        const attestationData = JSON.parse(attestation);
        evidenceData.attestations = [{
          signer_name: attestationData.signer_name || user.email,
          signer_email: user.email,
          signer_role: attestationData.signer_role || 'User',
          signed_at: new Date().toISOString(),
          ip_address: clientIp,
          user_agent: userAgent
        }];
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid attestation data' },
          { status: 400 }
        );
      }
    }

    // Get question metadata to determine sequence
    const { getEvidenceQuestionMetadata } = await import('@/lib/evidence-driven-questions');
    const metadata = await getEvidenceQuestionMetadata(questionId);
    const sequence = metadata?.sequence || 0;

    // Upsert evidence record
    const { data: existingEvidence } = await supabase
      .from('risk_assessment_evidence' as any)
      .select('id, evidence_data')
      .eq('risk_assessment_id', riskAssessmentId)
      .eq('question_id', questionId)
      .single();

    let finalEvidenceData = evidenceData;
    if (existingEvidence?.evidence_data) {
      // Merge with existing evidence
      const existing = existingEvidence.evidence_data as Record<string, any>;
      finalEvidenceData = {
        documents: [...(existing.documents || []), ...(evidenceData.documents || [])],
        screenshots: [...(existing.screenshots || []), ...(evidenceData.screenshots || [])],
        links: [...(existing.links || []), ...(evidenceData.links || [])],
        attestations: [...(existing.attestations || []), ...(evidenceData.attestations || [])],
        logs: [...(existing.logs || []), ...(evidenceData.logs || [])],
        vendor_proofs: [...(existing.vendor_proofs || []), ...(evidenceData.vendor_proofs || [])],
        narratives: [...(existing.narratives || []), ...(evidenceData.narratives || [])]
      };
    }

    const evidenceRecord = {
      user_id: user.id,
      organization_id: organization.id,
      risk_assessment_id: riskAssessmentId,
      question_id: questionId,
      question_sequence: sequence,
      answer: answer,
      evidence_required: metadata?.evidence_required || false,
      evidence_type: metadata?.evidence_type || [],
      evidence_provided: true,
      evidence_data: finalEvidenceData,
      uploaded_by: user.id,
      uploaded_ip: clientIp,
      uploaded_user_agent: userAgent
    };

    let result;
    if (existingEvidence) {
      // Update existing
      const { data, error } = await supabase
        .from('risk_assessment_evidence' as any)
        .update(evidenceRecord)
        .eq('id', existingEvidence.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('risk_assessment_evidence' as any)
        .insert(evidenceRecord)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      evidence: result
    });

  } catch (error: any) {
    console.error('Evidence upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}
