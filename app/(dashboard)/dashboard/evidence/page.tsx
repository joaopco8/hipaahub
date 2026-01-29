import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  File as GenericFileIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  Archive,
  BarChart3,
  FileCheck
} from 'lucide-react';
import { 
  getAllComplianceEvidence, 
  getEvidenceStatistics,
  getEvidenceByFieldId,
  type ComplianceEvidence,
  type EvidenceStatus,
  type EvidenceType,
  type HIPAACategory
} from '@/app/actions/compliance-evidence';
import { EvidenceCenterClient } from '@/components/evidence/evidence-center-client';
import { EvidenceFieldsGrid } from '@/components/evidence/evidence-fields-grid';
import { EVIDENCE_FIELDS } from '@/lib/evidence-fields-config';

export default async function EvidencePage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Load all compliance evidence
  const evidence = await getAllComplianceEvidence();
  const stats = await getEvidenceStatistics();
  
  // Load evidence by field_id for each field
  const evidenceByFieldId: Record<string, ComplianceEvidence[]> = {};
  for (const field of EVIDENCE_FIELDS) {
    const fieldEvidence = await getEvidenceByFieldId(field.id);
    if (fieldEvidence.length > 0) {
      evidenceByFieldId[field.id] = fieldEvidence;
    }
  }

  // Get user details for display
  const { data: userDetails } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  const userName = userDetails?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="flex w-full flex-col gap-6 page-transition-premium">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Evidence Center</h1>
          <p className="text-zinc-600 text-base mt-1">
            Centralized, audit-grade evidence vault for HIPAA compliance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
            <div className="text-sm text-zinc-600">Total Evidence</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium-enter stagger-item">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Valid Evidence</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.by_status.VALID || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium-enter stagger-item" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Requires Review</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.requires_review}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium-enter stagger-item" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.expiring_soon}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium-enter stagger-item" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Expired</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.by_status.EXPIRED || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="card-premium-enter stagger-item">
        <CardHeader>
          <CardTitle>Why Evidence Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600">
            The Evidence Center is your centralized, audit-grade evidence vault. All evidence uploaded here 
            is automatically mapped to HIPAA safeguards, risk assessment questions, and policy documents. 
            When you generate your HIPAA policies, evidence references are automatically injected, making 
            your organization defensible in an OCR audit. Evidence can be uploaded independently of the 
            onboarding flow, allowing you to continuously build your compliance evidence library.
          </p>
        </CardContent>
      </Card>

      {/* Evidence Fields Grid - All 48 Fields */}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Evidence Upload Fields</h2>
            <p className="text-zinc-600 text-base mt-1">
              Upload evidence for each field to support your HIPAA compliance. Required fields are marked.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-900">{EVIDENCE_FIELDS.length}</div>
            <div className="text-sm text-zinc-600">Total Fields</div>
          </div>
        </div>

        <EvidenceFieldsGrid 
          existingEvidence={evidence
            .filter(ev => ev.evidence_field_id)
            .map(ev => ({
              field_id: ev.evidence_field_id!,
              uploaded: true
            }))}
          evidenceByFieldId={evidenceByFieldId}
        />
      </div>

      {/* Existing Evidence List */}
      <div className="space-y-6 mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Uploaded Evidence</h2>
        </div>
        <EvidenceCenterClient 
          initialEvidence={evidence}
          userName={userName}
        />
      </div>
    </div>
  );
}



