import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { 
  getAllComplianceEvidence, 
  getEvidenceStatistics,
  getEvidenceByFieldId,
  type ComplianceEvidence
} from '@/app/actions/compliance-evidence';
import { EvidenceFieldsGrid } from '@/components/evidence/evidence-fields-grid';
import { EVIDENCE_FIELDS } from '@/lib/evidence-fields-config';

export default async function EvidencePage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const evidence = await getAllComplianceEvidence();
  const stats = await getEvidenceStatistics();
  
  const evidenceByFieldId: Record<string, ComplianceEvidence[]> = {};
  for (const field of EVIDENCE_FIELDS) {
    const fieldEvidence = await getEvidenceByFieldId(field.id);
    if (fieldEvidence.length > 0) {
      evidenceByFieldId[field.id] = fieldEvidence;
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Cisco Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h2 className="text-2xl font-light text-[#0e274e]">Evidence Center</h2>
          <p className="text-sm text-gray-400 font-light">
            Centralized evidence vault for HIPAA compliance
          </p>
        </div>
        <div className="text-right">
            <div className="text-3xl font-light text-[#0e274e]">{stats.total}</div>
            <div className="text-xs text-[#565656] font-light">Total Items</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#565656] mb-1 font-light">Valid</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.by_status.VALID || 0}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-[#71bc48]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#565656] mb-1 font-light">Review Needed</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.requires_review}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#565656] mb-1 font-light">Expiring Soon</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.expiring_soon}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#565656] mb-1 font-light">Expired</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.by_status.EXPIRED || 0}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-light text-[#0e274e]">About Evidence Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#565656] font-light leading-relaxed">
            Upload evidence here to automatically map it to HIPAA safeguards and policies. 
            This creates a defensible audit trail for your organization.
          </p>
        </CardContent>
      </Card>

      {/* Evidence Fields Grid */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
           <h3 className="text-lg font-light text-[#0e274e]">Evidence Upload Fields</h3>
           <p className="text-xs text-gray-400">Upload documents to specific requirement categories</p>
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
    </div>
  );
}
