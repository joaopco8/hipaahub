/**
 * Audit Report Export API
 * Generates OCR-grade audit report with all evidence attachments
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get risk assessment
    const { data: riskAssessment } = await supabase
      .from('onboarding_risk_assessments' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!riskAssessment) {
      return NextResponse.json(
        { error: 'Risk assessment not found' },
        { status: 404 }
      );
    }

    // Get all evidence records
    const { data: evidenceRecords, error: evidenceError } = await supabase
      .from('risk_assessment_evidence' as any)
      .select('*')
      .eq('risk_assessment_id', riskAssessment.id)
      .order('question_sequence', { ascending: true });

    if (evidenceError) {
      console.error('Error fetching evidence:', evidenceError);
    }

    // Generate audit report structure
    const auditReport = {
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: user.email,
        organization_id: organization.id,
        organization_name: organization.legal_name || organization.name,
        risk_assessment_id: riskAssessment.id,
        risk_level: riskAssessment.risk_level,
        total_risk_score: riskAssessment.total_risk_score,
        risk_percentage: riskAssessment.risk_percentage
      },
      organization: {
        legal_name: organization.legal_name || organization.name,
        ein: (organization as any).ein,
        npi: (organization as any).npi,
        state_license_number: (organization as any).state_license_number,
        address: {
          street: organization.address_street,
          city: organization.address_city,
          state: organization.address_state,
          zip: organization.address_zip
        },
        security_officer: {
          name: organization.security_officer_name,
          email: organization.security_officer_email,
          role: organization.security_officer_role
        },
        privacy_officer: {
          name: organization.privacy_officer_name,
          email: organization.privacy_officer_email,
          role: organization.privacy_officer_role
        }
      },
      risk_assessment: {
        answers: riskAssessment.answers,
        risk_level: riskAssessment.risk_level,
        total_risk_score: riskAssessment.total_risk_score,
        max_possible_score: riskAssessment.max_possible_score,
        risk_percentage: riskAssessment.risk_percentage,
        created_at: riskAssessment.created_at,
        updated_at: riskAssessment.updated_at
      },
      evidence: evidenceRecords || [],
      summary: {
        total_questions: Object.keys(riskAssessment.answers || {}).length,
        questions_with_evidence_required: evidenceRecords?.filter(e => e.evidence_required).length || 0,
        questions_with_evidence_provided: evidenceRecords?.filter(e => e.evidence_provided).length || 0,
        evidence_completion_rate: evidenceRecords && evidenceRecords.length > 0
          ? ((evidenceRecords.filter(e => e.evidence_provided).length / evidenceRecords.filter(e => e.evidence_required).length) * 100).toFixed(1)
          : '0.0'
      }
    };

    // Return JSON (in production, you'd generate a PDF here)
    return NextResponse.json(auditReport, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="audit-report-${organization.id}-${Date.now()}.json"`
      }
    });

  } catch (error: any) {
    console.error('Error generating audit report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate audit report' },
      { status: 500 }
    );
  }
}
