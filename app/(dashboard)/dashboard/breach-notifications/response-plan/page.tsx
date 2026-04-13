'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';
import { ActionGate } from '@/components/action-gate';
import { useSubscription } from '@/contexts/subscription-context';
import {
  CheckCircle2, AlertTriangle, AlertCircle, Shield, Save, Lock,
  PenLine, ExternalLink, Info
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

interface BreachResponsePlan {
  id?: string;
  organization_id?: string;
  // 2.1
  privacy_officer_contact: string;
  monitored_systems: string;
  staff_reporting_method: string;
  staff_reporting_timeline: string;
  // 2.2
  privacy_officer_name: string;
  privacy_officer_title: string;
  privacy_officer_email: string;
  privacy_officer_phone: string;
  backup_contact: string;
  legal_counsel_contact: string;
  cyber_insurance_contact: string;
  // 2.3
  assessment_performer: string;
  assessment_timeline: string;
  assessment_factors: string;
  // 2.4
  ocr_notification_person: string;
  hhs_portal_location: string;
  // 2.5
  patient_notification_person: string;
  patient_notification_method: string;
  patient_letter_approved_date: string;
  // 2.6
  physical_records_location: string;
  backup_documentation_method: string;
  // Status
  plan_status: string;
  activated_by?: string;
  activated_at?: string;
  next_review_date?: string;
}

const DEFAULT_ASSESSMENT_FACTORS = `1. Nature and extent of PHI involved (sensitivity: mental health, SSN, DOB, diagnoses)
2. Who accessed or could have accessed the PHI (external unknown vs. internal authorized)
3. Whether the PHI was actually acquired or viewed (confirmed, unconfirmed, or demonstrably not viewed)
4. Extent to which the risk has been mitigated (containment, recovery, deletion confirmed)`;

const DEFAULT_PLAN: BreachResponsePlan = {
  privacy_officer_contact: '',
  monitored_systems: '',
  staff_reporting_method: '',
  staff_reporting_timeline: 'immediately',
  privacy_officer_name: '',
  privacy_officer_title: '',
  privacy_officer_email: '',
  privacy_officer_phone: '',
  backup_contact: '',
  legal_counsel_contact: '',
  cyber_insurance_contact: '',
  assessment_performer: '',
  assessment_timeline: 'within_72_hours',
  assessment_factors: DEFAULT_ASSESSMENT_FACTORS,
  ocr_notification_person: '',
  hhs_portal_location: '',
  patient_notification_person: '',
  patient_notification_method: 'first_class_mail',
  patient_letter_approved_date: '',
  physical_records_location: '',
  backup_documentation_method: '',
  plan_status: 'draft',
};

// ── Section header component ─────────────────────────────────────────────────

function SectionHeader({ number, title, guidance }: { number: string; title: string; guidance: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-[#00bceb] bg-blue-50 px-2 py-0.5 border border-blue-100">
          Section {number}
        </span>
        <h4 className="text-sm font-medium text-[#0e274e]">{title}</h4>
      </div>
      <p className="text-xs text-gray-400 font-light bg-gray-50 border border-gray-100 px-3 py-2">
        {guidance}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResponsePlanPage() {
  const { planTier } = useSubscription();
  const isTrialOrFree = planTier !== 'practice' && planTier !== 'clinic' && planTier !== 'enterprise';

  const [plan, setPlan] = useState<BreachResponsePlan>({ ...DEFAULT_PLAN, assessment_factors: DEFAULT_ASSESSMENT_FACTORS });
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => { if (!cancelled) setLoading(false); }, 8000);
    loadPlan().finally(() => { clearTimeout(timeoutId); });
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, []);

  async function loadPlan() {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data: org } = await supabase.from('organizations').select('id, name').eq('user_id', user.id).single();
      if (!org) { setLoading(false); return; }

      setUserName((org as any).name || '');

      const { data } = await (supabase as any)
        .from('breach_response_plan')
        .select('*')
        .eq('organization_id', org.id)
        .single();

      if (data) {
        setPlan({
          privacy_officer_contact:    data.privacy_officer_contact    || '',
          monitored_systems:          data.monitored_systems          || '',
          staff_reporting_method:     data.staff_reporting_method     || '',
          staff_reporting_timeline:   data.staff_reporting_timeline   || 'immediately',
          privacy_officer_name:       data.privacy_officer_name       || '',
          privacy_officer_title:      data.privacy_officer_title      || '',
          privacy_officer_email:      data.privacy_officer_email      || '',
          privacy_officer_phone:      data.privacy_officer_phone      || '',
          backup_contact:             data.backup_contact             || '',
          legal_counsel_contact:      data.legal_counsel_contact      || '',
          cyber_insurance_contact:    data.cyber_insurance_contact    || '',
          assessment_performer:       data.assessment_performer       || '',
          assessment_timeline:        data.assessment_timeline        || 'within_72_hours',
          assessment_factors:         data.assessment_factors         || DEFAULT_ASSESSMENT_FACTORS,
          ocr_notification_person:    data.ocr_notification_person    || '',
          hhs_portal_location:        data.hhs_portal_location        || '',
          patient_notification_person: data.patient_notification_person || '',
          patient_notification_method: data.patient_notification_method || 'first_class_mail',
          patient_letter_approved_date: data.patient_letter_approved_date || '',
          physical_records_location:  data.physical_records_location  || '',
          backup_documentation_method: data.backup_documentation_method || '',
          plan_status:    data.plan_status    || 'draft',
          activated_by:   data.activated_by   || undefined,
          activated_at:   data.activated_at   || undefined,
          next_review_date: data.next_review_date || undefined,
        });
        setPlanId(data.id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getOrgId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data: org } = await supabase.from('organizations').select('id').eq('user_id', user.id).single();
    return org?.id ?? null;
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const supabase = createClient();
      const orgId = await getOrgId();
      if (!orgId) return;

      const payload = { ...plan, organization_id: orgId, updated_at: new Date().toISOString() };
      if (planId) {
        await (supabase as any).from('breach_response_plan').update(payload).eq('id', planId);
      } else {
        const { data } = await (supabase as any).from('breach_response_plan').insert(payload).select('id').single();
        if (data) setPlanId(data.id);
      }
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function activatePlan() {
    setActivating(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const orgId = await getOrgId();
      if (!orgId) return;

      const now = new Date();
      const reviewDate = new Date(now);
      reviewDate.setFullYear(reviewDate.getFullYear() + 1);

      // First save any unsaved changes
      const payload = {
        ...plan,
        organization_id: orgId,
        plan_status: 'active',
        activated_by: user.email || user.id,
        activated_at: now.toISOString(),
        next_review_date: reviewDate.toISOString().split('T')[0],
        updated_at: now.toISOString(),
      };

      if (planId) {
        await (supabase as any).from('breach_response_plan').update(payload).eq('id', planId);
      } else {
        const { data } = await (supabase as any).from('breach_response_plan').insert(payload).select('id').single();
        if (data) setPlanId(data.id);
      }

      // Auto-create annual review calendar event
      await (supabase as any).from('compliance_calendar_events').insert({
        org_id: orgId,
        title: 'Breach Response Plan — Annual Review',
        event_type: 'policy_review',
        status: 'upcoming',
        due_date: reviewDate.toISOString().split('T')[0],
        source_type: 'breach_response_plan',
        recurrence: 'annual',
        is_auto_generated: true,
        notes: 'Annual review required for HIPAA-compliant breach response plan. Review and update all contact information, procedures, and policy details.',
      });

      setPlan(prev => ({
        ...prev,
        plan_status: 'active',
        activated_by: user.email || user.id,
        activated_at: now.toISOString(),
        next_review_date: reviewDate.toISOString().split('T')[0],
      }));

      toast.success('Breach Response Plan activated — annual review added to Compliance Calendar');
    } catch {
      toast.error('Failed to activate plan. Please try again.');
    } finally {
      setActivating(false);
    }
  }

  const p = (field: keyof BreachResponsePlan) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setPlan(prev => ({ ...prev, [field]: e.target.value }));

  const s = (field: keyof BreachResponsePlan) =>
    (value: string) => setPlan(prev => ({ ...prev, [field]: value }));

  if (loading) return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">Loading...</p>
      </div>
    </div>
  );

  const isActive = plan.plan_status === 'active';
  const hasPlan  = !!planId;
  const activatedDate = plan.activated_at ? new Date(plan.activated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  const nextReviewDate = plan.next_review_date ? new Date(plan.next_review_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">Manage breach notifications, incident logs, and compliance documentation</p>
      </div>

      <BreachNavigation />

      {/* Page header with status badge */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-light text-[#0e274e]">Breach Response Plan</h3>
          <p className="text-sm text-gray-400 font-light">
            A living document your practice must have on file before a breach occurs. Required by HIPAA.
          </p>
        </div>
        <div className="shrink-0">
          {!hasPlan ? (
            <Badge className="bg-red-50 text-red-700 border-red-200 rounded-none px-3 py-1.5 text-xs">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
              No breach response plan on file
            </Badge>
          ) : isActive ? (
            <Badge className="bg-green-50 text-green-700 border-green-200 rounded-none px-3 py-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Active plan — last reviewed {activatedDate}
            </Badge>
          ) : (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 rounded-none px-3 py-1.5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Draft — not yet activated
            </Badge>
          )}
        </div>
      </div>

      {/* Signed-by info */}
      {isActive && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700">
          <PenLine className="h-4 w-4 shrink-0" />
          <span>
            Signed and activated by <strong>{plan.activated_by}</strong> on {activatedDate}.
            {nextReviewDate && <> Annual review due: <strong>{nextReviewDate}</strong>.</>}
          </span>
        </div>
      )}

      <div className="space-y-6">

        {/* ── Section 2.1 ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              number="2.1"
              title="How We Detect Breaches"
              guidance="OCR expects practices to have monitoring mechanisms in place. Document how your practice identifies potential breaches."
            />
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Designated Privacy Officer — Name and Contact</Label>
              <Input value={plan.privacy_officer_contact} onChange={p('privacy_officer_contact')}
                placeholder="e.g. Jane Smith, Privacy Officer — jane@clinic.com / 555-0100"
                className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Systems We Monitor for Unauthorized Access</Label>
              <Textarea value={plan.monitored_systems} onChange={p('monitored_systems')} rows={3}
                placeholder="e.g. EHR audit logs reviewed monthly, email access logs, scheduling system access reports"
                className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">How Staff Report Suspected Incidents</Label>
              <Textarea value={plan.staff_reporting_method} onChange={p('staff_reporting_method')} rows={3}
                placeholder="e.g. Direct call or email to Privacy Officer, report form in EHR, in-person report to clinic manager"
                className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">How Quickly Staff Must Report After Discovering an Incident</Label>
              <Select value={plan.staff_reporting_timeline} onValueChange={s('staff_reporting_timeline')}>
                <SelectTrigger className="rounded-none text-[#0c0b1d]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="same_day">Same day</SelectItem>
                  <SelectItem value="within_24_hours">Within 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2.2 ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              number="2.2"
              title="Who Coordinates the Response"
              guidance="HIPAA requires a designated Privacy Officer responsible for breach response. This must be a specific named individual."
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#0c0b1d] font-light text-sm">Privacy Officer Name</Label>
                <Input value={plan.privacy_officer_name} onChange={p('privacy_officer_name')}
                  placeholder="Full legal name" className="rounded-none text-[#0c0b1d]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0c0b1d] font-light text-sm">Title</Label>
                <Input value={plan.privacy_officer_title} onChange={p('privacy_officer_title')}
                  placeholder="e.g. Privacy Officer, Compliance Officer, Practice Owner"
                  className="rounded-none text-[#0c0b1d]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0c0b1d] font-light text-sm">Email</Label>
                <Input type="email" value={plan.privacy_officer_email} onChange={p('privacy_officer_email')}
                  placeholder="privacy@clinic.com" className="rounded-none text-[#0c0b1d]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0c0b1d] font-light text-sm">Phone</Label>
                <Input value={plan.privacy_officer_phone} onChange={p('privacy_officer_phone')}
                  placeholder="Direct phone number" className="rounded-none text-[#0c0b1d]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Backup Contact (if Privacy Officer is unavailable)</Label>
              <Input value={plan.backup_contact} onChange={p('backup_contact')}
                placeholder="Name, title, and contact info" className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Legal Counsel Contact (if applicable)</Label>
              <Input value={plan.legal_counsel_contact} onChange={p('legal_counsel_contact')}
                placeholder="Attorney name and phone/email" className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Cyber Insurance Contact (if applicable)</Label>
              <Input value={plan.cyber_insurance_contact} onChange={p('cyber_insurance_contact')}
                placeholder="Carrier name, policy number, and claims contact" className="rounded-none text-[#0c0b1d]" />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2.3 ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              number="2.3"
              title="How We Assess Severity"
              guidance="Severity determines notification obligations. Document your assessment process."
            />
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Who Performs the Breach Risk Assessment</Label>
              <Input value={plan.assessment_performer} onChange={p('assessment_performer')}
                placeholder="e.g. Privacy Officer in consultation with legal counsel"
                className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Target Timeline for Completing Assessment</Label>
              <Select value={plan.assessment_timeline} onValueChange={s('assessment_timeline')}>
                <SelectTrigger className="rounded-none text-[#0c0b1d]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="within_24_hours">Within 24 hours</SelectItem>
                  <SelectItem value="within_48_hours">Within 48 hours</SelectItem>
                  <SelectItem value="within_72_hours">Within 72 hours</SelectItem>
                  <SelectItem value="within_1_week">Within 1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Factors We Consider (4-factor OCR test)</Label>
              <Textarea value={plan.assessment_factors} onChange={p('assessment_factors')} rows={5}
                className="rounded-none text-[#0c0b1d]" />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2.4 ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              number="2.4"
              title="How We Notify OCR"
              guidance="If 500 or more patients are affected, you must notify OCR within 72 hours via the HHS web portal. If fewer than 500 are affected, report annually by March 1 of the following year."
            />
            <div className="flex items-center gap-2 text-xs text-[#0175a2] bg-blue-50 border border-blue-100 px-3 py-2">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span>HHS Breach Reporting Portal: <strong>hhs.gov/hipaa/for-professionals/breach-notification</strong></span>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Person Responsible for OCR Notification</Label>
              <Input value={plan.ocr_notification_person} onChange={p('ocr_notification_person')}
                placeholder="Name and title" className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">HHS Portal Login Credentials Stored At</Label>
              <Input value={plan.hhs_portal_location} onChange={p('hhs_portal_location')}
                placeholder="e.g. Practice management password manager, Privacy Officer's secure files"
                className="rounded-none text-[#0c0b1d]" />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2.5 ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              number="2.5"
              title="How We Notify Patients"
              guidance="Patient notification letters must include: description of the breach, types of PHI involved, steps individuals should take to protect themselves, what the practice is doing to investigate and prevent future incidents, and contact information for questions."
            />
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Person Responsible for Patient Notifications</Label>
              <Input value={plan.patient_notification_person} onChange={p('patient_notification_person')}
                placeholder="Name and title" className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Preferred Notification Method</Label>
              <Select value={plan.patient_notification_method} onValueChange={s('patient_notification_method')}>
                <SelectTrigger className="rounded-none text-[#0c0b1d]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_class_mail">First class mail</SelectItem>
                  <SelectItem value="email">Email (if patient authorized)</SelectItem>
                  <SelectItem value="both">Both mail and email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Template Letter Reviewed and Approved (date)</Label>
              <Input type="date" value={plan.patient_letter_approved_date} onChange={p('patient_letter_approved_date')}
                className="rounded-none text-[#0c0b1d]" />
              <p className="text-xs text-gray-400">Use the Generate Patient Letter button in the incident log when an incident occurs.</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2.6 ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 space-y-4">
            <SectionHeader
              number="2.6"
              title="How We Document Everything"
              guidance=""
            />
            <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600 font-light space-y-1">
              <p>All breach documentation must be retained for <strong>6 years</strong> from the date of creation or last effect.</p>
              <p>HIPAA Hub automatically stores all incident records, notification logs, and generated documents in your Evidence Center. Export your full breach documentation using the Audit Export feature.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Physical Records Storage Location (if any)</Label>
              <Input value={plan.physical_records_location} onChange={p('physical_records_location')}
                placeholder="e.g. Locked filing cabinet in Privacy Officer's office"
                className="rounded-none text-[#0c0b1d]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0c0b1d] font-light text-sm">Backup Documentation Method</Label>
              <Input value={plan.backup_documentation_method} onChange={p('backup_documentation_method')}
                placeholder="e.g. Encrypted cloud backup, HIPAA Hub Evidence Center export"
                className="rounded-none text-[#0c0b1d]" />
            </div>
          </CardContent>
        </Card>

        {/* ── Save / Activate ── */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-[#0e274e] mb-1">
                  {isActive ? 'Plan is Active' : 'Save and Activate Your Plan'}
                </h4>
                <p className="text-xs text-gray-400 font-light">
                  {isActive
                    ? `Activated by ${plan.activated_by} on ${activatedDate}. Next annual review: ${nextReviewDate}.`
                    : 'Activating the plan records your electronic signature and adds an annual review reminder to your Compliance Calendar.'}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button onClick={saveDraft} disabled={saving} variant="outline"
                  className="rounded-none border-gray-300 text-[#565656] text-sm">
                  {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Draft</>}
                </Button>
                {!isActive && (
                  <ActionGate isLocked={isTrialOrFree} documentType="Breach Response Plan Activation">
                    <Button onClick={activatePlan} disabled={activating}
                      className="rounded-none bg-[#0e274e] text-white hover:bg-[#1a3a6b] text-sm">
                      {activating ? 'Activating...' : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Activate Plan
                          {isTrialOrFree && <Lock className="h-3.5 w-3.5 ml-1.5" />}
                        </>
                      )}
                    </Button>
                  </ActionGate>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
