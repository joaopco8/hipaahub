'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export interface AuditExportData {
  organization: {
    id: string;
    name: string;
    legal_name?: string;
    address_street?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    phone_number?: string;
    email_address?: string;
    privacy_officer_name?: string;
    privacy_officer_email?: string;
    security_officer_name?: string;
    security_officer_email?: string;
    practice_type?: string;
    npi?: string;
    ein?: string;
  };
  riskAssessment: {
    exists: boolean;
    risk_level?: string;
    created_at?: string;
    updated_at?: string;
    score?: number;
  };
  policies: {
    id: number;
    name: string;
    hasDocument: boolean;
    lastUpdated?: string;
    generationCount?: number;
  }[];
  vendors: {
    id: string;
    vendor_name: string;
    service_type: string;
    has_phi_access: boolean;
    baa_signed: boolean;
    baa_signed_date?: string;
    baa_expiration_date?: string;
    risk_level: string;
    contact_name?: string;
    contact_email?: string;
  }[];
  trainingRecords: {
    id: string;
    full_name: string;
    role_title: string;
    training_type: string;
    training_date: string;
    completion_status: string;
    expiration_date: string;
    quiz_score?: number;
  }[];
  incidents: {
    id: string;
    incident_title: string;
    description: string;
    date_occurred: string;
    date_discovered: string;
    discovered_by: string;
    severity: string;
    status: string;
    phi_involved: boolean;
    breach_confirmed: boolean;
    estimated_individuals_affected: number;
  }[];
  breachNotifications: {
    id: string;
    created_at: string;
    individuals_affected?: number;
    breach_type?: string;
    breach_discovery_date?: string;
    breach_occurred_date?: string;
    breach_description?: string;
    status?: string;
    breach_id?: string;
    patient_letter_content?: string;
    hhs_letter_content?: string;
    media_letter_content?: string;
  }[];
  evidence: {
    id: string;
    title: string;
    evidence_type_id: string;
    status: string;
    created_at: string;
  }[];
  exportedAt: string;
  complianceScore: number;
}

/** Fetch all audit data for an organization */
export async function getAuditExportData(): Promise<AuditExportData | null> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) return null;

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!org) return null;

  // Run all queries in parallel
  const [
    riskAssessmentResult,
    policyAttachmentsResult,
    vendorsResult,
    trainingResult,
    incidentsResult,
    breachResult,
    evidenceResult
  ] = await Promise.all([
    // Risk Assessment
    (supabase as any)
      .from('onboarding_risk_assessments')
      .select('risk_level, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle(),

    // Generated policy documents (AI-generated policies tracked by the platform)
    (supabase as any)
      .from('generated_policy_documents')
      .select('policy_id, last_generated_at, generation_count')
      .eq('organization_id', org.id)
      .order('last_generated_at', { ascending: false }),

    // Vendors
    (supabase as any)
      .from('vendors')
      .select('*')
      .eq('organization_id', org.id)
      .order('vendor_name', { ascending: true }),

    // Training Records
    (supabase as any)
      .from('training_records')
      .select('*')
      .eq('user_id', user.id)
      .order('training_date', { ascending: false }),

    // Incident Logs
    (supabase as any)
      .from('incident_logs')
      .select('*')
      .eq('organization_id', org.id)
      .order('date_discovered', { ascending: false }),

    // Breach Notifications — full data for complete letter export
    (supabase as any)
      .from('breach_notifications')
      .select('id, created_at, individuals_affected, breach_type, breach_discovery_date, breach_occurred_date, breach_description, status, breach_id, patient_letter_content, hhs_letter_content, media_letter_content')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false }),

    // Compliance Evidence
    (supabase as any)
      .from('compliance_evidence')
      .select('id, title, evidence_type_id, status, created_at')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
  ]);

  // Build policy list with document status
  const HIPAA_POLICIES = [
    { id: 1, name: 'HIPAA Security & Privacy Master Policy' },
    { id: 2, name: 'Security Risk Analysis (SRA) Policy' },
    { id: 3, name: 'Risk Management Plan' },
    { id: 4, name: 'Access Control Policy' },
    { id: 5, name: 'Workforce Training Policy' },
    { id: 6, name: 'Sanction Policy' },
    { id: 7, name: 'Incident Response & Breach Notification' },
    { id: 8, name: 'Business Associate Management' },
    { id: 9, name: 'Audit Logs & Documentation Retention' }
  ];

  const generatedMap = new Map<number, { lastGeneratedAt: string; generationCount: number }>();
  if (policyAttachmentsResult.data) {
    for (const row of policyAttachmentsResult.data) {
      generatedMap.set(row.policy_id, {
        lastGeneratedAt: row.last_generated_at,
        generationCount: row.generation_count
      });
    }
  }

  const policies = HIPAA_POLICIES.map((p) => {
    const gen = generatedMap.get(p.id);
    return {
      id: p.id,
      name: p.name,
      hasDocument: generatedMap.has(p.id),
      lastUpdated: gen?.lastGeneratedAt,
      generationCount: gen?.generationCount ?? 0
    };
  });

  // Calculate compliance score
  const policiesWithDocs = policies.filter((p) => p.hasDocument).length;
  const totalPolicies = policies.length;
  const hasRisk = !!riskAssessmentResult.data?.risk_level;
  const hasTraining = (trainingResult.data?.length || 0) > 0;
  const hasVendors = (vendorsResult.data?.length || 0) > 0;
  const vendorsBAACompliant =
    hasVendors
      ? (vendorsResult.data?.filter((v: any) => !v.has_phi_access || v.baa_signed).length || 0) /
        (vendorsResult.data?.length || 1)
      : 1;

  const scoreComponents = [
    (policiesWithDocs / totalPolicies) * 40, // Policies = 40%
    hasRisk ? 25 : 0, // Risk assessment = 25%
    hasTraining ? 20 : 0, // Training = 20%
    vendorsBAACompliant * 15 // Vendor BAA = 15%
  ];
  const complianceScore = Math.round(scoreComponents.reduce((a, b) => a + b, 0));

  const orgAny = org as any;
  return {
    organization: {
      id: org.id,
      name: org.name || org.legal_name || 'Healthcare Organization',
      legal_name: org.legal_name ?? undefined,
      address_street: org.address_street ?? undefined,
      address_city: org.address_city ?? undefined,
      address_state: org.address_state ?? undefined,
      address_zip: org.address_zip ?? undefined,
      phone_number: orgAny.phone_number ?? undefined,
      email_address: orgAny.email_address ?? undefined,
      privacy_officer_name: org.privacy_officer_name ?? undefined,
      privacy_officer_email: org.privacy_officer_email ?? undefined,
      security_officer_name: org.security_officer_name || org.privacy_officer_name || undefined,
      security_officer_email: org.security_officer_email || org.privacy_officer_email || undefined,
      practice_type: orgAny.practice_type ?? undefined,
      npi: orgAny.npi ?? undefined,
      ein: orgAny.ein ?? undefined
    },
    riskAssessment: {
      exists: !!riskAssessmentResult.data,
      risk_level: riskAssessmentResult.data?.risk_level,
      created_at: riskAssessmentResult.data?.created_at,
      updated_at: riskAssessmentResult.data?.updated_at
    },
    policies,
    vendors: vendorsResult.data || [],
    trainingRecords: trainingResult.data || [],
    incidents: incidentsResult.data || [],
    breachNotifications: breachResult.data || [],
    evidence: evidenceResult.data || [],
    exportedAt: new Date().toISOString(),
    complianceScore
  };
}
